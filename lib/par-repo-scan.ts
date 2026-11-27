// Checks a learner's public GitHub repository for the parallel runs assignment (stage 8, Playwright only).
// `evaluateParallelRepo` is pure (a file listing plus a reader), so it can be tested without the network.

import { SKIP_RE, type RepoCheck, type RepoSnapshot } from "@/lib/repo-scan";

export type ParallelRepoResult = {
  "repo-par-shard-ci": RepoCheck;
  "repo-par-modes": RepoCheck;
  "repo-par-config": RepoCheck;
};

const PW_CONFIG_RE = /(^|\/)playwright\.config\.(ts|js|mjs|cjs|mts|cts)$/;
const SPEC_RE = /\.(spec|test)\.(ts|js|mjs|cjs|mts|cts|tsx|jsx)$/;
const WORKFLOW_RE = /^\.github\/workflows\/[^/]+\.ya?ml$/;

const stripComments = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
const stripYamlComments = (t: string) => t.replace(/(^|\s)#.*$/gm, "$1");

// --shard fed by a matrix (--shard=${{ matrix.shard }}/3, --shard ${{ matrix.shardIndex }}/${{ matrix.shardTotal }})
const SHARD_MATRIX_RE = /--shard[=\s]+["']?\$\{\{\s*matrix\.[\w-]+\s*\}\}/;
const LITERAL_SHARD_RE = /--shard[=\s]+["']?(\d+)\/(\d+)/g;
const MODE_RE = (m: string) => new RegExp(`\\bdescribe\\.configure\\(\\s*\\{[^}]*\\bmode\\s*:\\s*["'\`]${m}["'\`]`);
const FULLY_PARALLEL_RE = /\bfullyParallel\s*:\s*true\b/;
const CI_WORKERS_RE = /\bworkers\s*:\s*[^,\n}]*process\.env\.CI\b/;
const MAX_FAILURES_CFG_RE = /\bmaxFailures\s*:\s*(?!0\b)[^,\n}]+/;
const MAX_FAILURES_CLI_RE = /--max-failures[=\s]+[1-9]/;

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

export async function evaluateParallelRepo(snap: RepoSnapshot): Promise<ParallelRepoResult> {
  const paths = snap.paths.filter((p) => !SKIP_RE.test(p));
  const configs = paths.filter((p) => PW_CONFIG_RE.test(p)).slice(0, 5);
  const specs = paths.filter((p) => SPEC_RE.test(p)).slice(0, 80);
  const workflows = paths.filter((p) => WORKFLOW_RE.test(p)).slice(0, 20);
  const texts = await readAll(snap, [...configs, ...specs, ...workflows]);
  const code = (p: string) => stripComments(texts.get(p) ?? "");
  const yaml = (p: string) => stripYamlComments(texts.get(p) ?? "");

  // 1) CI shards the suite: a matrix feeding --shard, or two or more literal shards of the same total.
  let shardCi: RepoCheck;
  const viaMatrix = workflows.find((w) => SHARD_MATRIX_RE.test(yaml(w)) && /\bmatrix\s*:/.test(yaml(w)));
  const literal = workflows.find((w) => {
    const all = [...yaml(w).matchAll(LITERAL_SHARD_RE)];
    return new Set(all.map((m) => m[1])).size >= 2;
  });
  if (viaMatrix) shardCi = { ok: true, message: `${viaMatrix} shards the suite with a matrix.`, found: [viaMatrix] };
  else if (literal) shardCi = { ok: true, message: `${literal} runs the suite in separate shards.`, found: [literal] };
  else if (!workflows.length) shardCi = { ok: false, message: "No workflow found in .github/workflows/.", found: [] };
  else shardCi = { ok: false, message: "No workflow shards the suite. Add strategy.matrix.shard: [1, 2] and run npx playwright test --shard=${{ matrix.shard }}/2.", found: workflows.slice(0, 3) };

  // 2) describe.configure modes: serial somewhere, and parallel or default somewhere.
  const serialFile = specs.find((p) => MODE_RE("serial").test(code(p)));
  const otherFile = specs.find((p) => MODE_RE("parallel").test(code(p)) || MODE_RE("default").test(code(p)));
  let modes: RepoCheck;
  if (!specs.length) modes = { ok: false, message: "No spec files (*.spec.ts) found in the repository.", found: [] };
  else if (serialFile && otherFile) modes = { ok: true, message: `${serialFile} uses serial mode; ${otherFile} uses parallel or default mode.`, found: [...new Set([serialFile, otherFile])] };
  else if (!serialFile) modes = { ok: false, message: "No serial group. Inside the checkout describe, add test.describe.configure({ mode: 'serial' }).", found: otherFile ? [otherFile] : [] };
  else modes = { ok: false, message: `${serialFile} has a serial group, but no file uses mode 'parallel' or 'default'.`, found: [serialFile] };

  // 3) Config: fullyParallel, workers that depend on CI, and maxFailures (in the config or on the CI command line).
  let cfg: RepoCheck;
  const c = configs[0];
  if (!c) cfg = { ok: false, message: "No playwright.config file found in the repository.", found: [] };
  else {
    const t = code(c);
    const missing = [
      !FULLY_PARALLEL_RE.test(t) && "fullyParallel: true",
      !CI_WORKERS_RE.test(t) && "workers: process.env.CI ? 2 : undefined",
      !MAX_FAILURES_CFG_RE.test(t) && !workflows.some((w) => MAX_FAILURES_CLI_RE.test(yaml(w))) && "maxFailures: process.env.CI ? 10 : undefined",
    ].filter((x): x is string => Boolean(x));
    cfg = missing.length
      ? { ok: false, message: `${c} is missing ${missing.join(", ")}.`, found: [c] }
      : { ok: true, message: `${c} runs fully parallel, sets workers for CI, and stops after too many failures.`, found: [c] };
  }

  return { "repo-par-shard-ci": shardCi, "repo-par-modes": modes, "repo-par-config": cfg };
}
