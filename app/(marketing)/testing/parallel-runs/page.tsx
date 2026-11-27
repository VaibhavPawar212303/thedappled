import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { PARALLEL_RUNS, getAssignmentForUser } from "@/lib/assignments";
import { PLAYWRIGHT } from "@/lib/tools";
import { AnnCard } from "../annotations/_components/ann-card";
import { Code, type Piece } from "../annotations/_components/code-lines";

export const metadata: Metadata = {
  title: "Playwright parallel runs & workers – fullyParallel, serial mode, maxFailures, sharding",
  description:
    "How Playwright runs tests in parallel: worker processes, limiting workers, parallel and serial modes, opting out with default, keeping test data apart with testId, stopping early with maxFailures, sharding across CI machines, worker and parallel index, and test order.",
  alternates: { canonical: "/testing/parallel-runs" },
};

export const dynamic = "force-dynamic";

// Design: Penpot "26 - Testing Learning Path", page "Stage 8 – Parallel runs & workers", board B.

type Kind = { t: string; tone: string; when: string; code: Piece[][] };
const SLATE = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
const BLUE = "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";

const KINDS: Kind[] = [
  {
    t: "Worker processes",
    tone: SLATE,
    when: "Each worker is its own process with its own browser. Workers never talk to each other, and one worker runs many files in turn.",
    code: [
      [["# 4 workers, or 1 to run one test at a time", "c"]],
      [["npx playwright test --workers 4"]],
      [["npx playwright test --workers=1"]],
    ],
  },
  {
    t: "Limit workers",
    tone: BLUE,
    when: "Use fewer workers on small CI machines, and as many as the machine allows on your own computer.",
    code: [
      [["export default", "k"], [" defineConfig({"]],
      [["  workers", "k"], [": process.env.CI ? 2 : undefined,"]],
      [["});"]],
    ],
  },
  {
    t: "Parallel in one file",
    tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    when: "By default a file’s tests run in order in one worker. Parallel mode spreads them over workers; fullyParallel does it for every file.",
    code: [
      [["test.describe.configure", "k"], ["({ mode: "], ["'parallel'", "s"], [" });"]],
      [["// or, for every file:", "c"]],
      [["fullyParallel", "k"], [": true,"]],
    ],
  },
  {
    t: "Serial mode",
    tone: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    when: "For steps that depend on each other. If one fails, the rest of the group is skipped, and retries rerun the whole group. Use it sparingly.",
    code: [
      [["test.describe", "k"], ["("], ["'checkout'", "s"], [", () => {"]],
      [["  test.describe.configure", "k"], ["({ mode: "], ["'serial'", "s"], [" });"]],
      [["  test("], ["'cart'", "s"], [", …);"]],
      [["  test("], ["'payment'", "s"], [", …);"]],
      [["});"]],
    ],
  },
  {
    t: "Opt out: default",
    tone: SLATE,
    when: "Inside a fullyParallel project, put one group back to running in order.",
    code: [
      [["test.describe", "k"], ["("], ["'reports'", "s"], [", () => {"]],
      [["  test.describe.configure", "k"], ["({ mode: "], ["'default'", "s"], [" });"]],
      [["});"]],
    ],
  },
  {
    t: "Keep data apart",
    tone: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    when: "Browsers are already isolated per worker; backend data and files are not. Name them after the test so parallel tests never collide.",
    code: [
      [["const id = "], ["`order-${testInfo.testId}`", "s"], [";"]],
      [["const file = testInfo.outputPath("], ["'export.csv'", "s"], [");"]],
    ],
  },
  {
    t: "Stop early",
    tone: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    when: "After N failures, stop and skip the tests that haven’t started. Saves CI time when something is badly broken.",
    code: [
      [["maxFailures", "k"], [": process.env.CI ? 10 : undefined,"]],
      [["npx playwright test --max-failures=10"]],
    ],
  },
  {
    t: "Shard across machines",
    tone: BLUE,
    when: "Split one suite over several CI jobs. Each job runs one part with --shard=current/total.",
    code: [
      [["strategy", "k"], [":"]],
      [["  matrix: { shard: [1, 2, 3] }"]],
      [["steps", "k"], [":"]],
      [["  - run: npx playwright test --shard=${{ matrix.shard }}/3"]],
    ],
  },
];

const INDEX = [
  "workerIndex is unique, starts at 0, and is new after every restart.",
  "parallelIndex runs from 0 to workers − 1, and a replacement worker keeps it.",
  "A failure shuts the worker down; the next test gets a fresh worker and a clean environment.",
  "In code: testInfo.workerIndex and testInfo.parallelIndex, or TEST_WORKER_INDEX and TEST_PARALLEL_INDEX.",
];
const ORDER = [
  "Inside a file, tests run in the order you wrote them, unless the file is parallel.",
  "Across files there is no order. With workers: 1, files run alphabetically (001-signin.spec.ts, 002-…).",
  "A “test list” file can force an order, but Playwright discourages it.",
  "Test locks: { lock: 'user-settings' } stops tests that touch the same thing from overlapping; '-exclusive-' runs a test alone.",
];

const HOW = [
  ["1. Run fast", "A reports file in parallel mode and unique order IDs from testInfo.testId. Upload the report."],
  ["2. Break it on purpose", "The payment step fails: a serial checkout skips the rest, and --max-failures=1 stops the run. Upload that report too."],
  ["3. Shard and push", "Upload a --shard=1/2 report, then push a CI shard matrix and the config for the repo check."],
];

export default async function ParallelRunsPage() {
  const { userId } = await auth();
  const assignment = userId ? await getAssignmentForUser(userId, PARALLEL_RUNS, PLAYWRIGHT).catch(() => null) : null;

  return (
    <div className="bg-background text-foreground">
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900/40">
        <div className="pointer-events-none absolute -right-16 top-24 h-72 w-72 rounded-full bg-purple-200/60 blur-2xl dark:bg-purple-900/20" />
        <div className="relative mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-8 px-4 py-12 md:px-8 md:py-16">
          <div className="min-w-0 max-w-3xl">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/testing" className="hover:text-foreground">Testing</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="font-semibold text-foreground">Parallel runs &amp; workers</span>
            </nav>
            <span className="mt-5 inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              Stage 8 · Advanced · Playwright only
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Parallel runs &amp; workers</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Make a suite fast without making it flaky: choose how many workers run, what runs in parallel or in order, keep test data apart, stop early
              on failures, and split the run across machines.
            </p>
            <p className="mt-6 text-sm font-medium text-muted-foreground">
              What you will practise: workers · fullyParallel · parallel / serial / default modes · testId · maxFailures · --shard
            </p>
          </div>
          <ul className="m-0 flex list-none flex-row flex-wrap gap-3 p-0 lg:mt-12 lg:flex-col" aria-label="Topics covered">
            {["workers: 4", "mode: 'serial'", "fullyParallel", "--shard=1/3", "maxFailures"].map((t) => (
              <li key={t} className="inline-flex items-center rounded-full border bg-card px-4 py-2 font-mono text-sm font-semibold">{t}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-12 md:px-8">
        <AnnCard slug="parallel-runs" signedIn={Boolean(userId)} assignment={assignment} />
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-14 md:px-8" aria-labelledby="side-by-side">
        <h2 id="side-by-side" className="text-3xl font-extrabold tracking-tight">How Playwright runs tests side by side</h2>
        <p className="mt-2 text-muted-foreground">Everything on Playwright’s parallelism page, with when to use it.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {KINDS.map((k) => (
            <article key={k.t} data-testid="parallel-kind" className="min-w-0 rounded-2xl border bg-card p-6">
              <h3 className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${k.tone}`}>{k.t}</h3>
              <p className="mt-3 text-[15px] text-muted-foreground">{k.when}</p>
              <Code lines={k.code} />
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/40">
            <h3 className="font-bold text-blue-800 dark:text-blue-300">Worker index and parallel index</h3>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-blue-900/90 dark:text-blue-200/90">
              {INDEX.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/40">
            <h3 className="font-bold text-amber-800 dark:text-amber-300">Order and locks</h3>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-amber-900/90 dark:text-amber-200/90">
              {ORDER.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <div className="rounded-2xl border bg-slate-50 p-8 dark:bg-slate-900/40">
          <h2 className="text-xl font-extrabold">How the assignment works</h2>
          <div className="mt-5 grid gap-6 md:grid-cols-3">
            {HOW.map(([h, d]) => (
              <div key={h}>
                <h3 className="text-[15px] font-bold text-purple-700 dark:text-purple-300">{h}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
