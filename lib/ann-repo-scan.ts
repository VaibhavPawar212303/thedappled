// Checks a learner's public GitHub repository for the annotations assignment (stage 5, Playwright only).
// `evaluateAnnotationsRepo` is pure (a file listing plus a reader), so it can be tested without the network.

import { SKIP_RE, type RepoCheck, type RepoSnapshot } from "@/lib/repo-scan";

export type AnnotationsRepoResult = {
  "repo-forbid-only": RepoCheck;
  "repo-grep-smoke": RepoCheck;
  "repo-describe-runtime": RepoCheck;
};

const PW_CONFIG_RE = /(^|\/)playwright\.config\.(ts|js|mjs|cjs|mts|cts)$/;
const SPEC_RE = /\.(spec|test)\.(ts|js|mjs|cjs|mts|cts|tsx|jsx)$/;
const SOURCE_RE = /\.(ts|js|mjs|cjs|mts|cts|tsx|jsx)$/;
const WORKFLOW_RE = /^\.github\/workflows\/[^/]+\.ya?ml$/;
const PACKAGE_RE = /(^|\/)package\.json$/;

const stripComments = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
const stripYamlComments = (t: string) => t.replace(/(^|\s)#.*$/gm, "$1");

// forbidOnly: !!process.env.CI, Boolean(process.env.CI), process.env.CI ? true : false, or plain true.
const FORBID_RE = /forbidOnly\s*:\s*(?:!!\s*process\.env\.CI\b|Boolean\(\s*process\.env\.CI\s*\)|process\.env\.CI\b|true\b)/;
// test.only, test.describe.only, test.fail.only, it.only, describe.only …
const ONLY_RE = /\b(?:test|it|describe)(?:\.\w+)*\.only\s*\(/;
const GREP_SMOKE_RE = /--grep(?:\s+|=)["']?@smoke\b|-g\s+["']?@smoke\b/;
const CONFIG_GREP_RE = /\bgrep\s*:\s*(?:\/[^/\n]*@smoke|["'`][^"'`\n]*@smoke)/;
const DESCRIBE_DETAILS_RE = /\btest\.describe(?:\.\w+)?\(\s*(["'`])[\s\S]*?\1\s*,\s*\{[\s\S]{0,300}?\b(?:tag|annotation)\s*:/;
const RUNTIME_RE = /(?:test\.info\(\s*\)|\btestInfo)\.annotations\.push\s*\(/;

async function readAll(snap: RepoSnapshot, paths: string[]) {
  const out = new Map<string, string>();
  await Promise.all(
    paths.map(async (p) => {
      const t = await snap.read(p);
      if (t !== null) out.set(p, t);
    }),
  );
  return out;
}

export async function evaluateAnnotationsRepo(snap: RepoSnapshot): Promise<AnnotationsRepoResult> {
  const paths = snap.paths.filter((p) => !SKIP_RE.test(p));
  const configs = paths.filter((p) => PW_CONFIG_RE.test(p)).slice(0, 5);
  const specs = paths.filter((p) => SPEC_RE.test(p)).slice(0, 80);
  // Runtime annotations may live in a fixture or helper, not only in spec files.
  const sources = paths.filter((p) => SOURCE_RE.test(p) && !SPEC_RE.test(p) && !PW_CONFIG_RE.test(p) && /(^|\/)(tests?|e2e|fixtures?|support|helpers?)\//.test(p)).slice(0, 40);
  const workflows = paths.filter((p) => WORKFLOW_RE.test(p)).slice(0, 20);
  const packages = paths.filter((p) => PACKAGE_RE.test(p)).slice(0, 5);
  const texts = await readAll(snap, [...configs, ...specs, ...sources, ...workflows, ...packages]);
  const code = (p: string) => stripComments(texts.get(p) ?? "");
  const yaml = (p: string) => stripYamlComments(texts.get(p) ?? "");

  // 1) forbidOnly in the config, and no .only left in any spec
  let forbid: RepoCheck;
  const forbidCfg = configs.find((c) => FORBID_RE.test(code(c)));
  const withOnly = specs.filter((p) => ONLY_RE.test(code(p)));
  if (!configs.length) forbid = { ok: false, message: "No playwright.config file found in the repository.", found: [] };
  else if (!forbidCfg) forbid = { ok: false, message: `${configs[0]} has no forbidOnly. Add forbidOnly: !!process.env.CI so a stray test.only fails in CI.`, found: configs };
  else if (withOnly.length) forbid = { ok: false, message: `${withOnly[0]} still has a .only. Remove it before you push.`, found: withOnly };
  else forbid = { ok: true, message: `${forbidCfg} sets forbidOnly, and no spec has a .only.`, found: [forbidCfg] };

  // 2) a @smoke subset: --grep @smoke in a workflow (directly or through an npm script), or a project with grep: /@smoke/
  let grep: RepoCheck;
  const pwWorkflows = workflows.filter((w) => /playwright\s+test|npx\s+playwright|npm\s+(run\s+)?test|npm\s+run\s+[\w:-]+/i.test(yaml(w)));
  const direct = pwWorkflows.find((w) => GREP_SMOKE_RE.test(yaml(w)));
  const smokeScripts: string[] = [];
  for (const p of packages) {
    try {
      const scripts = (JSON.parse(texts.get(p) ?? "{}") as { scripts?: Record<string, unknown> }).scripts ?? {};
      for (const [k, v] of Object.entries(scripts)) if (typeof v === "string" && GREP_SMOKE_RE.test(v)) smokeScripts.push(k);
    } catch {}
  }
  const viaScript = pwWorkflows.find((w) => smokeScripts.some((k) => new RegExp(`npm\\s+run\\s+${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(yaml(w))));
  const projectGrep = configs.find((c) => CONFIG_GREP_RE.test(code(c)));
  if (direct) grep = { ok: true, message: `${direct} runs only @smoke tests with --grep.`, found: [direct] };
  else if (viaScript) grep = { ok: true, message: `${viaScript} runs npm run ${smokeScripts[0]}, which uses --grep @smoke.`, found: [viaScript] };
  else if (projectGrep && pwWorkflows.length) grep = { ok: true, message: `${projectGrep} has a project with grep: @smoke, and ${pwWorkflows[0]} runs Playwright.`, found: [projectGrep] };
  else if (!workflows.length) grep = { ok: false, message: "No workflow found in .github/workflows/.", found: [] };
  else if (projectGrep) grep = { ok: false, message: `${projectGrep} has a @smoke project, but no workflow runs Playwright.`, found: [projectGrep] };
  else grep = { ok: false, message: "No @smoke run found. Add a CI step like npx playwright test --grep @smoke (or a project with grep: /@smoke/).", found: workflows };

  // 3) a describe block with a tag or annotation, and a runtime annotation
  const describeFile = specs.find((p) => DESCRIBE_DETAILS_RE.test(code(p)));
  const runtimeFile = [...specs, ...sources].find((p) => RUNTIME_RE.test(code(p)));
  let group: RepoCheck;
  if (describeFile && runtimeFile) group = { ok: true, message: `${describeFile} tags a describe block; ${runtimeFile} adds annotations at runtime.`, found: [describeFile, runtimeFile] };
  else if (!specs.length) group = { ok: false, message: "No spec files (*.spec.ts) found in the repository.", found: [] };
  else if (!describeFile)
    group = { ok: false, message: "No describe block has a tag or annotation. Use test.describe('cart', { tag: '@cart' }, () => { … }).", found: runtimeFile ? [runtimeFile] : [] };
  else group = { ok: false, message: `${describeFile} tags a describe block, but no test adds an annotation at runtime. Use test.info().annotations.push({ type, description }).`, found: [describeFile] };

  return { "repo-forbid-only": forbid, "repo-grep-smoke": grep, "repo-describe-runtime": group };
}
