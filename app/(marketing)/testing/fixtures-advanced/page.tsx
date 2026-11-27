import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { FIXTURES_ADVANCED, getAssignmentForUser } from "@/lib/assignments";
import { PLAYWRIGHT } from "@/lib/tools";
import { AnnCard } from "../annotations/_components/ann-card";
import { Code, type Piece } from "../annotations/_components/code-lines";

export const metadata: Metadata = {
  title: "Advanced Playwright fixtures – teardown, worker scope, auto fixtures, options, mergeTests",
  description:
    "Advanced Playwright fixtures with examples: built-in fixtures, setup and teardown around use(), worker-scoped and automatic fixtures, option fixtures per project, overriding page and storageState, mergeTests, box, title and timeouts, and the order fixtures run in.",
  alternates: { canonical: "/testing/fixtures-advanced" },
};

export const dynamic = "force-dynamic";

// Design: Penpot "26 - Testing Learning Path", page "Stage 7 – Advanced fixtures", board B.

type Kind = { t: string; tone: string; when: string; code: Piece[][] };
const SLATE = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

const KINDS: Kind[] = [
  {
    t: "Built-in fixtures",
    tone: SLATE,
    when: "page, context, browser, browserName and request come with Playwright. A test gets one by naming it in its arguments.",
    code: [
      [["test", "k"], ["("], ["'api and ui'", "s"], [", async ({ page, request, browserName }) => {"]],
      [["  const res = await request.get("], ["'/api/health'", "s"], [");"]],
      [["  await page.goto("], ["'/'", "s"], [");"]],
      [["});"]],
    ],
  },
  {
    t: "Setup and teardown",
    tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    when: "Code before use() is setup; code after it is teardown. Teardown runs even when the test fails, so it’s the place to clean up.",
    code: [
      [["cartItem", "k"], [": async ({ request }, use) => {"]],
      [["  const res = await request.post("], ["'/api/cart'", "s"], [");"]],
      [["  const item = await res.json();"]],
      [["  await use", "k"], ["(item);"]],
      [["  await request.delete("], ["`/api/cart/${item.id}`", "s"], [");  "], ["// teardown", "c"]],
      [["},"]],
    ],
  },
  {
    t: "Worker-scoped",
    tone: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    when: "Set up once per worker process and shared by every test that worker runs. Use workerInfo.workerIndex for per-worker data.",
    code: [
      [["account", "k"], [": [async ({}, use, workerInfo) => {"]],
      [["  const email = "], ["`worker-${workerInfo.workerIndex}@lab.test`", "s"], [";"]],
      [["  await use", "k"], ["({ email });"]],
      [["}, { "], ["scope", "k"], [": "], ["'worker'", "s"], [" }],"]],
    ],
  },
  {
    t: "Automatic",
    tone: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    when: "Runs for every test without being asked for: a global beforeEach and afterEach in one place. Here it attaches the console log to each test.",
    code: [
      [["saveLogs", "k"], [": [async ({ page }, use, testInfo) => {"]],
      [["  const logs = [];"]],
      [["  page.on("], ["'console'", "s"], [", (m) => logs.push(m.text()));"]],
      [["  await use", "k"], ["();"]],
      [["  await testInfo.attach("], ["'console'", "s"], [", { body: logs.join("], ["'\\n'", "s"], [") });"]],
      [["}, { "], ["auto", "k"], [": true }],"]],
    ],
  },
  {
    t: "Option fixtures",
    tone: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    when: "A value with a default that each project or file can change. Good for locale, currency or a feature flag.",
    code: [
      [["currency", "k"], [": ["], ["'USD'", "s"], [", { "], ["option", "k"], [": true }],"]],
      [["// playwright.config.ts", "c"]],
      [["{ name: "], ["'eu'", "s"], [", use: { currency: "], ["'EUR'", "s"], [" } },"]],
      [["// one file only", "c"]],
      [["test.use", "k"], ["({ currency: "], ["'GBP'", "s"], [" });"]],
    ],
  },
  {
    t: "Override built-ins",
    tone: SLATE,
    when: "Replace page, baseURL or storageState for every test that imports your test, e.g. a page that is already on the app.",
    code: [
      [["page", "k"], [": async ({ page, baseURL }, use) => {"]],
      [["  await page.goto(baseURL!);"]],
      [["  await use", "k"], ["(page);"]],
      [["},"]],
    ],
  },
  {
    t: "Combine fixture files",
    tone: SLATE,
    when: "Keep fixtures per area (auth, shop, database) and merge them into the one test your specs import.",
    code: [
      [["import", "k"], [" { mergeTests } "], ["from", "k"], [" "], ["'@playwright/test'", "s"], [";"]],
      [["export const", "k"], [" test = mergeTests(authTest, shopTest);"]],
    ],
  },
  {
    t: "Box, title and timeout",
    tone: SLATE,
    when: "Hide a helper’s steps in reports and Trace Viewer, give it a readable name, or give a slow fixture more time.",
    code: [
      [["}, { "], ["box", "k"], [": true }]          "], ["// 'self' hides only its own step", "c"]],
      [["}, { "], ["title", "k"], [": "], ["'seed the store'", "s"], [" }]"]],
      [["}, { "], ["timeout", "k"], [": 60_000 }]"]],
    ],
  },
];

const ORDER = [
  "Lazy: a fixture is set up only when a test or hook asks for it. Automatic fixtures always run.",
  "Dependencies first: if A needs B, B is set up before A and torn down after it.",
  "Test-scoped fixtures are torn down after each test; worker-scoped ones when the worker process exits.",
  "Worker auto fixtures run before beforeAll; test auto fixtures run before beforeEach.",
  "Setup and teardown count toward the test’s timeout; worker fixtures have their own.",
];

const HOW = [
  ["1. Build the fixture layer", "An auto log fixture, a worker account fixture and a currency option, in fixture files you combine with mergeTests."],
  ["2. Run two projects, 2+ workers", "usd and eu projects with --reporter=json. Upload results.json: the report compares workers and projects."],
  ["3. Push and check", "Teardown after use(), mergeTests, an override, and a global worker hook with box or a title, checked on GitHub."],
];

export default async function AdvancedFixturesPage() {
  const { userId } = await auth();
  const assignment = userId ? await getAssignmentForUser(userId, FIXTURES_ADVANCED, PLAYWRIGHT).catch(() => null) : null;

  return (
    <div className="bg-background text-foreground">
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900/40">
        <div className="pointer-events-none absolute -right-16 top-24 h-72 w-72 rounded-full bg-purple-200/60 blur-2xl dark:bg-purple-900/20" />
        <div className="relative mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-8 px-4 py-12 md:px-8 md:py-16">
          <div className="min-w-0 max-w-3xl">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/testing" className="hover:text-foreground">Testing</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="font-semibold text-foreground">Advanced fixtures</span>
            </nav>
            <span className="mt-5 inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              Stage 7 · Advanced · Playwright only
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Advanced fixtures</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Go past page objects: clean up after every test, share one account per worker, run code around every test without hooks, configure
              fixtures per project, and combine fixture files.
            </p>
            <p className="mt-6 text-sm font-medium text-muted-foreground">
              What you will practise: teardown · worker scope · auto fixtures · options · mergeTests · overrides · box &amp; title · timeouts
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              New to fixtures? Start with{" "}
              <Link href="/testing/page-objects?tool=playwright" className="font-semibold text-purple-700 hover:underline dark:text-purple-300">stage 3, Page objects &amp; fixtures</Link>.
            </p>
          </div>
          <ul className="m-0 flex list-none flex-row flex-wrap gap-3 p-0 lg:mt-12 lg:flex-col" aria-label="Topics covered">
            {["use()", "scope: 'worker'", "auto: true", "option: true", "mergeTests"].map((t) => (
              <li key={t} className="inline-flex items-center rounded-full border bg-card px-4 py-2 font-mono text-sm font-semibold">{t}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-12 md:px-8">
        <AnnCard slug="fixtures-advanced" signedIn={Boolean(userId)} assignment={assignment} />
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-14 md:px-8" aria-labelledby="all-the-way">
        <h2 id="all-the-way" className="text-3xl font-extrabold tracking-tight">Fixtures, all the way</h2>
        <p className="mt-2 text-muted-foreground">Stage 3 used fixtures to hand out page objects. Here is everything else they do, with when to use it.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {KINDS.map((k) => (
            <article key={k.t} data-testid="fixture-kind" className="min-w-0 rounded-2xl border bg-card p-6">
              <h3 className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${k.tone}`}>{k.t}</h3>
              <p className="mt-3 text-[15px] text-muted-foreground">{k.when}</p>
              <Code lines={k.code} />
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/40">
          <h3 className="font-bold text-blue-800 dark:text-blue-300">In what order do fixtures run?</h3>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-blue-900/90 dark:text-blue-200/90">
            {ORDER.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
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
