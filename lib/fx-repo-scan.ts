// Checks a learner's public GitHub repository for the advanced fixtures assignment (stage 7, Playwright only).
// `evaluateFixturesRepo` is pure (a file listing plus a reader), so it can be tested without the network.

import { SKIP_RE, type RepoCheck, type RepoSnapshot } from "@/lib/repo-scan";

export type FixturesRepoResult = {
  "repo-fx-teardown": RepoCheck;
  "repo-fx-merge": RepoCheck;
  "repo-fx-override": RepoCheck;
  "repo-fx-global": RepoCheck;
};

const SOURCE_RE = /\.(ts|js|mjs|cjs|mts|cts|tsx|jsx)$/;
const CONFIG_RE = /(^|\/)playwright\.config\./;

const stripComments = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

// `await use(...)` followed by a real statement before the fixture's closing brace = teardown code.
const TEARDOWN_RE = /await\s+use\s*\([^;\n]*\)\s*;?\s*\n\s*(?![}\])])[^\s]/;
const MERGE_RE = /\bmergeTests\s*\(/;
// A fixture that replaces a built-in: page / context / baseURL / storageState as a key with a function or tuple.
const OVERRIDE_RE = /\b(page|context|baseURL|storageState)\s*:\s*(?:\[\s*)?async\s*\(/;
// Worker-scoped and automatic in one options object (either order).
const WORKER_AUTO_RE = /\{[^{}]*\bscope\s*:\s*["'`]worker["'`][^{}]*\bauto\s*:\s*true[^{}]*\}|\{[^{}]*\bauto\s*:\s*true[^{}]*\bscope\s*:\s*["'`]worker["'`][^{}]*\}/;
// { box: true } / { box: 'self' } or a custom fixture title in an options object that also sets scope/auto/box/timeout or follows a fixture function.
const BOX_OR_TITLE_RE = /\bbox\s*:\s*(?:true|["'`]self["'`])|\}\s*,\s*\{[^{}]*\btitle\s*:\s*["'`]/;

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

export async function evaluateFixturesRepo(snap: RepoSnapshot): Promise<FixturesRepoResult> {
  const paths = snap.paths.filter((p) => !SKIP_RE.test(p) && SOURCE_RE.test(p) && !CONFIG_RE.test(p)).slice(0, 120);
  const texts = await readAll(snap, paths);
  const code = (p: string) => stripComments(texts.get(p) ?? "");
  // Fixture files are the ones that extend or merge Playwright's test.
  const fixtureFiles = paths.filter((p) => /\.extend\s*(?:<[\s\S]*?>)?\s*\(|\bmergeTests\s*\(/.test(code(p)));
  const none: RepoCheck = { ok: false, message: "No fixture file found (a file that calls test.extend(...) or mergeTests(...)).", found: [] };
  const pick = (re: RegExp) => fixtureFiles.find((p) => re.test(code(p)));

  if (!fixtureFiles.length) return { "repo-fx-teardown": none, "repo-fx-merge": none, "repo-fx-override": none, "repo-fx-global": none };

  const td = pick(TEARDOWN_RE);
  const teardown: RepoCheck = td
    ? { ok: true, message: `${td} runs cleanup code after await use().`, found: [td] }
    : { ok: false, message: "No fixture does anything after await use(). Put cleanup there, e.g. delete what the fixture created.", found: fixtureFiles.slice(0, 3) };

  const mg = pick(MERGE_RE);
  const extendCount = fixtureFiles.filter((p) => /\.extend\s*(?:<[\s\S]*?>)?\s*\(/.test(code(p))).length;
  const merge: RepoCheck = mg
    ? { ok: true, message: `${mg} combines fixture files with mergeTests.`, found: [mg] }
    : {
        ok: false,
        message: extendCount >= 2 ? "You have more than one test.extend file; combine them with mergeTests(authTest, shopTest)." : "No mergeTests. Split fixtures into two files and combine them with mergeTests(a, b).",
        found: fixtureFiles.slice(0, 3),
      };

  const ov = pick(OVERRIDE_RE);
  const override: RepoCheck = ov
    ? { ok: true, message: `${ov} overrides a built-in fixture (${OVERRIDE_RE.exec(code(ov))?.[1]}).`, found: [ov] }
    : { ok: false, message: "No built-in is overridden. For example: page: async ({ page, baseURL }, use) => { await page.goto(baseURL!); await use(page); }.", found: [] };

  const wa = pick(WORKER_AUTO_RE);
  const bt = pick(BOX_OR_TITLE_RE);
  const global: RepoCheck =
    wa && bt
      ? { ok: true, message: `${wa} has a worker auto fixture; ${bt} uses box or a custom title.`, found: [...new Set([wa, bt])] }
      : {
          ok: false,
          message: !wa
            ? "No worker auto fixture. Add one as a global beforeAll: [async ({}, use) => { …; await use(); }, { scope: 'worker', auto: true }]."
            : "No fixture uses { box: true } or a custom { title: '…' }. Box your helper fixtures so reports stay readable.",
          found: [wa, bt].filter((p): p is string => Boolean(p)),
        };

  return { "repo-fx-teardown": teardown, "repo-fx-merge": merge, "repo-fx-override": override, "repo-fx-global": global };
}
