import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, FlaskConical, Search, Smartphone, X } from "lucide-react";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { TOOLS as AUTOMATION_TOOLS } from "@/lib/tools";
import { doneCount, loadRoadmapProgress, MANUAL_STEPS, toolSteps } from "./_components/roadmap-data";
import { TrackCard } from "./_components/track-card";
import { ManualPendingSync } from "./manual-testing/_components/manual-pending-sync";

export const metadata: Metadata = {
  title: "Learn Software Testing – Testing Learning Path",
  description:
    "A free software testing learning path with hands-on UI automation practice: write Playwright or Cypress scripts against real sign-in and sign-up demo pages.",
  alternates: { canonical: "/testing" },
};

const TOOLS = ["Playwright", "Cypress", "Selenium", "Postman", "Jest", "k6", "GitHub Actions", "TypeScript"];

const RUN = [
  { name: "user can add item to cart", time: "1.2s", pass: true },
  { name: "applies discount code", time: "0.9s", pass: true },
  { name: "shows order summary", time: "0.7s", pass: true },
  { name: "rejects expired card", time: "1.4s", pass: false },
  { name: "sends confirmation email", time: "2.1s", pass: true },
];

export default async function TestingPage() {
  const { userId } = await auth();
  const progress = await loadRoadmapProgress(userId);
  const automationTotal = AUTOMATION_TOOLS.reduce((n, t) => n + toolSteps(t).length, 0);
  const automationDone = AUTOMATION_TOOLS.reduce((n, t) => n + doneCount(toolSteps(t), progress), 0);

  return (
    <div className="bg-background text-foreground">
      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900/40">
        <div className="pointer-events-none absolute -right-24 top-16 h-96 w-96 rounded-full bg-emerald-200/50 dark:bg-emerald-900/20 blur-2xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-blue-200/40 dark:bg-blue-900/20 blur-2xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:px-8 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              ✓ New: Testing learning path
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Learn software testing, step by step.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Learn Playwright and Cypress by automating real sign-in and sign-up pages — built for aspiring QA engineers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-emerald-600 text-white hover:bg-emerald-700">
                <Link href="#roadmap">
                  Start the path <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/search">Browse testing courses</Link>
              </Button>
            </div>
            <p className="mt-8 text-sm font-medium text-muted-foreground">Free to start · more stages coming soon</p>
          </div>

          <div className="rounded-2xl border bg-card shadow-sm" aria-hidden="true">
            <div className="flex items-center gap-2 rounded-t-2xl bg-slate-100 px-4 py-3 dark:bg-slate-800">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="ml-3 text-xs font-semibold text-muted-foreground">checkout.spec.ts</span>
            </div>
            <ul className="m-0 list-none space-y-2 p-4">
              {RUN.map((r) => (
                <li
                  key={r.name}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${r.pass ? "bg-slate-50 dark:bg-slate-800/50" : "bg-red-50 dark:bg-red-950/40"}`}
                >
                  {r.pass ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-red-500" />}
                  <span className="flex-1 font-medium">{r.name}</span>
                  <span className="text-xs text-muted-foreground">{r.time}</span>
                </li>
              ))}
            </ul>
            <div className="m-4 mt-0 rounded-xl bg-slate-900 px-4 py-3 text-white">
              <p className="text-sm font-bold">4 passed · 1 failed</p>
              <p className="text-xs text-slate-400">Read the trace, fix the bug, re-run.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ROADMAP: three tracks. Design: Penpot "26 - Testing Learning Path", page "Roadmap – tracks", board A. */}
      <section id="roadmap" className="mx-auto max-w-[90rem] scroll-mt-24 px-4 py-16 md:px-8 lg:py-24">
        <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Your testing roadmap</h2>
        <p className="mt-3 text-center text-lg text-muted-foreground">Pick a track. Start with manual testing if you&apos;re new.</p>

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
          <TrackCard
            href="/testing/manual"
            testid="track-manual-testing"
            tone="blue"
            Icon={Search}
            title="Manual testing"
            meta={`${MANUAL_STEPS.length} steps · quizzes`}
            pills={[{ label: "Beginner" }]}
            blurb="Learn how testers think before you automate: plan tests, design cases, report bugs and explore an app to find what breaks."
            chips={["Fundamentals", "Test design", "Bug reports", "Exploratory"]}
            progress={progress && { done: doneCount(MANUAL_STEPS, progress), total: MANUAL_STEPS.length, unit: "steps done" }}
            cta="Open manual testing"
          />
          <TrackCard
            href="/testing/automation"
            testid="track-automation"
            tone="purple"
            Icon={FlaskConical}
            title="Automation"
            meta={`${AUTOMATION_TOOLS.length} tools · ${automationTotal} stages`}
            pills={[{ label: "Intermediate" }]}
            blurb="Automate real web pages with Playwright or Cypress: the framework, page objects, every browser, then the advanced tools teams rely on."
            chips={AUTOMATION_TOOLS.map((t) => `${t === "playwright" ? "Playwright" : "Cypress"} · ${toolSteps(t).length}`)}
            progress={progress && { done: automationDone, total: automationTotal, unit: "stages done" }}
            cta="Choose a tool"
          />
          <TrackCard
            href="/testing/mobile"
            testid="track-mobile"
            tone="green"
            Icon={Smartphone}
            title="Mobile testing"
            meta="1 tool · coming soon"
            pills={[{ label: "New" }]}
            blurb="Test Android and iOS apps: install the app on an emulator, find elements, tap, swipe and type, and run it in CI."
            chips={["Appium"]}
            cta="See what's coming"
          />
        </div>
        <p className="mt-8 text-center text-sm font-medium text-muted-foreground">
          Each track keeps its own progress. Automation tools each have their own leaderboard.{" "}
          <Link href="/testing/leaderboard" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">View the all-tracks leaderboard →</Link>
        </p>
      </section>

      {/* TOOLS */}
      <section className="bg-slate-50 py-16 dark:bg-slate-900/40">
        <div className="mx-auto max-w-4xl px-4 text-center md:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight">Tools you will learn</h2>
          <ul className="mt-8 flex list-none flex-wrap justify-center gap-3 p-0">
            {TOOLS.map((t) => (
              <li key={t} className="rounded-full border bg-card px-6 py-3 text-sm font-semibold shadow-sm">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <div className="rounded-3xl bg-emerald-700 px-6 py-14 text-center text-white">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Ship fewer bugs. Start the testing path.</h2>
          <p className="mt-3 text-emerald-100">Free account, track your progress stage by stage.</p>
          <div className="mt-8">
            <SignedOut>
              <SignUpButton mode="modal">
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50">
                  Create free account
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button asChild size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50">
                <Link href="/search">Browse courses</Link>
              </Button>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2 md:px-8">
          <div>
            <p className="text-xl font-bold text-white">Thedappled</p>
            <p className="mt-3 max-w-xs text-sm">Learn modern tech with courses, books and AI-powered articles.</p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-white">Learn</h4>
            <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 text-sm">
              <li><Link href="/search" className="transition hover:text-white">Courses</Link></li>
              <li><Link href="/books" className="transition hover:text-white">Books</Link></li>
              <li><Link href="/blogs" className="transition hover:text-white">Blogs</Link></li>
              <li><Link href="/testing" className="text-emerald-300 transition hover:text-white">Testing</Link></li>
              <li><Link href="/testing/leaderboard" className="transition hover:text-white">Leaderboard</Link></li>
              <li><a href="https://c-architech-compiler.vercel.app/?tab=compiler" target="_blank" rel="noopener noreferrer" className="transition hover:text-white">Compiler</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 px-4 py-6 text-center text-xs text-slate-500">© 2026 Thedappled Inc. All rights reserved.</div>
      </footer>
      <ManualPendingSync />
    </div>
  );
}
