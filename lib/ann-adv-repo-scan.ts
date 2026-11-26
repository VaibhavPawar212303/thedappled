// Checks a learner's public GitHub repository for the advanced annotations assignment (stage 6, Playwright only).
// `evaluateAdvancedRepo` is pure (a file listing plus a reader), so it can be tested without the network.

import { SKIP_RE, type RepoCheck, type RepoSnapshot } from "@/lib/repo-scan";

export type AdvancedRepoResult = {
  "repo-skip-callback": RepoCheck;
  "repo-fixme-hook": RepoCheck;
  "repo-declared-skip": RepoCheck;
  "repo-grep-combine": RepoCheck;
};

const PW_CONFIG_RE = /(^|\/)playwright\.config\.(ts|js|mjs|cjs|mts|cts)$/;
const SPEC_RE = /\.(spec|test)\.(ts|js|mjs|cjs|mts|cts|tsx|jsx)$/;
const WORKFLOW_RE = /^\.github\/workflows\/[^/]+\.ya?ml$/;
const PACKAGE_RE = /(^|\/)package\.json$/;

const stripComments = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
const stripYamlComments = (t: string) => t.replace(/(^|\s)#.*$/gm, "$1");

// test.skip(({ browserName }) => …, 'why') — the callback form, which skips every test in its describe block.
const SKIP_CALLBACK_RE = /\btest\.skip\(\s*(?:async\s*)?\(\s*\{[^}]*\}\s*\)\s*=>/;
// test.fixme(…) inside a test.beforeEach hook.
const FIXME_HOOK_RE = /\btest\.beforeEach\(\s*(?:["'`][^"'`]*["'`]\s*,\s*)?async\s*\([^)]*\)\s*=>\s*\{[\s\S]{0,600}?\btest\.fixme\(/;
// test.skip('title', async …) — a test declared as skipped.
const DECLARED_SKIP_RE = /\btest\.skip\(\s*(["'`])[^"'`\n]*\1\s*,\s*(?:\{[\s\S]{0,300}?\}\s*,\s*)?async\b/;
const DESCRIBE_ANNOTATION_RE = /\btest\.describe(?:\.\w+)?\(\s*(["'`])[\s\S]*?\1\s*,\s*\{[\s\S]{0,300}?\bannotation\s*:/;
// --grep with OR ("@a|@b", also escaped as @a^|@b) or AND ("(?=.*@a)(?=.*@b)").
const GREP_COMBINE_RE = /(?:--grep|-g)(?:\s+--%)?(?:\s+|=)["']?[^"'\n]*?(?:@[\w-]+\^?\|@[\w-]+|\(\?=\.\*@[\w-]+\)\s*\(\?=\.\*@)/;
const CONFIG_GREP_COMBINE_RE = /\bgrep\s*:\s*\/[^/\n]*(?:@[\w-]+\|@[\w-]+|\(\?=\.\*@[\w-]+\)\(\?=\.\*@)/;

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

export async function evaluateAdvancedRepo(snap: RepoSnapshot): Promise<AdvancedRepoResult> {
  const paths = snap.paths.filter((p) => !SKIP_RE.test(p));
  const configs = paths.filter((p) => PW_CONFIG_RE.test(p)).slice(0, 5);
  const specs = paths.filter((p) => SPEC_RE.test(p)).slice(0, 80);
  const workflows = paths.filter((p) => WORKFLOW_RE.test(p)).slice(0, 20);
  const packages = paths.filter((p) => PACKAGE_RE.test(p)).slice(0, 5);
  const texts = await readAll(snap, [...configs, ...specs, ...workflows, ...packages]);
  const code = (p: string) => stripComments(texts.get(p) ?? "");
  const yaml = (p: string) => stripYamlComments(texts.get(p) ?? "");
  const noSpecs: RepoCheck = { ok: false, message: "No spec files (*.spec.ts) found in the repository.", found: [] };

  // 1) the callback form of test.skip, inside a describe block
  const cb = specs.find((p) => SKIP_CALLBACK_RE.test(code(p)) && /\btest\.describe\b/.test(code(p)));
  const skipCallback: RepoCheck = !specs.length
    ? noSpecs
    : cb
      ? { ok: true, message: `${cb} skips a whole group with test.skip(({ … }) => …).`, found: [cb] }
      : { ok: false, message: "No group-level skip. Inside a describe block, add test.skip(({ browserName }) => browserName !== 'chromium', 'Chromium only').", found: [] };

  // 2) test.fixme inside a beforeEach hook
  const hook = specs.find((p) => FIXME_HOOK_RE.test(code(p)));
  const fixmeHook: RepoCheck = !specs.length
    ? noSpecs
    : hook
      ? { ok: true, message: `${hook} calls test.fixme in a beforeEach hook.`, found: [hook] }
      : { ok: false, message: "No test.fixme in a beforeEach hook. Add test.fixme(isMobile, 'Not on mobile yet') at the top of the Settings beforeEach.", found: [] };

  // 3) a declared skip and an annotated describe block
  const declared = specs.find((p) => DECLARED_SKIP_RE.test(code(p)));
  const annotated = specs.find((p) => DESCRIBE_ANNOTATION_RE.test(code(p)));
  const declaredSkip: RepoCheck = !specs.length
    ? noSpecs
    : declared && annotated
      ? { ok: true, message: `${declared} declares a skipped test; ${annotated} annotates a describe block.`, found: [declared, annotated] }
      : {
          ok: false,
          message: !declared
            ? "No declared skip. Write a test as test.skip('export to PDF', async ({ page }) => { … })."
            : "No describe block has an annotation. Use test.describe('reports', { annotation: { type: 'category', description: 'report' } }, () => { … }).",
          found: [declared, annotated].filter((p): p is string => Boolean(p)),
        };

  // 4) a run that combines tags with OR or AND: in a workflow, through an npm script, or in a project's grep
  const pwWorkflows = workflows.filter((w) => /playwright\s+test|npx\s+playwright|npm\s+(run\s+)?test|npm\s+run\s+[\w:-]+/i.test(yaml(w)));
  const direct = pwWorkflows.find((w) => GREP_COMBINE_RE.test(yaml(w)));
  const scripts: string[] = [];
  for (const p of packages) {
    try {
      const all = (JSON.parse(texts.get(p) ?? "{}") as { scripts?: Record<string, unknown> }).scripts ?? {};
      for (const [k, v] of Object.entries(all)) if (typeof v === "string" && GREP_COMBINE_RE.test(v)) scripts.push(k);
    } catch {}
  }
  const esc = (k: string) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const viaScript = pwWorkflows.find((w) => scripts.some((k) => new RegExp(`npm\\s+run\\s+${esc(k)}\\b`).test(yaml(w))));
  const projectGrep = configs.find((c) => CONFIG_GREP_COMBINE_RE.test(code(c)));
  const grep: RepoCheck = direct
    ? { ok: true, message: `${direct} combines tags in --grep.`, found: [direct] }
    : viaScript
      ? { ok: true, message: `${viaScript} runs npm run ${scripts[0]}, which combines tags in --grep.`, found: [viaScript] }
      : projectGrep && pwWorkflows.length
        ? { ok: true, message: `${projectGrep} has a project whose grep combines tags, and ${pwWorkflows[0]} runs Playwright.`, found: [projectGrep] }
        : !workflows.length
          ? { ok: false, message: "No workflow found in .github/workflows/.", found: [] }
          : { ok: false, message: "No run combines tags. Add a CI step like npx playwright test --grep \"@fast|@slow\".", found: workflows };

  return { "repo-skip-callback": skipCallback, "repo-fixme-hook": fixmeHook, "repo-declared-skip": declaredSkip, "repo-grep-combine": grep };
}
