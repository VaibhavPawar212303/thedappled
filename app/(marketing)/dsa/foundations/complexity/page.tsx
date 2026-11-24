import type * as React from "react";
import type { Metadata } from "next";
import { DsaLessonLayout, SectionHead } from "../../_components/dsa-lesson-layout";
import { PairStepThrough } from "../../_components/pair-step-through";
import { CodeBlock } from "../../_components/code-block";

// Design: Penpot "27 - DSA Learning Path", page "Foundations 1 – Complexity & Big-O",
// board "Lesson — Complexity & Big-O — desktop (new)".

export const metadata: Metadata = {
  title: "Complexity & Big-O – time and space complexity explained step by step",
  description:
    "DSA Foundations step 1: why we count steps instead of seconds, Big-O notation, a step-by-step pair-comparison walkthrough, brute force vs better in C, and the common growth rates from O(1) to O(n!).",
  alternates: { canonical: "/dsa/foundations/complexity" },
};

const TOC = [
  { id: "why-count-steps", label: "Why count steps" },
  { id: "step-through", label: "Step through it" },
  { id: "brute-force", label: "Brute force → better" },
  { id: "growth-rates", label: "Common growth rates" },
  { id: "code-it", label: "Code it yourself" },
];

const CONCEPTS = [
  { t: "Time complexity", d: "How many steps the code takes for an input of size n." },
  { t: "Space complexity", d: "How much extra memory it needs besides the input." },
  { t: "Worst case", d: "We usually quote the slowest input, so the promise always holds." },
];

const BOUNDS = [
  { sym: "O", t: "Upper bound", d: "Grows no faster than this." },
  { sym: "Ω", t: "Lower bound", d: "Grows at least this fast." },
  { sym: "Θ", t: "Tight bound", d: "Both at once: O and Ω match." },
];

const BRUTE = `int has_duplicate(int a[], int n) {
  for (int i = 0; i < n; i++)
    for (int j = i + 1; j < n; j++)
      if (a[i] == a[j]) return 1;
  return 0;
}`;

const BETTER = `int cmp(const void *x, const void *y) {
  int a = *(const int *)x, b = *(const int *)y;
  return (a > b) - (a < b);
}

int has_duplicate(int a[], int n) {
  qsort(a, n, sizeof(int), cmp);
  for (int i = 1; i < n; i++)
    if (a[i] == a[i - 1]) return 1;
  return 0;
}`;

const TASK = `#include <stdio.h>

int has_duplicate(int a[], int n) {
  for (int i = 0; i < n; i++)
    for (int j = i + 1; j < n; j++)
      if (a[i] == a[j]) return 1;
  return 0;
}

int main(void) {
  int a[] = {5, 2, 9, 1, 7, 3, 8, 6};
  int n = sizeof a / sizeof a[0];
  printf("Duplicate found: %d\\n", has_duplicate(a, n));
  return 0;
}`;

// "~1.3 × 10" with exponent "30" -> rendered with a real <sup> (monospace fonts lack superscript digits).
const pow = (base: string, exp: string) => (
  <>
    {base}
    <sup>{exp}</sup>
  </>
);

// tone: "warn" = quadratic (amber), "bad" = exponential / factorial (red)
const GROWTH: { o: string; name: string; ex: string; v: [React.ReactNode, React.ReactNode, React.ReactNode]; tone?: "warn" | "bad" }[] = [
  { o: "O(1)", name: "Constant", ex: "Read a[i]", v: ["1", "1", "1"] },
  { o: "O(log n)", name: "Logarithmic", ex: "Binary search", v: ["~3", "~7", "~10"] },
  { o: "O(√n)", name: "Square root", ex: "Prime check up to √n", v: ["~3", "10", "~32"] },
  { o: "O(n)", name: "Linear", ex: "Scan a list once", v: ["10", "100", "1,000"] },
  { o: "O(n log n)", name: "Linearithmic", ex: "Merge sort", v: ["~33", "~664", "~10,000"] },
  { o: "O(n²)", name: "Quadratic", ex: "Compare every pair", v: ["100", "10,000", "1,000,000"], tone: "warn" },
  { o: "O(n³)", name: "Cubic", ex: "Three nested loops", v: ["1,000", "1,000,000", "1,000,000,000"], tone: "warn" },
  { o: "O(2ⁿ)", name: "Exponential", ex: "Try every subset", v: ["1,024", pow("~1.3 × 10", "30"), pow("~1.1 × 10", "301")], tone: "bad" },
  { o: "O(n!)", name: "Factorial", ex: "Try every ordering", v: ["3,628,800", pow("~9.3 × 10", "157"), pow("~4.0 × 10", "2567")], tone: "bad" },
];

const ROW_TONE = {
  warn: { row: "bg-amber-50 dark:bg-amber-950/30", val: "text-amber-700 dark:text-amber-400" },
  bad: { row: "bg-red-50 dark:bg-red-950/30", val: "text-red-700 dark:text-red-400" },
};

const P = "mt-4 text-[17px] leading-relaxed text-slate-700 dark:text-slate-300";

export default function ComplexityLessonPage() {
  return (
    <DsaLessonLayout
      step="dsa-complexity"
      intro="How to measure what code costs as the input grows, and how to compare two solutions before you run them."
      minutes={25}
      toc={TOC}
    >
      <section>
        <SectionHead n={1} id="why-count-steps" title="Why count steps, not seconds" />
        <p className={P}>
          The same code runs faster on a new laptop than on an old phone, so seconds tell you more about the machine than about the code. Instead we count the
          basic steps the code takes — comparisons, additions, array reads — and ask how that count grows as the input size <em>n</em> grows.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {CONCEPTS.map((c) => (
            <div key={c.t} className="rounded-2xl border bg-slate-50 p-5 dark:bg-slate-900/40">
              <p className="font-bold">{c.t}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-xl border border-blue-200 border-l-[6px] border-l-blue-600 bg-blue-50 p-5 dark:border-blue-900 dark:border-l-blue-500 dark:bg-blue-950/40">
          <p className="font-bold text-blue-700 dark:text-blue-300">Key idea</p>
          <p className="mt-1 text-blue-900 dark:text-blue-200">
            Big-O describes how the work grows as n grows. Keep the fastest-growing term and drop constants: 3n² + 5n + 2 is O(n²).
          </p>
        </div>
        <div data-testid="bounds-card" className="mt-6 rounded-2xl border bg-card p-6">
          <p className="font-bold">Big-O has two siblings</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {BOUNDS.map((b) => (
              <div key={b.sym} className="flex items-start gap-3 rounded-xl border bg-slate-50 p-4 dark:bg-slate-900/40">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100 font-mono text-xl font-extrabold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {b.sym}
                </span>
                <span>
                  <span className="block text-sm font-bold">{b.t}</span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">{b.d}</span>
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            Example — the pair check: Ω(1) when the first two items match, O(n²) when there is no duplicate. Its worst case is Θ(n²).
          </p>
        </div>
      </section>

      <section>
        <SectionHead n={2} id="step-through" title="Step through it" />
        <p className={P}>
          Does this list contain a duplicate? The simplest way is to compare every pair. Step through it and watch the comparison counter — this is the number
          Big-O is about.
        </p>
        <PairStepThrough values={[3, 1, 4, 1]} />
      </section>

      <section>
        <SectionHead n={3} id="brute-force" title="Brute force → better" />
        <p className={P}>
          Comparing every pair works, but it gets slow fast. If we sort first, any duplicates end up next to each other, so one pass over neighbours is enough.
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="min-w-0">
            <p className="font-bold">Brute force: compare every pair</p>
            <span className="mt-2 inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
              O(n²) time · O(1) extra space
            </span>
            <div className="mt-3">
              <CodeBlock file="has_duplicate.c" code={BRUTE} />
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-bold">Better: sort, then check neighbours</p>
            <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              O(n log n) time · sorts in place
            </span>
            <div className="mt-3">
              <CodeBlock file="has_duplicate.c" code={BETTER} />
            </div>
          </div>
        </div>
        <div className="mt-5 rounded-xl border bg-slate-50 px-5 py-4 dark:bg-slate-900/40">
          <p className="text-sm font-bold text-muted-foreground">For n = 1,000</p>
          <div className="mt-1 flex flex-wrap justify-between gap-x-6 gap-y-1 text-[15px] font-bold">
            <span className="text-red-700 dark:text-red-400">Brute force: up to 499,500 comparisons</span>
            <span className="text-emerald-700 dark:text-emerald-400">Better: about 10,000 for the sort + 999 neighbour checks</span>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          Coming up in step 3, Hashing: a hash set checks each number once, so this drops to O(n) on average. Note that <code className="font-mono">qsort</code> reorders
          the caller&apos;s array.
        </div>
      </section>

      <section>
        <SectionHead n={4} id="growth-rates" title="Common growth rates" />
        <p className={P}>Most algorithms you&apos;ll meet fall into a handful of growth rates. Read each row left to right to see how the work grows as n gets 10× bigger.</p>
        <div className="mt-6 overflow-x-auto rounded-xl border">
          <table data-testid="growth-table" className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-muted-foreground dark:bg-slate-800">
              <tr>
                {["Big-O", "Name", "Example", "n = 10", "n = 100", "n = 1,000"].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GROWTH.map((g) => {
                const tone = g.tone ? ROW_TONE[g.tone] : null;
                return (
                  <tr key={g.o} className={`border-t ${tone?.row ?? ""}`}>
                    <th scope="row" className="whitespace-nowrap px-4 py-3 font-mono font-bold text-blue-700 dark:text-blue-300">{g.o}</th>
                    <td className="px-4 py-3">{g.name}</td>
                    <td className="px-4 py-3">{g.ex}</td>
                    {g.v.map((v, i) => (
                      <td key={i} className={`whitespace-nowrap px-4 py-3 font-mono ${tone?.val ?? ""}`}>{v}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] text-muted-foreground">
          Step counts are rounded; log means log base 2. k nested loops give O(n<sup>k</sup>), and O(log log n) also exists but is rare. Constants are dropped, so
          O(2n) is just O(n) — but O(2ⁿ) and O(n!) grow so fast they only work for very small n.
        </p>
      </section>

      <section>
        <SectionHead n={5} id="code-it" title="Code it yourself" />
        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30">
          <p className="text-lg font-bold">Your turn: count the comparisons</p>
          <ol className="m-0 mt-4 list-none space-y-3 p-0">
            {[
              "Copy the program below into any C compiler (gcc, clang or an online one).",
              "Add a counter that goes up by 1 on every comparison, and print it at the end.",
              "The 8 numbers have no duplicates, so every pair is checked. You should see 28 (8 × 7 ÷ 2).",
            ].map((s, i) => (
              <li key={s} className="flex items-start gap-3 text-[15px] text-slate-700 dark:text-slate-300">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{i + 1}</span>
                <span className="pt-0.5">{s}</span>
              </li>
            ))}
          </ol>
          <div className="mt-5">
            <CodeBlock file="count_comparisons.c" code={TASK} copy />
          </div>
          <p className="mt-4 text-[13px] text-muted-foreground">Coming soon: run it right here in the Thedappled Compiler.</p>
        </div>
      </section>
    </DsaLessonLayout>
  );
}
