import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, FlaskConical, Play, Search, X, type LucideIcon } from "lucide-react";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { automationSlugsFor, getAssignmentForUser } from "@/lib/assignments";
import { TOOLS as AUTOMATION_TOOLS, withTool, type Tool } from "@/lib/tools";
import { getManualProgress } from "@/lib/manual-progress";
import { ManualPendingSync } from "./manual-testing/_components/manual-pending-sync";

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

// Design: Penpot "26 - Testing Learning Path", Roadmap page, board "Testing roadmap — manual + Playwright + Cypress tracks (new)".
// Three tracks side by side: Manual testing, then one card per automation tool. Steps without an href have no page yet.
// progressKey: the Manual testing step id, or "<tool>:<stage slug>" for an automation stage (progress is kept per tool).
type Step = { n: number; title: string; blurb: string; href?: string; isNew?: boolean; progressKey: string };
type Track = {
  id: string;
  title: string;
  level: string;
  tone: Tone;
  Icon: LucideIcon;
  tool?: Tool; // automation tracks: the tool every step link opens with
  soon?: string; // a note under the steps for stages that aren't built yet
  leaderboard: { href: string; label: string };
  isNew?: boolean;
  blurb: string;
  steps: Step[];
  stepTestId: (n: number) => string;
  unit: string; // "done" / "stages done" in the progress summary
  activeLabel: string; // label for the step the learner is on
};

const STAGE_BLURB: Record<Tool, string[]> = {
  playwright: [
    "Locators, waits, assertions and debugging on real sign-in and sign-up pages.",
    "Config and credentials in .env, tests that read them, and the project on GitHub with secrets.",
    "Move locators into page classes, share setup with fixtures, keep specs readable.",
    "Run the same spec on Chromium, Firefox and WebKit, locally and in GitHub Actions.",
  ],
  cypress: [
    "cy commands, retries and assertions on real sign-in and sign-up pages.",
    "cypress.config and env values, tests that read them, and the project on GitHub with secrets.",
    "Page classes and custom commands, so specs stay short and readable.",
    "Run the same spec on Chrome, Firefox and WebKit, locally and in GitHub Actions.",
  ],
};
const STAGES = [
  { title: "UI automation", href: "/testing/ui-automation", slug: "ui-automation" },
  { title: "Framework setup", href: "/testing/framework-setup", slug: "framework-setup" },
  { title: "Page objects & fixtures", href: "/testing/page-objects", slug: "page-objects" },
  { title: "Cross-browser testing", href: "/testing/cross-browser", slug: "cross-browser" },
];

function automationTrack(
  tool: Tool,
  o: { title: string; tone: Tone; Icon: LucideIcon; blurb: string; stepTestId: (n: number) => string; extra?: Step[]; soon?: string },
): Track {
  const steps: Step[] = STAGES.map((st, i) => ({ n: i + 1, title: st.title, blurb: STAGE_BLURB[tool][i], href: st.href, progressKey: `${tool}:${st.slug}` }));
  return {
    id: `automation-${tool}`,
    title: o.title,
    level: "Intermediate",
    tone: o.tone,
    Icon: o.Icon,
    tool,
    blurb: o.blurb,
    steps: [...steps, ...(o.extra ?? [])],
    stepTestId: o.stepTestId,
    unit: "stages done",
    activeLabel: "In progress",
    soon: o.soon,
    leaderboard: { href: withTool("/testing/leaderboard", tool), label: `View ${o.title} leaderboard →` },
  };
}

const TRACKS: Track[] = [
  {
    id: "manual-testing",
    title: "Manual testing",
    level: "Beginner",
    tone: "blue",
    Icon: Search,
    blurb: "Learn how testers think before you automate: plan tests, design cases, report bugs clearly and explore an app to find what breaks.",
    steps: [
      { n: 1, title: "Testing fundamentals", blurb: "SDLC and STLC, test levels and types, and what makes a good tester.", href: "/testing/manual-testing/fundamentals", progressKey: "manual-fundamentals" },
      { n: 2, title: "Test design techniques", blurb: "Equivalence partitioning, boundary values and decision tables.", href: "/testing/manual-testing/test-design", progressKey: "manual-test-design" },
      { n: 3, title: "Test cases & bug reports", blurb: "Write clear test cases and defect reports with steps, severity and priority.", href: "/testing/manual-testing/test-cases", progressKey: "manual-test-cases" },
      { n: 4, title: "Exploratory testing", blurb: "Charters, time-boxed sessions and notes that find real bugs.", href: "/testing/manual-testing/exploratory", progressKey: "manual-exploratory" },
    ],
    stepTestId: (n) => `manual-step-card-${n}`,
    leaderboard: { href: "/testing/leaderboard", label: "View the all-tracks leaderboard →" },
    unit: "done",
    activeLabel: "Up next",
  },
  automationTrack("playwright", {
    title: "Playwright",
    tone: "purple",
    Icon: Play,
    blurb: "Automate real pages with Playwright, set up the framework the way teams do, add page objects, run on every browser engine, then master annotations.",
    stepTestId: (n) => `step-card-${n}`, // unchanged ids for the existing automation steps
    extra: [{ n: 5, title: "Playwright annotations", blurb: "skip, fixme, fail, slow, only, tags and custom annotations.", href: "/testing/annotations", isNew: true, progressKey: "playwright:annotations" }],
  }),
  automationTrack("cypress", {
    title: "Cypress",
    tone: "green",
    Icon: FlaskConical,
    blurb: "The same practice pages with Cypress: commands and retries, the framework, page objects, and running on Chrome, Firefox and WebKit.",
    stepTestId: (n) => `cypress-step-card-${n}`,
    soon: "More Cypress stages coming soon",
  }),
];

// A signed-in learner's state for each roadmap step. "active" = in progress (Automation: started,
// not complete) or up next (Manual: the first step not yet done).
type StepState = { state: "done" | "active" | "todo"; done: number; total: number };

async function loadRoadmapProgress(userId: string | null): Promise<Map<string, StepState> | null> {
  if (!userId) return null;
  try {
    // Automation progress is per tool, and each tool has its own card.
    const keys = AUTOMATION_TOOLS.flatMap((tool) => automationSlugsFor(tool).map((slug) => ({ tool, slug })));
    const [manual, ...autos] = await Promise.all([getManualProgress(userId), ...keys.map((k) => getAssignmentForUser(userId, k.slug, k.tool))]);
    const map = new Map<string, StepState>();
    const manualDone = new Set<string>(manual?.done ?? []);
    let upNextSet = false;
    for (const st of TRACKS[0].steps) {
      const done = manualDone.has(st.progressKey);
      const active = !done && !upNextSet;
      if (active) upNextSet = true;
      map.set(st.progressKey, { state: done ? "done" : active ? "active" : "todo", done: done ? 1 : 0, total: 1 });
    }
    keys.forEach(({ tool, slug }, i) => {
      const a = autos[i];
      map.set(`${tool}:${slug}`, !a ? { state: "todo", done: 0, total: 0 } : a.completedAt ? { state: "done", done: a.total, total: a.total } : { state: "active", done: a.done, total: a.total });
    });
    return map;
  } catch {
    return null; // database unavailable: show the roadmap without progress
  }
}

const BAR: Record<Tone, string> = { blue: "bg-blue-600", purple: "bg-purple-600", green: "bg-emerald-600" };
const TRACK_SOFT: Record<Tone, string> = { blue: "bg-blue-200 dark:bg-blue-900", purple: "bg-purple-200 dark:bg-purple-900", green: "bg-emerald-200 dark:bg-emerald-900" };
const ACTIVE_BORDER: Record<Tone, string> = { blue: "border-blue-600", purple: "border-purple-600", green: "border-emerald-600" };

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
      <section id="roadmap" className="mx-auto max-w-[90rem] scroll-mt-24 px-4 py-16 md:px-8 lg:py-24">
        <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Your testing roadmap</h2>
        <p className="mt-3 text-center text-lg text-muted-foreground">Three tracks: start with manual testing if you&apos;re new, or pick your automation tool.</p>

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
          {TRACKS.map((track) => {
            const tone = TONES[track.tone];
            const doneCount = progress ? track.steps.filter((s) => progress.get(s.progressKey)?.state === "done").length : 0;
            const activeBorder = ACTIVE_BORDER[track.tone];
            return (
              <article key={track.id} data-testid={`track-${track.id}`} className="flex flex-col overflow-hidden rounded-3xl border bg-card shadow-sm">
                <div className={`h-2 ${BAR[track.tone]}`} />
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone.chip}`}>
                        <track.Icon className="h-6 w-6" />
                      </span>
                      <div>
                        <h3 className="text-2xl font-extrabold tracking-tight">{track.title}</h3>
                        <p className="text-sm text-muted-foreground">{track.steps.length} steps</p>
                      </div>
                    </div>
                    <span className="flex shrink-0 flex-wrap justify-end gap-2">
                      {track.isNew && <span className={`rounded-full px-3 py-1 text-xs font-semibold ${TONES.green.chip}`}>New</span>}
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.chip}`}>{track.level}</span>
                    </span>
                  </div>
                  <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">{track.blurb}</p>

                  {progress && (
                    <div data-testid={`track-progress-${track.id}`} className="mt-5">
                      <p className={`text-right text-sm font-extrabold ${tone.text}`}>
                        {doneCount} of {track.steps.length} {track.unit}
                      </p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
                        <div className={`h-full rounded-full ${BAR[track.tone]}`} style={{ width: `${(doneCount / track.steps.length) * 100}%` }} />
                      </div>
                    </div>
                  )}

                  <ol className="m-0 mt-6 grid list-none gap-3 p-0">
                    {track.steps.map((st) => {
                      const ps = progress?.get(st.progressKey);
                      const state = ps?.state ?? "todo";
                      const base = st.href && state === "active" && track.tool ? `${st.href}/assignment` : st.href;
                      const href = base && track.tool ? withTool(base, track.tool) : base;
                      const body = (
                        <>
                          {state === "done" ? (
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white" aria-label="Done">
                              <Check className="h-5 w-5" />
                            </span>
                          ) : (
                            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-extrabold ${tone.chip}`}>{st.n}</span>
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="flex items-start justify-between gap-2">
                              <span className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                Step {st.n}
                                {state === "active" && <> · {track.activeLabel}</>}
                                {st.isNew && <span className={`rounded-full px-2 py-0.5 text-[11px] normal-case tracking-normal ${TONES.green.chip}`}>New</span>}
                              </span>
                              {state === "done" ? (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                  <Check className="h-3 w-3" /> Done
                                </span>
                              ) : st.href ? (
                                <span className={`inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold ${tone.text}`}>
                                  {state === "active" ? "Continue" : "Start step"} <ArrowRight className="h-3.5 w-3.5" />
                                </span>
                              ) : (
                                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">Coming soon</span>
                              )}
                            </span>
                            <span className="mt-0.5 block text-[17px] font-bold">{st.title}</span>
                            <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{st.blurb}</span>
                            {state === "active" && ps && ps.total > 1 && (
                              <span className="mt-2 flex items-center gap-2">
                                <span className={`h-1.5 w-28 overflow-hidden rounded-full ${TRACK_SOFT[track.tone]}`} aria-hidden="true">
                                  <span className={`block h-full rounded-full ${BAR[track.tone]}`} style={{ width: `${(ps.done / ps.total) * 100}%` }} />
                                </span>
                                <span className={`text-xs font-bold ${tone.text}`}>
                                  {ps.done}/{ps.total} checks
                                </span>
                              </span>
                            )}
                          </span>
                        </>
                      );
                      const cls = `flex items-start gap-3.5 rounded-2xl p-4 ${
                        state === "done"
                          ? "border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                          : state === "active"
                            ? `border-[1.5px] ${activeBorder} bg-slate-50 dark:bg-slate-900/40`
                            : "border bg-slate-50 dark:bg-slate-900/40"
                      }`;
                      return (
                        <li key={st.title} data-testid={track.stepTestId(st.n)} data-state={progress ? state : undefined}>
                          {href ? (
                            <Link href={href} className={`${cls} transition hover:shadow-md`}>{body}</Link>
                          ) : (
                            <div className={cls} aria-disabled="true">{body}</div>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                  {track.soon && (
                    <p className="mt-3 rounded-2xl border border-dashed px-4 py-3 text-center text-sm font-semibold text-muted-foreground">{track.soon}</p>
                  )}
                  <Link href={track.leaderboard.href} data-testid={`track-leaderboard-${track.id}`} className={`mt-auto inline-block pt-6 text-sm font-bold hover:underline ${tone.text}`}>
                    {track.leaderboard.label}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
        <p className="mt-8 text-center text-sm font-medium text-muted-foreground">Each automation track keeps its own progress and leaderboard.</p>
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
