import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ANNOTATIONS_ADVANCED, getAssignmentForUser } from "@/lib/assignments";
import { PLAYWRIGHT } from "@/lib/tools";
import { AnnCard } from "../annotations/_components/ann-card";
import { Code, type Piece } from "../annotations/_components/code-lines";

export const metadata: Metadata = {
  title: "Advanced Playwright annotations – group skip, fixme in hooks, --grep OR and AND",
  description:
    "Advanced Playwright annotations: skip a whole describe group with a condition, test.fixme in beforeEach, declared skips, several annotations on one test, annotated groups, tags in titles, combining tags in --grep (and escaping on Windows), and hidden annotations.",
  alternates: { canonical: "/testing/annotations-advanced" },
};

export const dynamic = "force-dynamic";

// Design: Penpot "26 - Testing Learning Path", page "Stage 7 – Advanced annotations", board B.

type Kind = { t: string; tone: string; when: string; code: Piece[][] };
const SLATE = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
const GREEN = "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";

const KINDS: Kind[] = [
  {
    t: "Skip a whole group",
    tone: SLATE,
    when: "A callback inside describe skips every test in the group where the condition holds. Its beforeAll doesn’t run there either.",
    code: [
      [["test.describe", "k"], ["("], ["'charts'", "s"], [", () => {"]],
      [["  test.skip", "k"], ["(({ browserName }) =>"]],
      [["    browserName !== "], ["'chromium'", "s"], [", "], ["'Charts need Chromium'", "s"], [");"]],
      [["  test", "k"], ["("], ["'revenue chart'", "s"], [", async ({ page }) => { … });"]],
      [["});"]],
    ],
  },
  {
    t: "fixme in beforeEach",
    tone: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    when: "Mark every test in a group to fix, but only where the condition holds. The rest of the hook doesn’t run for those tests.",
    code: [
      [["test.beforeEach", "k"], ["(async ({ page, isMobile }) => {"]],
      [["  test.fixme", "k"], ["(isMobile, "], ["'Settings are not on mobile yet'", "s"], [");"]],
      [["  await page.goto("], ["'/settings'", "s"], [");"]],
      [["});"]],
    ],
  },
  {
    t: "Declare a skipped test",
    tone: SLATE,
    when: "Write the test now and run it later. It shows as skipped in every report, so it isn’t forgotten like a commented-out test.",
    code: [
      [["test.skip", "k"], ["("], ["'export to PDF'", "s"], [", async ({ page }) => {"]],
      [["  // written, not ready to run", "c"]],
      [["});"]],
    ],
  },
  {
    t: "Several annotations",
    tone: SLATE,
    when: "Pass an array to attach more than one note to the same test, like an issue link and a performance note.",
    code: [
      [["test", "k"], ["("], ["'weekly report'", "s"], [", {"]],
      [["  annotation", "k"], [": ["]],
      [["    { type: "], ["'issue'", "s"], [", description: "], ["'#58'", "s"], [" },"]],
      [["    { type: "], ["'performance'", "s"], [", description: "], ["'very slow test!'", "s"], [" },"]],
      [["  ],"]],
      [["}, async ({ page }) => { … });"]],
    ],
  },
  {
    t: "Annotate a group",
    tone: SLATE,
    when: "Every test in the describe block gets the same annotation, the same way a tag on a describe block works.",
    code: [
      [["test.describe", "k"], ["("], ["'report tests'", "s"], [", {"]],
      [["  annotation", "k"], [": { type: "], ["'category'", "s"], [", description: "], ["'report'", "s"], [" },"]],
      [["}, () => { … });"]],
    ],
  },
  {
    t: "Tags in the title",
    tone: GREEN,
    when: "Any @word in a test’s title is a tag too, the same as { tag: '@slow' }. Tags must start with @.",
    code: [
      [["test", "k"], ["("], ["'full year report @slow'", "s"], [", async ({ page }) => {"]],
      [["  …"]],
      [["});"]],
    ],
  },
  {
    t: "Combine tags in --grep",
    tone: GREEN,
    when: "--grep takes a regular expression: | means OR, and lookaheads mean AND (both tags must be there).",
    code: [
      [["# OR: tests tagged @fast or @slow", "c"]],
      [["npx playwright test --grep "], ["\"@fast|@slow\"", "s"]],
      [["# AND: tests tagged @fast and @slow", "c"]],
      [["npx playwright test --grep "], ["\"(?=.*@fast)(?=.*@slow)\"", "s"]],
    ],
  },
  {
    t: "Hidden annotations",
    tone: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    when: "Annotation types that start with _ stay out of the HTML report, but reporters and the JSON report still see them. Good for internal data.",
    code: [
      [["test.info", "k"], ["().annotations.push({"]],
      [["  type: "], ["'_runId'", "s"], [","]],
      [["  description: process.env.RUN_ID ?? "], ["'local'", "s"], [","]],
      [["});"]],
    ],
  },
];

const HOW = [
  ["1. Annotate the advanced lab", "Write a describe block for charts, settings and reports, with the group and hook annotations each one needs."],
  ["2. Run three projects", "chromium, firefox and a mobile device, with --reporter=json. Upload results.json: each group is compared across projects."],
  ["3. Push and check CI", "The callback skip, the hook fixme, a declared skip with an annotated describe, and a combined --grep, checked on GitHub."],
];

export default async function AdvancedAnnotationsPage() {
  const { userId } = await auth();
  const assignment = userId ? await getAssignmentForUser(userId, ANNOTATIONS_ADVANCED, PLAYWRIGHT).catch(() => null) : null;

  return (
    <div className="bg-background text-foreground">
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900/40">
        <div className="pointer-events-none absolute -right-16 top-24 h-72 w-72 rounded-full bg-purple-200/60 blur-2xl dark:bg-purple-900/20" />
        <div className="relative mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-8 px-4 py-12 md:px-8 md:py-16">
          <div className="min-w-0 max-w-3xl">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/testing" className="hover:text-foreground">Testing</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="font-semibold text-foreground">Advanced annotations</span>
            </nav>
            <span className="mt-5 inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              Stage 7 · Advanced · Playwright only
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Advanced annotations</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Annotate whole groups, not just single tests: skip a group on one browser, fixme a hook on mobile, attach several notes, hide internal ones,
              and combine tags with OR and AND when you run.
            </p>
            <p className="mt-6 text-sm font-medium text-muted-foreground">
              What you will practise: group skip · fixme in hooks · multiple annotations · title tags · --grep OR / AND · hidden annotations
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              New to annotations? Start with <Link href="/testing/annotations" className="font-semibold text-purple-700 hover:underline dark:text-purple-300">stage 4, Playwright annotations</Link>.
            </p>
          </div>
          <ul className="m-0 flex list-none flex-row flex-wrap gap-3 p-0 lg:mt-12 lg:flex-col" aria-label="Topics covered">
            {["skip(group)", "fixme(hook)", "@fast|@slow", "_internal"].map((t) => (
              <li key={t} className="inline-flex items-center rounded-full border bg-card px-4 py-2 font-mono text-sm font-semibold">{t}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-12 md:px-8">
        <AnnCard slug="annotations-advanced" signedIn={Boolean(userId)} assignment={assignment} />
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-14 md:px-8" aria-labelledby="beyond">
        <h2 id="beyond" className="text-3xl font-extrabold tracking-tight">Beyond single tests</h2>
        <p className="mt-2 text-muted-foreground">Everything on Playwright’s annotations page that stage 4 didn’t cover, with when to use it.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {KINDS.map((k) => (
            <article key={k.t} data-testid="annotation-kind" className="min-w-0 rounded-2xl border bg-card p-6">
              <h3 className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${k.tone}`}>{k.t}</h3>
              <p className="mt-3 text-[15px] text-muted-foreground">{k.when}</p>
              <Code lines={k.code} />
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/40">
            <h3 className="font-bold text-amber-800 dark:text-amber-300">On Windows</h3>
            <p className="mt-2 text-sm text-amber-900/90 dark:text-amber-200/90">PowerShell treats | as a pipe. Stop PowerShell from parsing the rest, or escape the | with ^:</p>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-amber-100/70 p-3 font-mono text-xs leading-6 text-amber-950 dark:bg-amber-900/30 dark:text-amber-100">{`npx playwright test --grep --% "@fast^|@slow"
npx playwright test --grep "@fast^|@slow"`}</pre>
            <p className="mt-2 text-sm text-amber-900/90 dark:text-amber-200/90">Command Prompt (cmd) uses ^ to escape as well. CI runners on Linux need no escaping.</p>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/40">
            <h3 className="font-bold text-blue-800 dark:text-blue-300">In the report and the config</h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-blue-900/90 dark:text-blue-200/90">
              <li>The HTML report shows each test’s tags and annotations. Click a tag, or search for @smoke, to filter by it.</li>
              <li>grep in the top-level config applies to every run; grep on a project applies to that project only.</li>
              <li>--grep on the command line is for one run, without changing the config.</li>
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
