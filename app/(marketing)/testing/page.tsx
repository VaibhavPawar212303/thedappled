import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, FlaskConical, X } from "lucide-react";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Learn Software Testing – Testing Learning Path",
  description:
    "A free software testing learning path with hands-on UI automation practice: write Playwright or Cypress scripts against real sign-in and sign-up demo pages.",
  alternates: { canonical: "/testing" },
};

type Tone = "blue" | "purple" | "green";

const TONES: Record<Tone, { chip: string; text: string }> = {
  blue: { chip: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300", text: "text-blue-600 dark:text-blue-400" },
  purple: { chip: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300", text: "text-purple-600 dark:text-purple-400" },
  green: { chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300", text: "text-emerald-700 dark:text-emerald-400" },
};

// Only tracks with real content are shown. The earlier plan (fundamentals, test design, API testing,
// frameworks & CI, performance & security) was removed for now and can be restored from git history.
// "Automation learning" is the main card; steps 1 and 2 live inside it.
const TRACK = {
  title: "Automation learning",
  level: "Intermediate",
  blurb: "Learn Playwright and Cypress by automating real pages, set up the framework the way teams do, then structure it with page objects and fixtures.",
  steps: [
    { n: 1, title: "UI automation", blurb: "Playwright & Cypress: locators, waits, page objects, debugging.", href: "/testing/ui-automation", isNew: false },
    { n: 2, title: "Framework setup", blurb: "Config and credentials in .env, tests that read them, and the project saved on GitHub with secrets.", href: "/testing/framework-setup", isNew: false },
    { n: 3, title: "Page objects & fixtures", blurb: "Move locators into page classes, share setup with fixtures, keep specs readable.", href: "/testing/page-objects", isNew: true },
  ],
};

const TOOLS = ["Playwright", "Cypress", "Selenium", "Postman", "Jest", "k6", "GitHub Actions", "TypeScript"];

const RUN = [
  { name: "user can add item to cart", time: "1.2s", pass: true },
  { name: "applies discount code", time: "0.9s", pass: true },
  { name: "shows order summary", time: "0.7s", pass: true },
  { name: "rejects expired card", time: "1.4s", pass: false },
  { name: "sends confirmation email", time: "2.1s", pass: true },
];

export default function TestingPage() {
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

      {/* ROADMAP */}
      <section id="roadmap" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 md:px-8 lg:py-24">
        <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Your testing roadmap</h2>
        <p className="mt-3 text-center text-lg text-muted-foreground">Start with Automation learning — more tracks are on the way.</p>

        <article data-testid="track-automation-learning" className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-3xl border bg-card shadow-sm">
          <div className="h-2 bg-purple-600" />
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${TONES.purple.chip}`}>
                  <FlaskConical className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight">{TRACK.title}</h3>
                  <p className="text-sm text-muted-foreground">{TRACK.steps.length} steps</p>
                </div>
              </div>
              <span className={`hidden rounded-full px-3 py-1 text-xs font-semibold sm:inline-flex ${TONES.purple.chip}`}>{TRACK.level}</span>
            </div>
            <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">{TRACK.blurb}</p>

            <ol className="m-0 mt-6 grid list-none gap-4 p-0">
              {TRACK.steps.map((st) => (
                <li key={st.title} data-testid={`step-card-${st.n}`}>
                  <Link href={st.href} className="flex items-start gap-4 rounded-2xl border bg-slate-50 p-5 transition hover:shadow-md dark:bg-slate-900/40">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-extrabold ${TONES.purple.chip}`}>{st.n}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Step {st.n}
                        {st.isNew && <span className={`rounded-full px-2 py-0.5 text-[11px] normal-case tracking-normal ${TONES.green.chip}`}>New</span>}
                      </span>
                      <span className="mt-0.5 block text-lg font-bold">{st.title}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{st.blurb}</span>
                    </span>
                    <span className={`inline-flex shrink-0 items-center gap-1 self-end text-sm font-semibold ${TONES.purple.text}`}>
                      Start step <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </article>
        <p className="mt-8 text-center text-sm font-medium text-muted-foreground">More stages coming soon</p>
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
    </div>
  );
}
