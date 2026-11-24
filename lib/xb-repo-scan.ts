// Checks a learner's public GitHub repository for the cross-browser assignment (stage 4).
// `evaluateCrossBrowserRepo` is pure (a file listing plus a reader), so it can be tested without the network.

import { SKIP_RE, type RepoCheck, type RepoSnapshot } from "@/lib/repo-scan";
import { ENGINES, ENGINE_LABEL, type Engine } from "@/lib/browser-engine";
import { DEFAULT_TOOL, type Tool } from "@/lib/tools";

export type CrossBrowserRepoResult = {
  "repo-browsers": RepoCheck;
  "repo-ci-matrix": RepoCheck;
};

const PW_CONFIG_RE = /(^|\/)playwright\.config\.(ts|js|mjs|cjs|mts|cts)$/;
const CY_CONFIG_RE = /(^|\/)cypress\.config\.(ts|js|mjs|cjs|mts|cts)$/;
const WORKFLOW_RE = /^\.github\/workflows\/[^/]+\.ya?ml$/;
const PACKAGE_RE = /(^|\/)package\.json$/;

const stripComments = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
const stripYamlComments = (t: string) => t.replace(/(^|\s)#.*$/gm, "$1");

// How each engine shows up in a Playwright config: a project using it by name or a device preset.
const PW_ENGINE_RE: Record<Engine, RegExp> = {
  chromium: /\bchromium\b|Desktop Chrome|Desktop Edge|channel\s*:\s*['"](chrome|msedge)/i,
  firefox: /\bfirefox\b|Desktop Firefox/i,
  webkit: /\bwebkit\b|Desktop Safari|iPhone|iPad/i,
};
// How each engine shows up in a Cypress run: `--browser <name>` (or `browser: <name>` in a workflow).
const CY_ENGINE_RE: Record<Engine, RegExp> = {
  chromium: /--browser[\s=]+['"]?(chrome|chromium|edge|electron)\b|browser\s*:\s*['"]?(chrome|chromium|edge|electron)\b|\b(chrome|chromium|edge|electron)\b/i,
  firefox: /--browser[\s=]+['"]?firefox\b|\bfirefox\b/i,
  webkit: /--browser[\s=]+['"]?webkit\b|\bwebkit\b/i,
};

const missingIn = (text: string, res: Record<Engine, RegExp>) => ENGINES.filter((e) => !res[e].test(text));
const names = (es: Engine[]) => es.map((e) => ENGINE_LABEL[e]).join(", ");

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

// Each track only looks at its own tool's config files and CI runs.
export async function evaluateCrossBrowserRepo(snap: RepoSnapshot, tool: Tool = DEFAULT_TOOL): Promise<CrossBrowserRepoResult> {
  const paths = snap.paths.filter((p) => !SKIP_RE.test(p));
  const pwConfigs = tool === "playwright" ? paths.filter((p) => PW_CONFIG_RE.test(p)) : [];
  const cyConfigs = tool === "cypress" ? paths.filter((p) => CY_CONFIG_RE.test(p)) : [];
  const workflows = paths.filter((p) => WORKFLOW_RE.test(p)).slice(0, 20);
  const packages = paths.filter((p) => PACKAGE_RE.test(p)).slice(0, 5);
  const texts = await readAll(snap, [...pwConfigs, ...cyConfigs, ...workflows, ...packages]);
  const text = (p: string) => texts.get(p) ?? "";

  // 1) the config defines one project per browser engine
  let browsers: RepoCheck;
  let pwAllEngines = false;
  const pwNotes: string[] = [];
  for (const c of pwConfigs) {
    const t = stripComments(text(c));
    if (!/\bprojects\s*:/.test(t)) { pwNotes.push(`${c} has no projects: [...] list — add one project per browser.`); continue; }
    const missing = missingIn(t, PW_ENGINE_RE);
    if (!missing.length) { pwAllEngines = true; browsers = { ok: true, message: `${c} has chromium, firefox and webkit projects.`, found: [c] }; break; }
    pwNotes.push(`${c} has no project for ${names(missing)} (e.g. { name: 'webkit', use: { ...devices['Desktop Safari'] } }).`);
  }
  if (!pwAllEngines) {
    // Cypress: WebKit needs experimentalWebKitSupport, and the runs choose the browser on the command line.
    const cy = cyConfigs.find((c) => /experimentalWebKitSupport\s*:\s*true/.test(stripComments(text(c))));
    const scripts = [...packages, ...workflows].map((p) => text(p)).join("\n");
    const cyMissing = missingIn(scripts.match(/cypress[^\n]*|browser\s*:[^\n]*|matrix[\s\S]{0,400}/gi)?.join("\n") ?? "", CY_ENGINE_RE);
    if (cy && !cyMissing.length) {
      browsers = { ok: true, message: `${cy} enables WebKit and your scripts run Cypress on all three browsers.`, found: [cy] };
    } else if (cyConfigs.length && !pwConfigs.length) {
      browsers = {
        ok: false,
        message: !cy
          ? `${cyConfigs[0]} needs experimentalWebKitSupport: true (and npm i -D playwright-webkit) to run on WebKit.`
          : `Your scripts never run Cypress with --browser ${cyMissing.map((e) => (e === "chromium" ? "chrome" : e)).join(" / ")}.`,
        found: cyConfigs,
      };
    } else {
      browsers = {
        ok: false,
        message: pwNotes[0] ?? `No ${tool}.config file found in the repository (this is the ${tool === "cypress" ? "Cypress" : "Playwright"} track).`,
        found: pwConfigs,
      };
    }
  }

  // 2) a workflow runs the tests on all three engines
  let ciOk: string | null = null;
  let ciNote = "";
  for (const w of workflows) {
    const t = stripYamlComments(text(w));
    const pw = tool === "playwright" && /playwright\s+test|npm\s+(run\s+)?test|npx\s+playwright/i.test(t);
    const cy = tool === "cypress" && /cypress(\s+run|-io\/github-action)/i.test(t);
    if (!pw && !cy) { ciNote = ciNote || `${w} does not run your tests.`; continue; }

    if (pw) {
      // Narrowed runs: --project / --browser flags (or a matrix feeding them) must cover every engine.
      const narrowed = /--project[\s=]|--browser[\s=]/.test(t);
      const installOnly = /playwright\s+install(?:\s+--with-deps)?((?:\s+(?:chromium|firefox|webkit|chrome|msedge))+)/i.exec(t)?.[1] ?? "";
      const installMissing = installOnly ? missingIn(installOnly, PW_ENGINE_RE) : [];
      const flagsMissing = narrowed ? missingIn(t, PW_ENGINE_RE) : [];
      if (installMissing.length) { ciNote = `${w} only installs ${installOnly.trim()} — install all browsers (npx playwright install --with-deps).`; continue; }
      if (flagsMissing.length) { ciNote = `${w} doesn't run ${names(flagsMissing)}. Add a browser matrix or drop --project.`; continue; }
      if (!narrowed && !pwAllEngines) { ciNote = `${w} runs every project, but your config doesn't have all three browsers yet.`; continue; }
      ciOk = w;
      break;
    }
    const missing = missingIn(t, CY_ENGINE_RE);
    if (missing.length) { ciNote = `${w} doesn't run Cypress on ${names(missing)}. Add a browser matrix (browser: [chrome, firefox, webkit]).`; continue; }
    ciOk = w;
    break;
  }
  const ci: RepoCheck = ciOk
    ? { ok: true, message: `${ciOk} runs your tests on Chromium, Firefox and WebKit.`, found: [ciOk] }
    : { ok: false, message: workflows.length ? ciNote : "No workflow found in .github/workflows/.", found: workflows };

  return { "repo-browsers": browsers!, "repo-ci-matrix": ci };
}
