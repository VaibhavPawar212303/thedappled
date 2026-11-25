import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Binary, Check, Network } from "lucide-react";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { FOUNDATIONS_STEPS } from "@/lib/dsa-lessons";
import { getDsaProgress } from "@/lib/dsa-progress";
import { COMPILER_URL, DsaFooter } from "./_components/dsa-footer";

export const metadata: Metadata = {
  title: "Learn Data Structures and Algorithms – DSA Learning Path",
  description:
    "A free data structures and algorithms learning path: complexity, arrays, hashing, linked lists, trees, graphs and dynamic programming, step by step.",
  alternates: { canonical: "/dsa" },
};

type Tone = "blue" | "purple";

const TONES: Record<Tone, { chip: string; bar: string }> = {
  blue: { chip: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300", bar: "bg-blue-600" },
  purple: { chip: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300", bar: "bg-purple-600" },
};
const NEW_CHIP = "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";

// Design: Penpot "27 - DSA Learning Path", Roadmap page, board "DSA roadmap — desktop (new)".
// Steps without an href have no page yet and show "Coming soon".
type Step = { title: string; blurb: string; href?: string; id?: string; isNew?: boolean };
type Track = { id: string; title: string; level: string; tone: Tone; Icon: typeof Binary; isNew?: boolean; blurb: string; steps: Step[] };

const TRACKS: Track[] = [
  {
    id: "foundations",
    title: "Foundations",
    level: "Beginner",
    tone: "blue",
    Icon: Binary,
    isNew: true,
    blurb: "Start from zero: what an algorithm is and how to measure it, then build the core data structures yourself — arrays, hash maps, linked lists, stacks and queues, and recursion.",
    steps: FOUNDATIONS_STEPS.map(({ id, title, blurb, href, isNew }) => ({ id, title, blurb, href, isNew })),
  },
  {
    id: "patterns",
    title: "Patterns & advanced",
    level: "Intermediate",
    tone: "purple",
    Icon: Network,
    blurb: "Learn the patterns behind most interview problems, then move on to trees, heaps, graphs and dynamic programming.",
    steps: [
      { title: "Two pointers & sliding window", blurb: "Scan once instead of twice for pairs, ranges and substrings." },
      { title: "Binary search", blurb: "Halve the search space on sorted data and on answers." },
      { title: "Trees & BSTs", blurb: "Traversals, depth, and searching a binary search tree." },
      { title: "Heaps & priority queues", blurb: "Top-k, merging sorted lists and scheduling." },
      { title: "Graphs: BFS & DFS", blurb: "Grids, shortest paths in steps, and connected parts." },
      { title: "Dynamic programming", blurb: "Break problems into overlapping sub-problems and memoize." },
    ],
  },
];

const PATTERNS = ["Two pointers", "Sliding window", "Binary search", "Prefix sums", "BFS", "DFS", "Backtracking", "Memoization", "Greedy"];

// Hero visual: a real binary search for 23 in NUMS, one row per step.
const NUMS = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
const TARGET = 23;
type SearchStep = { lo: number; hi: number; mid: number; note: string; found: boolean };
function binarySearchSteps(nums: number[], target: number): SearchStep[] {
  const steps: SearchStep[] = [];
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const v = nums[mid];
    if (v === target) {
      steps.push({ lo, hi, mid, note: `${v} = ${target} → found`, found: true });
      break;
    }
    steps.push({ lo, hi, mid, note: v < target ? `${v} < ${target} → search right` : `${v} > ${target} → search left`, found: false });
    if (v < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return steps;
}
const SEARCH = binarySearchSteps(NUMS, TARGET);
const FOUND = SEARCH[SEARCH.length - 1];

export default async function DsaPage() {
  const { userId } = await auth();
  const progress = await getDsaProgress(userId);
  const done = new Set(progress?.done ?? []);
  return (
    <div className="bg-background text-foreground">
      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900/40">
        <div className="pointer-events-none absolute -right-24 top-10 h-96 w-96 rounded-full bg-blue-200/50 blur-2xl dark:bg-blue-900/20" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-purple-200/40 blur-2xl dark:bg-purple-900/20" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:px-8 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              ✓ New: DSA learning path
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Learn data structures and algorithms, step by step.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Understand how arrays, trees and graphs really work, see each algorithm run step by step, then code it yourself in the Compiler.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
                <Link href="#roadmap">
                  Start the path <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={COMPILER_URL} target="_blank" rel="noopener noreferrer">
                  Open the Compiler
                </a>
              </Button>
            </div>
            <p className="mt-8 text-sm font-medium text-muted-foreground">Free to start · topics open one by one</p>
          </div>

          <figure className="m-0 rounded-2xl border bg-card shadow-sm" aria-label={`Binary search for ${TARGET}: found at index ${FOUND.mid} in ${SEARCH.length} steps`}>
            <div className="flex items-center gap-2 rounded-t-2xl bg-slate-100 px-4 py-3 dark:bg-slate-800">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="ml-3 font-mono text-xs font-semibold text-muted-foreground">binarySearch(nums, {TARGET})</span>
            </div>
            <ol className="m-0 list-none space-y-4 p-4 sm:p-5" aria-hidden="true">
              {SEARCH.map((s, si) => (
                <li key={si}>
                  <div className="flex items-baseline justify-between gap-2 text-xs font-semibold">
                    <span className="font-bold text-muted-foreground">Step {si + 1}</span>
                    <span className={s.found ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}>{s.note}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-10 gap-1 sm:gap-1.5">
                    {NUMS.map((n, i) => {
                      const inRange = i >= s.lo && i <= s.hi;
                      const isMid = i === s.mid;
                      const cell = isMid
                        ? s.found
                          ? "bg-emerald-500 text-white"
                          : "bg-blue-600 text-white"
                        : inRange
                          ? "border border-blue-200 bg-blue-50 text-foreground dark:border-blue-900 dark:bg-blue-950/50"
                          : "border border-slate-100 bg-slate-50 text-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600";
                      const tag = [i === s.lo && "lo", isMid && "mid", i === s.hi && "hi"].filter(Boolean).join("·");
                      return (
                        <div key={n} className="flex flex-col items-center">
                          <span className={`flex aspect-square w-full items-center justify-center rounded-md font-mono text-xs font-bold sm:rounded-lg sm:text-sm ${cell}`}>{n}</span>
                          <span className={`mt-0.5 h-3 font-mono text-[10px] leading-3 ${isMid ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}>{tag}</span>
                        </div>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ol>
            <figcaption className="m-4 mt-0 rounded-xl bg-slate-900 px-4 py-3 text-white sm:m-5 sm:mt-0">
              <p className="text-sm font-bold">
                Found {TARGET} at index {FOUND.mid} in {SEARCH.length} steps
              </p>
              <p className="text-xs text-slate-400">Halving the range each step: O(log n) instead of O(n).</p>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ROADMAP */}
      <section id="roadmap" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 md:px-8 lg:py-24">
        <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Your DSA roadmap</h2>
        <p className="mt-3 text-center text-lg text-muted-foreground">
          Two tracks — start with the foundations if you&apos;re new, or jump to the patterns interviewers ask about.
        </p>

        <div className="mt-12 grid items-stretch gap-8 lg:grid-cols-2">
          {TRACKS.map((track) => {
            const tone = TONES[track.tone];
            return (
              <article key={track.id} data-testid={`dsa-track-${track.id}`} className="flex flex-col overflow-hidden rounded-3xl border bg-card shadow-sm">
                <div className={`h-2 ${tone.bar}`} />
                <div className="flex-1 p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${tone.chip}`}>
                        <track.Icon className="h-6 w-6" />
                      </span>
                      <div>
                        <h3 className="text-2xl font-extrabold tracking-tight">{track.title}</h3>
                        <p className="text-sm text-muted-foreground">{track.steps.length} steps</p>
                      </div>
                    </div>
                    <span className="hidden shrink-0 gap-2 sm:flex">
                      {track.isNew && <span className={`rounded-full px-3 py-1 text-xs font-semibold ${NEW_CHIP}`}>New</span>}
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.chip}`}>{track.level}</span>
                    </span>
                  </div>
                  <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">{track.blurb}</p>

                  <ol className="m-0 mt-6 grid list-none gap-3 p-0">
                    {track.steps.map((st, i) => {
                      const n = i + 1;
                      const isDone = Boolean(st.id && done.has(st.id));
                      const body = (
                        <>
                          {isDone ? (
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white" aria-label="Done">
                              <Check className="h-5 w-5" />
                            </span>
                          ) : (
                            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-extrabold ${tone.chip}`}>{n}</span>
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                              Step {n}
                              {st.isNew && <span className={`rounded-full px-2 py-0.5 text-[11px] normal-case tracking-normal ${NEW_CHIP}`}>New</span>}
                            </span>
                            <span className="mt-0.5 block text-lg font-bold">{st.title}</span>
                            <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{st.blurb}</span>
                          </span>
                          {isDone ? (
                            <span className="inline-flex shrink-0 items-center gap-1 self-end rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              <Check className="h-3 w-3" /> Done
                            </span>
                          ) : st.href ? (
                            <span className="inline-flex shrink-0 items-center gap-1 self-end text-sm font-semibold text-blue-600 dark:text-blue-400">
                              Start step <ArrowRight className="h-4 w-4" />
                            </span>
                          ) : (
                            <span className="shrink-0 self-end rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              Coming soon
                            </span>
                          )}
                        </>
                      );
                      const cls = isDone
                        ? "flex items-start gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30"
                        : "flex items-start gap-4 rounded-2xl border bg-slate-50 p-5 dark:bg-slate-900/40";
                      return (
                        <li key={st.title} data-testid={`dsa-step-${track.id}-${n}`} data-state={progress ? (isDone ? "done" : "todo") : undefined}>
                          {st.href ? (
                            <Link href={st.href} className={`${cls} transition hover:shadow-md`}>{body}</Link>
                          ) : (
                            <div className={cls} aria-disabled="true">{body}</div>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </article>
            );
          })}
        </div>
        <p className="mt-8 text-center text-sm font-medium text-muted-foreground">
          Topics open one at a time — each with a lesson, a step-by-step visual and practice problems.
        </p>
      </section>

      {/* PATTERNS */}
      <section className="bg-slate-50 py-16 dark:bg-slate-900/40">
        <div className="mx-auto max-w-5xl px-4 text-center md:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight">Patterns you will learn</h2>
          <ul className="mt-8 flex list-none flex-wrap justify-center gap-3 p-0">
            {PATTERNS.map((p) => (
              <li key={p} className="rounded-full border bg-card px-6 py-3 text-sm font-semibold shadow-sm">
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <div className="rounded-3xl bg-blue-700 px-6 py-14 text-center text-white">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Think in algorithms. Start the DSA path.</h2>
          <p className="mt-3 text-blue-100">Free account, track your progress topic by topic.</p>
          <div className="mt-8">
            <SignedOut>
              <SignUpButton mode="modal">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                  Create free account
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                <a href={COMPILER_URL} target="_blank" rel="noopener noreferrer">
                  Open the Compiler
                </a>
              </Button>
            </SignedIn>
          </div>
        </div>
      </section>

      <DsaFooter />
    </div>
  );
}
