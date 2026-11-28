import type { Metadata } from "next";
import { DsaLessonLayout, SectionHead } from "../../_components/dsa-lesson-layout";
import { CodeBlock } from "../../_components/code-block";
import { KeyIdea, P } from "../../_components/lesson-blocks";
import { TraceStepThrough } from "../../_components/trace-step-through";

// Design: Penpot "27 - DSA Learning Path", page "Foundations 5 – Neighbours & swaps".

export const metadata: Metadata = {
  title: "Neighbours & swaps: is it sorted, swapping and two pointers in C – DSA step 5",
  description:
    "DSA Foundations step 5: compare each item with its neighbour to check if an array is sorted, swap two values safely with tmp, and reverse an array in place with two pointers — with step-by-step traces and C you can run.",
  alternates: { canonical: "/dsa/foundations/neighbours-and-swaps" },
};

const TOC = [
  { id: "compare-neighbours", label: "Compare neighbours" },
  { id: "swap", label: "Swap two boxes" },
  { id: "two-pointers", label: "Two pointers" },
  { id: "bugs", label: "Three common bugs" },
];

// Every program below was run step by step in the Compiler and prints what the lesson says.
const IS_SORTED = `int isSorted(int a[], int n) {
  for (int i = 1; i < n; i++) {
    if (a[i - 1] > a[i]) {
      return 0;               // one pair out of order: no
    }
  }
  return 1;                   // every pair was fine: yes
}`;

const IS_SORTED_RUN = `#include <stdio.h>

int isSorted(int a[], int n) {
  for (int i = 1; i < n; i++) {
    if (a[i - 1] > a[i]) {
      return 0;
    }
  }
  return 1;
}

int main(void) {
  int a[] = {1, 3, 3, 8};
  int b[] = {1, 5, 2};
  int x = isSorted(a, 4);
  int y = isSorted(b, 3);
  printf("%d %d\\n", x, y);
  return 0;
}`;

const EQUAL_PAIRS = `#include <stdio.h>

int countEqualPairs(int a[], int n) {
  int count = 0;
  for (int i = 1; i < n; i++) {
    if (a[i - 1] == a[i]) {
      count++;
    }
  }
  return count;
}

int main(void) {
  int a[] = {1, 3, 3, 8, 8};
  int pairs = countEqualPairs(a, 5);
  printf("%d\\n", pairs);
  return 0;
}`;

const BAD_SWAP = `a[0] = a[1];   // {4, 4}
a[1] = a[0];   // still {4, 4}`;

const BAD_SWAP_RUN = `#include <stdio.h>

int main(void) {
  int a[] = {7, 4};
  a[0] = a[1];
  a[1] = a[0];
  printf("%d %d\\n", a[0], a[1]);
  return 0;
}`;

const SWAP = `int tmp = a[0];   // tmp 7
a[0] = a[1];      // {4, 4}
a[1] = tmp;       // {4, 7}`;

const SWAP_RUN = `#include <stdio.h>

int main(void) {
  int a[] = {7, 4};
  int tmp = a[0];
  a[0] = a[1];
  a[1] = tmp;
  printf("%d %d\\n", a[0], a[1]);
  return 0;
}`;

const REVERSE = `int j = n - 1;
for (int i = 0; i < j; i++) {   // stop when the pointers meet
  int tmp = a[i];
  a[i] = a[j];
  a[j] = tmp;
  j--;                          // j moves in from the end
}`;

const REVERSE_RUN = `#include <stdio.h>

int main(void) {
  int a[] = {1, 2, 3, 4, 5};
  int n = 5;
  int j = n - 1;
  for (int i = 0; i < j; i++) {
    int tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
    j--;
  }
  for (int i = 0; i < n; i++) {
    printf("%d ", a[i]);
  }
  printf("\\n");
  return 0;
}`;

// The array after the first swap of reverse({1, 2, 3, 4, 5}): ends done, i and j on the next pair.
const AFTER_SWAP_1 = [5, 2, 3, 4, 1];

const BUGS = [
  { title: "Starting at 0", bad: "for (int i = 0; ...) a[i - 1]", good: "for (int i = 1; ...)", why: "When i is 0, a[i - 1] is a[-1]: a box before the array." },
  { title: "Swap without tmp", bad: "a[i] = a[j]; a[j] = a[i];", good: "tmp = a[i]; ... a[j] = tmp;", why: "Both boxes end up holding the same value." },
  { title: "Going past the middle", bad: "for (i = 0; i < n; i++)", good: "for (i = 0; i < j; i++)", why: "After the pointers meet it swaps the pairs back again." },
];

export default function NeighboursSwapsLessonPage() {
  return (
    <DsaLessonLayout
      step="dsa-neighbours-swaps"
      intro="Two more first problems, each with its own trick: compare each item with the one next to it, and swap from both ends with two pointers to reverse an array in place."
      minutes={20}
      toc={TOC}
    >
      <section>
        <SectionHead n={1} id="compare-neighbours" title="Compare neighbours" />
        <P>
          Some questions are about pairs that sit side by side: is the list in order, are two items next to each other equal? Look at{" "}
          <code className="font-mono">a[i - 1]</code> and <code className="font-mono">a[i]</code> together. Start i at 1, so <code className="font-mono">a[i - 1]</code> is
          always a real box.
        </P>
        <div className="mt-6">
          <CodeBlock file="is_sorted.c · C" code={IS_SORTED} run={IS_SORTED_RUN} />
        </div>
        <TraceStepThrough
          title="Trace: isSorted({1, 5, 2}, 3)"
          head={["i", "a[i - 1]", "a[i]", "a[i - 1] > a[i] ?", "What happened"]}
          hot={3}
          rows={[
            ["1", "1", "5", "no", "1 and 5 are in order"],
            ["2", "5", "2", "yes", "return 0: not sorted"],
          ]}
          doneNote="It stopped at the first pair out of order. A sorted array would check every pair, then return 1."
        />
        <KeyIdea>n items have only n − 1 neighbour pairs. That is why the loop starts at 1, not 0.</KeyIdea>
        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30">
          <p className="text-lg font-bold">Try it: count equal neighbours</p>
          <p className="mt-1 text-[15px] text-slate-700 dark:text-slate-300">
            Change isSorted so it counts pairs where <code className="font-mono">a[i - 1] == a[i]</code>. For {"{1, 3, 3, 8, 8}"} it prints 2.
          </p>
          <details data-testid="try-answer" className="group mt-4 rounded-xl border border-blue-200 bg-background dark:border-blue-900">
            <summary className="cursor-pointer list-none px-5 py-3.5 font-bold text-blue-700 marker:hidden dark:text-blue-300 [&::-webkit-details-marker]:hidden">
              <span className="mr-2 inline-block transition-transform group-open:rotate-90" aria-hidden="true">▸</span>
              Show one answer
            </summary>
            <div className="border-t border-blue-100 p-4 dark:border-blue-900">
              <CodeBlock file="equal_pairs.c · C" code={EQUAL_PAIRS} copy run={EQUAL_PAIRS} />
            </div>
          </details>
        </div>
      </section>

      <section>
        <SectionHead n={2} id="swap" title="Swap two boxes" />
        <P>To swap two values you need a third box to hold one of them for a moment, like swapping the drinks in two full glasses with an empty one.</P>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="min-w-0 rounded-2xl border border-red-200 bg-card p-4 dark:border-red-900">
            <p className="font-bold text-red-700 dark:text-red-300">✗ Without tmp</p>
            <div className="mt-3">
              <CodeBlock file="bad_swap.c · C" code={BAD_SWAP} run={BAD_SWAP_RUN} />
            </div>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">The 7 is gone before it can move.</p>
            <p className="mt-1 font-mono text-sm font-bold text-red-700 dark:text-red-300">Prints 4 4.</p>
          </div>
          <div className="min-w-0 rounded-2xl border border-emerald-200 bg-card p-4 dark:border-emerald-900">
            <p className="font-bold text-emerald-700 dark:text-emerald-300">✓ With tmp</p>
            <div className="mt-3">
              <CodeBlock file="swap.c · C" code={SWAP} run={SWAP_RUN} />
            </div>
            <p className="mt-3 font-mono text-sm font-bold text-emerald-700 dark:text-emerald-300">Prints 4 7.</p>
          </div>
        </div>
      </section>

      <section>
        <SectionHead n={3} id="two-pointers" title="Two pointers: reverse in place" />
        <P>
          Put one pointer i at the start and one pointer j at the end. Swap what they point at, then move both one step inwards. When they meet in the middle, every
          item has moved.
        </P>
        <div data-testid="pointer-boxes" className="mt-6 flex flex-wrap items-start gap-x-8 gap-y-4">
          <div className="flex gap-2 sm:gap-3">
            {AFTER_SWAP_1.map((v, k) => {
              const ptr = k === 1 ? "i" : k === 3 ? "j" : "";
              const done = k === 0 || k === 4;
              const cls = ptr
                ? "bg-blue-600 text-white"
                : done
                  ? "border border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                  : "border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/50";
              return (
                <div key={k} className="flex flex-col items-center">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl font-mono text-lg font-bold sm:h-14 sm:w-14 sm:text-xl ${cls}`}>{v}</span>
                  <span className="mt-1 font-mono text-[11px] text-slate-400">[{k}]</span>
                  <span className="h-5 font-mono text-sm font-bold text-blue-600 dark:text-blue-400">{ptr}</span>
                </div>
              );
            })}
          </div>
          <p className="max-w-xs text-[15px] text-slate-700 dark:text-slate-300">
            After swap 1 the ends are done (green). Now i = 1 and j = 3 point at 2 and 4.
          </p>
        </div>
        <div className="mt-4">
          <CodeBlock file="reverse.c · C" code={REVERSE} run={REVERSE_RUN} />
        </div>
        <TraceStepThrough
          title="Trace: reverse {1, 2, 3, 4, 5}"
          head={["i", "j", "i < j ?", "Array after the step", "What happened"]}
          hot={3}
          rows={[
            ["0", "4", "yes", "{5, 2, 3, 4, 1}", "swap a[0] and a[4]"],
            ["1", "3", "yes", "{5, 4, 3, 2, 1}", "swap a[1] and a[3]"],
            ["2", "2", "no", "{5, 4, 3, 2, 1}", "pointers meet: stop"],
          ]}
          doneNote="Two swaps reversed five items. The middle item, 3, never had to move."
        />
        <KeyIdea>
          Two pointers walk towards each other, so the loop runs only about n ÷ 2 times. You will meet this pattern again for pairs, palindromes and sorted arrays.
        </KeyIdea>
      </section>

      <section>
        <SectionHead n={4} id="bugs" title="Three bugs to watch for" />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {BUGS.map((b) => (
            <div key={b.title} className="min-w-0 rounded-2xl border bg-card p-5">
              <p className="font-bold">{b.title}</p>
              <p className="mt-3 break-words rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-mono text-[12px] font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                <span aria-label="Wrong">✗</span> {b.bad}
              </p>
              <p className="mt-2 break-words rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 font-mono text-[12px] font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                <span aria-label="Right">✓</span> {b.good}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{b.why}</p>
            </div>
          ))}
        </div>
      </section>
    </DsaLessonLayout>
  );
}
