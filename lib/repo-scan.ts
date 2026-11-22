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
const EXAMPLE_RE = /(^|\/)(\.env\.(example|sample|template|dist)|env\.example|example\.env)$/;
const GITIGNORE_RE = /(^|\/)\.gitignore$/;
const REAL_ENV_RE = /(^|\/)\.env(\.(local|development|production|test|staging))?$/;
const TEXT_EXT_RE = /\.(ts|tsx|js|jsx|mjs|cjs|json|ya?ml|md|txt|env|example|sample|template)$/i;
export const SKIP_RE = /(^|\/)(node_modules|dist|build|playwright-report|test-results|\.next)\/|package-lock\.json$|pnpm-lock\.yaml$|yarn\.lock$/;
const MAX_LEAK_FILES = 40;

// Files written by Windows tools (e.g. PowerShell's `echo > .env.example`) are often UTF-16, which
// reads as garbage if decoded as UTF-8. Detect that and decode properly; strip any BOM.
export function decodeText(buf: Uint8Array): string {
  const b = Buffer.from(buf);
  if (b.length >= 2 && b[0] === 0xff && b[1] === 0xfe) return b.subarray(2).toString("utf16le");
  if (b.length >= 2 && b[0] === 0xfe && b[1] === 0xff) return Buffer.from(b.subarray(2)).swap16().toString("utf16le");
  // No BOM: lots of NUL bytes in a short sample means UTF-16 without one.
  const sample = b.subarray(0, 200);
  const nuls = sample.reduce((n, x) => n + (x === 0 ? 1 : 0), 0);
  if (sample.length >= 4 && nuls > sample.length / 4) {
    const oddNuls = sample.reduce((n, x, i) => n + (x === 0 && i % 2 === 1 ? 1 : 0), 0);
    return oddNuls >= nuls / 2 ? b.toString("utf16le") : Buffer.from(b).swap16().toString("utf16le");
  }
  return b.toString("utf8").replace(/^\uFEFF/, "");
}

// Accepts the usual ways of ignoring a .env file: .env  /.env  **/.env  .env*  .env.*  *.env  *.env*
const hasIgnoreRule = (gitignore: string) =>
  gitignore
    .replace(/^\uFEFF/, "")
    .split(/\r\n|\r|\n/)
    .map((l) => l.trim())
    .some((l) => /^(\*\*\/)?\/?\*?\.env(\*|\.\*)?$/.test(l));

const keysOf = (text: string) =>
  new Set(
    text
      .split(/\r\n|\r|\n/)
      .map((l) => /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*[=:]/.exec(l)?.[1]?.toUpperCase())
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
  const gitignores = paths.filter((p) => GITIGNORE_RE.test(p));
  let ignored = false;
  for (const g of gitignores) if (hasIgnoreRule((await get(g)) ?? "")) { ignored = true; break; }
  const examples = paths.filter((p) => EXAMPLE_RE.test(p));
  const problems: string[] = [];
  if (committedEnv.length) problems.push(`${committedEnv[0]} is committed — remove it from git (git rm --cached) and ignore it.`);
  if (!ignored) problems.push(gitignores.length ? ".gitignore does not list .env (add a line: .env)." : "No .gitignore found — add one that lists .env.");

  let goodExample: string | null = null;
  if (!examples.length) {
    problems.push("No .env.example file is committed (looked for .env.example, .env.sample, .env.template).");
  } else {
    const notes: string[] = [];
    for (const e of examples) {
      const text = await get(e);
      if (text === null) { notes.push(`Couldn't read ${e} from GitHub just now — wait a minute and check again.`); continue; }
      const keys = keysOf(text);
      const missing = REQUIRED_KEYS.filter((k) => !keys.has(k));
      if (!missing.length) { goodExample = e; break; }
      notes.push(`${e} is missing ${missing.join(", ")}${keys.size ? ` (it has: ${[...keys].join(", ")})` : text.trim() ? " (no KEY=value lines found — write one per line, e.g. BASE_URL=)" : " (the file is empty)"}.`);
    }
    if (!goodExample) problems.push(notes[0]);
  }
  if (leakFiles.length) {
    const inExample = leakFiles.find((f) => EXAMPLE_RE.test(f));
    problems.push(
      inExample
        ? `${inExample} contains your real demo password — .env.example must list the keys only (DEMO_PASSWORD=).`
        : `The demo password appears in ${leakFiles[0]} — keep it only in .env and GitHub secrets.`,
    );
  }
  const ignore: RepoCheck = problems.length
    ? { ok: false, message: problems.join(" "), found: [...committedEnv, ...leakFiles] }
    : { ok: true, message: ".env is ignored, not committed, and .env.example lists the keys.", found: goodExample ? [goodExample] : [] };

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

type TreeNode = { path: string; type: string; size?: number; sha?: string };

export async function loadRepo({ owner, repo }: ParsedRepo): Promise<{ snapshot: RepoSnapshot; branch: string }> {
  const meta = await gh<{ default_branch: string; private?: boolean }>(`${API()}/repos/${owner}/${repo}`);
  const branch = meta.default_branch;
  // Pin everything to the branch's current commit: raw.githubusercontent caches branch URLs for a few
  // minutes, so a file pushed a moment ago could read as missing or old. A commit URL never goes stale.
  const refPath = branch.split("/").map(encodeURIComponent).join("/");
  const ref = await gh<{ object: { sha: string } }>(`${API()}/repos/${owner}/${repo}/git/ref/heads/${refPath}`);
  const commit = ref.object.sha;
  const tree = await gh<{ tree: TreeNode[] }>(`${API()}/repos/${owner}/${repo}/git/trees/${commit}?recursive=1`);
  const files = tree.tree.filter((n) => n.type === "blob");
  const byPath = new Map(files.map((f) => [f.path, f]));

  const viaRaw = async (path: string) => {
    const url = `${RAW()}/${owner}/${repo}/${commit}/${path.split("/").map(encodeURIComponent).join("/")}`;
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(10_000) }).catch(() => null);
    return res && res.ok ? decodeText(new Uint8Array(await res.arrayBuffer())) : null;
  };
  const viaBlob = async (sha: string) => {
    try {
      const b = await gh<{ content: string; encoding: string }>(`${API()}/repos/${owner}/${repo}/git/blobs/${sha}`);
      return b.encoding === "base64" ? decodeText(Buffer.from(b.content, "base64")) : b.content;
    } catch {
      return null;
    }
  };

  return {
    branch,
    snapshot: {
      paths: files.map((f) => f.path),
      read: async (path) => {
        const node = byPath.get(path);
        if (!node || (node.size ?? 0) > 200_000) return null;
        return (await viaRaw(path)) ?? (node.sha ? await viaBlob(node.sha) : null);
      },
    },
  };
}
