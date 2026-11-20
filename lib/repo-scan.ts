// Checks a learner's public GitHub repository for the framework-setup assignment.
// `evaluateRepo` is pure (a file listing plus a reader), so it can be tested without the network.

export type RepoCheck = { ok: boolean; message: string; found: string[] };
export type RepoResult = {
  "repo-config": RepoCheck;
  "repo-ignore": RepoCheck;
  "repo-ci": RepoCheck;
};

export type RepoSnapshot = {
  paths: string[];
  read: (path: string) => Promise<string | null>;
};

export const REQUIRED_KEYS = ["BASE_URL", "DEMO_EMAIL", "DEMO_PASSWORD"] as const;

const CONFIG_RE = /(^|\/)(playwright|cypress)\.config\.(ts|js|mjs|cjs|mts|cts)$/;
const ENV_USE_RE = /process\.env|dotenv|Cypress\.env|loadEnv|\benv\s*:/;
const WORKFLOW_RE = /^\.github\/workflows\/[^/]+\.ya?ml$/;
const EXAMPLE_RE = /(^|\/)\.env\.(example|sample|template)$/;
const REAL_ENV_RE = /(^|\/)\.env(\.(local|development|production|test|staging))?$/;
const TEXT_EXT_RE = /\.(ts|tsx|js|jsx|mjs|cjs|json|ya?ml|md|txt|env|example|sample|template)$/i;
const SKIP_RE = /(^|\/)(node_modules|dist|build|playwright-report|test-results|\.next)\/|package-lock\.json$|pnpm-lock\.yaml$|yarn\.lock$/;
const MAX_LEAK_FILES = 40;

const hasIgnoreRule = (gitignore: string) =>
  gitignore
    .split(/\r?\n/)
    .map((l) => l.trim())
    .some((l) => /^\/?\*?\.env(\*|\.\*|\.local)?$/.test(l) || l === "*.env");

const keysOf = (text: string) =>
  new Set(
    text
      .split(/\r?\n/)
      .map((l) => /^\s*(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=/.exec(l)?.[1])
      .filter((k): k is string => Boolean(k)),
  );

export async function evaluateRepo(snap: RepoSnapshot, demoPassword: string): Promise<RepoResult> {
  const paths = snap.paths.filter((p) => !SKIP_RE.test(p));

  // Anywhere the demo password appears in a text file means it was hard-coded.
  const leakFiles: string[] = [];
  const candidates = paths.filter((p) => TEXT_EXT_RE.test(p)).slice(0, MAX_LEAK_FILES);
  const texts = new Map<string, string>();
  await Promise.all(
    candidates.map(async (p) => {
      const t = await snap.read(p);
      if (t !== null) texts.set(p, t);
    }),
  );
  for (const [p, t] of texts) if (demoPassword && t.includes(demoPassword)) leakFiles.push(p);
  const get = async (p: string) => texts.get(p) ?? (await snap.read(p));

  // 1) config reads values from the environment
  const configs = paths.filter((p) => CONFIG_RE.test(p));
  let configOk: string | null = null;
  for (const c of configs) if (ENV_USE_RE.test((await get(c)) ?? "")) { configOk = c; break; }
  const config: RepoCheck = configOk
    ? { ok: true, message: `${configOk} reads values from the environment.`, found: [configOk] }
    : {
        ok: false,
        message: configs.length
          ? `${configs[0]} does not read from the environment. Use process.env (with dotenv) or Cypress.env.`
          : "No playwright.config or cypress.config file found in the repository.",
        found: configs,
      };

  // 2) .env ignored and not committed, .env.example committed with the keys and no password
  const committedEnv = paths.filter((p) => REAL_ENV_RE.test(p));
  const gitignore = (await get(".gitignore")) ?? "";
  const examples = paths.filter((p) => EXAMPLE_RE.test(p));
  const problems: string[] = [];
  if (committedEnv.length) problems.push(`${committedEnv[0]} is committed — remove it from git (git rm --cached) and ignore it.`);
  if (!hasIgnoreRule(gitignore)) problems.push(".gitignore does not list .env.");
  if (!examples.length) problems.push("No .env.example file is committed.");
  else {
    const ex = (await get(examples[0])) ?? "";
    const keys = keysOf(ex);
    const missing = REQUIRED_KEYS.filter((k) => !keys.has(k));
    if (missing.length) problems.push(`${examples[0]} is missing ${missing.join(", ")}.`);
  }
  if (leakFiles.length) problems.push(`The demo password appears in ${leakFiles[0]} — keep it only in .env and GitHub secrets.`);
  const ignore: RepoCheck = problems.length
    ? { ok: false, message: problems[0], found: [...committedEnv, ...leakFiles] }
    : { ok: true, message: ".env is ignored, not committed, and .env.example lists the keys.", found: examples };

  // 3) a workflow runs the tests with repository secrets
  const workflows = paths.filter((p) => WORKFLOW_RE.test(p));
  let ciOk: string | null = null;
  let ciNote = "";
  for (const w of workflows) {
    const t = (await get(w)) ?? "";
    const secretRefs = new Set([...t.matchAll(/secrets\.([A-Za-z_][A-Za-z0-9_]*)/g)].map((m) => m[1]));
    const runsTests = /playwright|cypress|npm (run )?test|npx /i.test(t);
    if (demoPassword && t.includes(demoPassword)) { ciNote = `${w} contains the demo password in plain text.`; continue; }
    if (!runsTests) { ciNote = ciNote || `${w} does not run your tests.`; continue; }
    if (secretRefs.size < 2) { ciNote = `${w} runs the tests but uses fewer than 2 values from secrets.* (add BASE_URL / DEMO_PASSWORD as repository secrets).`; continue; }
    ciOk = w;
    break;
  }
  const ci: RepoCheck = ciOk
    ? { ok: true, message: `${ciOk} runs your tests with repository secrets.`, found: [ciOk] }
    : { ok: false, message: workflows.length ? ciNote : "No workflow found in .github/workflows/.", found: workflows };

  return { "repo-config": config, "repo-ignore": ignore, "repo-ci": ci };
}

// ---- GitHub access -------------------------------------------------------------------------

export type ParsedRepo = { owner: string; repo: string };

export function parseRepoUrl(input: string): ParsedRepo | null {
  const m = /^https:\/\/github\.com\/([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))\/([A-Za-z0-9._-]{1,100}?)(?:\.git)?(?:\/.*)?$/.exec(input.trim());
  if (!m || m[2] === "." || m[2] === "..") return null;
  return { owner: m[1], repo: m[2] };
}

export class RepoError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const GH_HEADERS = (): Record<string, string> => ({
  Accept: "application/vnd.github+json",
  "User-Agent": "thedappled-assignment-check",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
});

// Overridable so tests can point the scan at a fake GitHub.
const API = () => process.env.GITHUB_API_URL || "https://api.github.com";
const RAW = () => process.env.GITHUB_RAW_URL || "https://raw.githubusercontent.com";

async function gh<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: GH_HEADERS(), cache: "no-store", signal: AbortSignal.timeout(10_000) });
  if (res.status === 404) throw new RepoError("Repository not found. It must be public.", 404);
  if (res.status === 403 || res.status === 429) throw new RepoError("GitHub is rate-limiting checks right now. Try again in a few minutes.", 429);
  if (!res.ok) throw new RepoError("Could not read the repository from GitHub.", 502);
  return (await res.json()) as T;
}

export async function loadRepo({ owner, repo }: ParsedRepo): Promise<{ snapshot: RepoSnapshot; branch: string }> {
  const meta = await gh<{ default_branch: string; private?: boolean }>(`${API()}/repos/${owner}/${repo}`);
  const branch = meta.default_branch;
  const tree = await gh<{ tree: { path: string; type: string; size?: number }[] }>(
    `${API()}/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
  );
  const files = tree.tree.filter((n) => n.type === "blob");
  const sizes = new Map(files.map((f) => [f.path, f.size ?? 0]));
  return {
    branch,
    snapshot: {
      paths: files.map((f) => f.path),
      read: async (path) => {
        if ((sizes.get(path) ?? 0) > 200_000) return null;
        const url = `${RAW()}/${owner}/${repo}/${encodeURIComponent(branch)}/${path.split("/").map(encodeURIComponent).join("/")}`;
        const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(10_000) }).catch(() => null);
        return res && res.ok ? await res.text() : null;
      },
    },
  };
}
