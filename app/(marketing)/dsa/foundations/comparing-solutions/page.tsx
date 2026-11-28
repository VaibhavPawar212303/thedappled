import type { Metadata } from "next";
import Link from "next/link";
import { DsaLessonLayout, SectionHead } from "../../_components/dsa-lesson-layout";
import { PairStepThrough } from "../../_components/pair-step-through";
import { CodeBlock } from "../../_components/code-block";
import { Cards, DataTable, KeyIdea, P, PlainSteps, Tip } from "../../_components/lesson-blocks";

// Design: Penpot "27 - DSA Learning Path", page "Foundations 5 – Comparing two solutions"
// (section 4 "Same Big-O, different code": board "NEW section 4 — Same Big-O, different code").

export const metadata: Metadata = {
  title: "Comparing two solutions: best case, worst case, O, Ω and Θ – DSA step 9",
  description:
    "DSA Foundations step 9: best and worst case, a step-by-step duplicate check, brute force O(n²) vs sort-then-scan O(n log n) in C, and Big-O's siblings Ω and Θ.",
  alternates: { canonical: "/dsa/foundations/comparing-solutions" },
};

const TOC = [
  { id: "best-worst", label: "Best case and worst case" },
  { id: "step-through", label: "Step through it" },
  { id: "brute-force", label: "Brute force → better" },
  { id: "same-big-o", label: "Same Big-O, different code" },
  { id: "bounds", label: "O, Ω and Θ" },
  { id: "code-it", label: "Code it yourself" },
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

const CONCAT_TWO = `void concat(int nums[], int n, int ans[]) {
  for (int i = 0; i < n; i++)
    ans[i] = nums[i];
  for (int i = 0; i < n; i++)
    ans[i + n] = nums[i];
}`;

const CONCAT_ONE = `void concat(int nums[], int n, int ans[]) {
  for (int i = 0; i < n; i++) {
    ans[i] = nums[i];
    ans[i + n] = nums[i];
  }
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

const BOUNDS = [
  { sym: "O", t: "Upper bound", d: "Grows no faster than this." },
  { sym: "Ω", t: "Lower bound", d: "Grows at least this fast." },
  { sym: "Θ", t: "Tight bound", d: "Both at once: O and Ω match." },
];

export default function ComparingSolutionsLessonPage() {
  return (
    <DsaLessonLayout
      step="dsa-comparing"
      intro="Two correct solutions can do very different amounts of work. Use a duplicate check to compare them step by step, learn best and worst case, and meet Big-O's siblings Ω and Θ."
      minutes={15}
      toc={TOC}
    >
      <section>
        <SectionHead n={1} id="best-worst" title="Best case and worst case" />
        <P>
          Looking for your keys? If they&apos;re in the first pocket you check, you&apos;re done in one step: that&apos;s the best case. If they&apos;re in the last place
          you look, you checked everywhere: that&apos;s the worst case.
        </P>
        <Cards
          items={[
            { t: "Best case", d: "The luckiest input: the answer is found straight away." },
            { t: "Worst case", d: "The unluckiest input: every step has to run." },
            { t: "Why worst case?", d: "It's a promise: the algorithm never does more work than this." },
          ]}
        />
      </section>

      <section>
        <SectionHead n={2} id="step-through" title="Step through it" />
        <PlainSteps
          title="Does the list have a duplicate?"
          steps={[
            "Take the first number.",
            "Compare it with every number after it.",
            "If two numbers are equal, stop: there is a duplicate.",
            "Move to the next number and repeat.",
            "If no pair matched, there is no duplicate.",
          ]}
        />
        <PairStepThrough values={[3, 1, 4, 1]} />
      </section>

      <section>
        <SectionHead n={3} id="brute-force" title="Brute force → better" />
        <P>Comparing every pair works, but it gets slow fast. There&apos;s a smarter way:</P>
        <PlainSteps
          title="Better: sort first"
          steps={[
            "Sort the numbers, so equal numbers end up next to each other.",
            "Walk through the list once.",
            "Compare each number with the one just before it.",
            "If two neighbours are equal, there is a duplicate.",
          ]}
        />
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="min-w-0">
            <p className="font-bold">Brute force: compare every pair</p>
            <span className="mt-2 inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
              O(n²) time · O(1) extra space
            </span>
            <div className="mt-3">
              <CodeBlock file="has_duplicate.c · C" code={BRUTE} />
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-bold">Better: sort, then check neighbours</p>
            <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              O(n log n) time · sorts in place
            </span>
            <div className="mt-3">
              <CodeBlock file="has_duplicate.c · C" code={BETTER} />
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
        <Tip title="Coming up">
          In step 12, Hashing: a hash set checks each number once, so this drops to O(n) on average. Note that <code className="font-mono">qsort</code> reorders the
          caller&apos;s array.
        </Tip>
      </section>

      <section>
        <SectionHead n={4} id="same-big-o" title="Same Big-O, different code" />
        <P>
          Practice question: <strong>Concatenation of Array</strong>. Given <code className="font-mono">nums</code> with n numbers, return{" "}
          <code className="font-mono">ans</code> with 2n numbers: <code className="font-mono">nums</code> followed by <code className="font-mono">nums</code> again. Example:
          [1, 2, 1] → [1, 2, 1, 1, 2, 1]. You built this in{" "}
          <Link href="/dsa/foundations/concatenation-of-array" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
            step 6, Concatenation of Array
          </Link>
          ; now measure both versions.
        </P>
        <DataTable
          caption="Concatenation of Array, part by part"
          head={["Part", "In this question"]}
          rows={[
            ["Data structure", "An array"],
            ["Technique", "Traversal: visit each item once"],
            ["Algorithm", "For each i, write nums[i] at ans[i] and at ans[i + n]"],
            ["Big-O", "O(n) time: one loop"],
          ]}
          hot={1}
          plain
        />
        <P>Two correct ways to build ans:</P>
        <div data-testid="concat-solutions" className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="min-w-0">
            <p className="font-bold">Two loops: copy, then copy again</p>
            <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              O(n) time · 2 passes over nums
            </span>
            <div className="mt-3">
              <CodeBlock file="concat.c · C" code={CONCAT_TWO} />
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-bold">One loop: write both places at once</p>
            <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              O(n) time · 1 pass over nums
            </span>
            <div className="mt-3">
              <CodeBlock file="concat.c · C" code={CONCAT_ONE} />
            </div>
          </div>
        </div>
        <div className="mt-5 rounded-xl border bg-slate-50 px-5 py-4 dark:bg-slate-900/40">
          <p className="text-sm font-bold text-muted-foreground">For n = 1,000</p>
          <div className="mt-1 flex flex-wrap justify-between gap-x-6 gap-y-1 text-[15px] font-bold">
            <span>Two loops: 2,000 loop steps · 2,000 writes</span>
            <span className="text-emerald-700 dark:text-emerald-400">One loop: 1,000 loop steps · 2,000 writes</span>
          </div>
        </div>
        <KeyIdea>
          2n steps and n steps are both O(n): Big-O drops the constant ×2. Both versions also need O(n) space for ans. When the Big-O is the same, pick the code that is
          easier to read.
        </KeyIdea>
      </section>

      <section>
        <SectionHead n={5} id="bounds" title="O, Ω and Θ" />
        <P>Big-O has two siblings. You&apos;ll see them in books and in interviews.</P>
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
        <SectionHead n={6} id="code-it" title="Code it yourself" />
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
