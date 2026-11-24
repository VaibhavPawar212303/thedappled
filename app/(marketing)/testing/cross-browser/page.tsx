import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { CROSS_BROWSER, getAssignmentForUser } from "@/lib/assignments";
import { chosenTool } from "@/lib/tool-choice";
import { otherTool } from "@/lib/tools";
import { XbCard } from "./_components/xb-card";

export const metadata: Metadata = {
  title: "Cross-Browser Testing – run Playwright & Cypress on Chrome, Firefox and WebKit",
  description:
    "Run one Playwright or Cypress spec on Chromium, Firefox and WebKit (the engine behind Safari): browser projects, browser-specific bugs and a GitHub Actions browser matrix.",
  alternates: { canonical: "/testing/cross-browser" },
};

export const dynamic = "force-dynamic";

// Design: Penpot "26 - Testing Learning Path", page "Stage 4 – Cross-browser", board B.

const STEPS = [
  { h: "1. Add the browsers", d: "Add chromium, firefox and webkit projects to playwright.config (Cypress: run with --browser chrome, firefox, webkit)." },
  { h: "2. Run on every engine", d: "Run your checkout spec against the demo shop. Each run is detected by engine; fix anything that fails in only one browser." },
  { h: "3. Run the matrix in CI", d: "Make GitHub Actions run all three browsers, push, and paste the repo URL so we can check the config and the workflow." },
];

const BROWSERS = [
  { name: "Chromium", dot: "bg-blue-600" },
  { name: "Firefox", dot: "bg-amber-500" },
  { name: "WebKit", dot: "bg-slate-500" },
];

export default async function CrossBrowserPage({ searchParams }: { searchParams: Promise<{ tool?: string }> }) {
  const tool = await chosenTool((await searchParams).tool);
  const { userId } = await auth();
  const [assignment, other] = userId
    ? await Promise.all([
        getAssignmentForUser(userId, CROSS_BROWSER, tool).catch(() => null),
        getAssignmentForUser(userId, CROSS_BROWSER, otherTool(tool)).catch(() => null),
      ])
    : [null, null];

  return (
    <div className="bg-background text-foreground">
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900/40">
        <div className="pointer-events-none absolute -right-16 top-24 h-72 w-72 rounded-full bg-blue-200/60 blur-2xl dark:bg-blue-900/20" />
        <div className="relative mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-8 px-4 py-12 md:px-8 md:py-16">
          <div className="min-w-0 max-w-3xl">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/testing" className="hover:text-foreground">Testing</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="font-semibold text-foreground">Cross-browser testing</span>
            </nav>
            <span className="mt-5 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">Stage 4 · Intermediate</span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Cross-browser testing</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Run one spec on Chrome, Firefox and WebKit (the engine behind Safari). Configure browser projects, fix what breaks in only one engine, and run
              the whole matrix in GitHub Actions.
            </p>
            <p className="mt-6 text-sm font-medium text-muted-foreground">What you will practise: projects / --browser · Chromium, Firefox, WebKit · browser-specific bugs · CI matrix</p>
          </div>
          <ul className="m-0 flex list-none flex-row flex-wrap gap-3 p-0 lg:mt-12 lg:flex-col" aria-label="Browsers">
            {BROWSERS.map((b) => (
              <li key={b.name} className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-semibold">
                <span className={`h-3 w-3 rounded-full ${b.dot}`} aria-hidden="true" />
                {b.name}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-12 md:px-8">
        <XbCard signedIn={Boolean(userId)} assignment={assignment} tool={tool} other={other} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <div className="rounded-2xl border bg-slate-50 p-8 dark:bg-slate-900/40">
          <h2 className="text-xl font-extrabold">How the assignment works</h2>
          <div className="mt-5 grid gap-6 md:grid-cols-3">
            {STEPS.map((t) => (
              <div key={t.h}>
                <h3 className="text-[15px] font-bold text-blue-700 dark:text-blue-300">{t.h}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
