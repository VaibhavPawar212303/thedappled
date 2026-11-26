import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ANNOTATIONS, getAssignmentForUser } from "@/lib/assignments";
import { PLAYWRIGHT } from "@/lib/tools";
import { AnnCard } from "./_components/ann-card";
import { Code, type Piece } from "./_components/code-lines";

export const metadata: Metadata = {
  title: "Playwright annotations – skip, fixme, fail, slow, only, tags and custom annotations",
  description:
    "Every Playwright annotation with examples: test.skip (and conditional skip), test.fixme, test.fail, test.slow, test.only with forbidOnly, tags with --grep, custom and runtime annotations. Then a hands-on assignment.",
  alternates: { canonical: "/testing/annotations" },
};

export const dynamic = "force-dynamic";

// Design: Penpot "26 - Testing Learning Path", page "Stage 5 – Annotations", board B.


type Kind = { t: string; tone: string; when: string; code: Piece[][] };

const KINDS: Kind[] = [
  {
    t: "test.skip",
    tone: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    when: "Don’t run it. Use the condition form for a browser or platform that can’t run it.",
    code: [
      [["test", "k"], ["('copy link', async ({ page, browserName }) => {"]],
      [["  test.skip", "k"], ["(browserName === "], ["'webkit'", "s"], [","]],
      [["    "], ["'Clipboard is not supported'", "s"], [");"]],
      [["  // the rest of the test never runs on WebKit", "c"]],
      [["});"]],
    ],
  },
  {
    t: "test.fixme",
    tone: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    when: "Skip it and mark it “to fix”. For a feature that isn’t built yet, or a test that is broken.",
    code: [
      [["test.fixme", "k"], ["("], ["'dark-mode export'", "s"], [", async ({ page }) => {"]],
      [["  // not built yet: Playwright won't run this", "c"]],
      [["});"]],
    ],
  },
  {
    t: "test.fail",
    tone: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    when: "Run it and expect it to fail, for a known bug. It passes while the bug is there, and tells you when it’s fixed.",
    code: [
      [["test", "k"], ["("], ["'SAVE10 takes 10% off'", "s"], [", async ({ page }) => {"]],
      [["  test.fail", "k"], ["(); "], ["// bug #42: gives 20% off", "c"]],
      [["  await expect(page.getByTestId("], ["'order-total'", "s"], ["))"]],
      [["    .toHaveText("], ["'$72.00'", "s"], [");"]],
      [["});"]],
    ],
  },
  {
    t: "test.slow",
    tone: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    when: "Triple the test’s timeout (30 s → 90 s). For an export or report that takes a while.",
    code: [
      [["test", "k"], ["("], ["'export CSV'", "s"], [", async ({ page }) => {"]],
      [["  test.slow", "k"], ["();"]],
      [["  await expect(status)"]],
      [["    .toHaveText("], ["'Export ready'", "s"], [", { timeout: 45_000 });"]],
      [["});"]],
    ],
  },
  {
    t: "test.only",
    tone: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    when: "Run only this test while you debug. forbidOnly in the config fails the CI run if one is left in.",
    code: [
      [["test.only", "k"], ["("], ["'debug me'", "s"], [", async ({ page }) => { … });"]],
      [["// playwright.config.ts", "c"]],
      [["forbidOnly", "k"], [": !!process.env.CI,"]],
    ],
  },
  {
    t: "Tags",
    tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    when: "Group tests, like @smoke or @regression, then run one group with --grep (or skip it with --grep-invert).",
    code: [
      [["test", "k"], ["("], ["'checkout'", "s"], [", {"]],
      [["  tag", "k"], [": ["], ["'@smoke'", "s"], [", "], ["'@regression'", "s"], ["],"]],
      [["}, async ({ page }) => { … });"]],
      [["npx playwright test --grep @smoke", "c"]],
      [["npx playwright test --grep-invert @slow", "c"]],
    ],
  },
  {
    t: "Custom annotations",
    tone: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    when: "Attach your own note, like an issue link. It shows on the test in the HTML report.",
    code: [
      [["test", "k"], ["("], ["'coupon'", "s"], [", {"]],
      [["  annotation", "k"], [": {"]],
      [["    type: "], ["'issue'", "s"], [","]],
      [["    description: "], ["'https://github.com/you/app/issues/42'", "s"], [","]],
      [["  },"]],
      [["}, async ({ page }) => { … });"]],
    ],
  },
  {
    t: "Runtime and group annotations",
    tone: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    when: "Add a note while the test runs, or tag every test in a describe block at once.",
    code: [
      [["test.describe", "k"], ["("], ["'reports'", "s"], [", { "], ["tag", "k"], [": "], ["'@reports'", "s"], [" }, () => {"]],
      [["  test", "k"], ["("], ["'export'", "s"], [", async ({ browserName }) => {"]],
      [["    test.info", "k"], ["().annotations.push({"]],
      [["      type: "], ["'browser'", "s"], [", description: browserName,"]],
      [["    });"]],
      [["  });"]],
      [["});"]],
    ],
  },
];

const EXTRAS = [
  ["Whole groups", "test.describe.skip, test.describe.fixme and test.describe.only work on every test in the block."],
  ["Conditions", "test.slow(browserName === 'webkit') or test.fixme(isMobile, 'why'): most annotations take a condition and a reason."],
  ["Inside a test", "test.skip(condition, 'why') in the middle of a test stops it at that line, for something you only learn at runtime."],
  ["In the config", "A project with grep: /@smoke/ or grepInvert: /@slow/ runs (or leaves out) a tag on every run of that project."],
];

const HOW = [
  ["1. Annotate the lab tests", "Write a spec for each panel of your lab and add the annotation that panel needs."],
  ["2. Upload your report", "Run all projects with --reporter=json and upload results.json. Each annotation is checked from the results."],
  ["3. Push and check CI", "forbidOnly, a @smoke run in CI, and a tagged describe block with a runtime annotation, checked on GitHub."],
];

export default async function AnnotationsPage() {
  const { userId } = await auth();
  const assignment = userId ? await getAssignmentForUser(userId, ANNOTATIONS, PLAYWRIGHT).catch(() => null) : null;

  return (
    <div className="bg-background text-foreground">
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900/40">
        <div className="pointer-events-none absolute -right-16 top-24 h-72 w-72 rounded-full bg-purple-200/60 blur-2xl dark:bg-purple-900/20" />
        <div className="relative mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-8 px-4 py-12 md:px-8 md:py-16">
          <div className="min-w-0 max-w-3xl">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/testing" className="hover:text-foreground">Testing</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="font-semibold text-foreground">Playwright annotations</span>
            </nav>
            <span className="mt-5 inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              Stage 5 · Intermediate · Playwright only
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Playwright annotations</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Tell Playwright how to treat each test: skip it, mark a known bug, give a slow test more time, tag it for smoke runs, or attach your own
              notes. Then see every annotation in the HTML report.
            </p>
            <p className="mt-6 text-sm font-medium text-muted-foreground">What you will practise: skip · fixme · fail · slow · only · tags · custom annotations · --grep</p>
          </div>
          <ul className="m-0 flex list-none flex-row flex-wrap gap-3 p-0 lg:mt-12 lg:flex-col" aria-label="Annotations covered">
            {["test.skip", "test.fixme", "test.fail", "test.slow", "@smoke"].map((t) => (
              <li key={t} className="inline-flex items-center rounded-full border bg-card px-4 py-2 font-mono text-sm font-semibold">{t}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-12 md:px-8">
        <AnnCard slug="annotations" signedIn={Boolean(userId)} assignment={assignment} />
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-14 md:px-8" aria-labelledby="every-kind">
        <h2 id="every-kind" className="text-3xl font-extrabold tracking-tight">Every kind of annotation</h2>
        <p className="mt-2 text-muted-foreground">Annotations change how Playwright runs a test and how it is reported. Here is every kind, with when to use it.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {KINDS.map((k) => (
            <article key={k.t} data-testid="annotation-kind" className="min-w-0 rounded-2xl border bg-card p-6">
              <h3 className={`inline-flex rounded-full px-3 py-1 font-mono text-sm font-bold ${k.tone}`}>{k.t}</h3>
              <p className="mt-3 text-[15px] text-muted-foreground">{k.when}</p>
              <Code lines={k.code} />
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/40">
          <h3 className="font-bold text-amber-800 dark:text-amber-300">Also good to know</h3>
          <dl className="mt-3 grid gap-4 sm:grid-cols-2">
            {EXTRAS.map(([t, d]) => (
              <div key={t}>
                <dt className="text-sm font-bold text-amber-900 dark:text-amber-200">{t}</dt>
                <dd className="mt-0.5 text-sm text-amber-900/90 dark:text-amber-200/90">{d}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-amber-900/90 dark:text-amber-200/90">Every annotation and tag shows in the HTML report and in --reporter=json, which is how this assignment checks your run.</p>
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
