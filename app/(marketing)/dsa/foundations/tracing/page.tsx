import type { Metadata } from "next";
import { DsaLessonLayout, SectionHead } from "../../_components/dsa-lesson-layout";
import { CodeBlock } from "../../_components/code-block";
import { KeyIdea, P, PlainSteps, Tip } from "../../_components/lesson-blocks";
import { TraceStepThrough } from "../../_components/trace-step-through";

// Design: Penpot "27 - DSA Learning Path", page "Foundations 4 – Tracing code".

export const metadata: Metadata = {
  title: "Tracing code: trace tables and three first problems in C – DSA step 4",
  description:
    "DSA Foundations step 4: play the computer. Trace a loop line by line with a trace table, then solve three first array problems in C (largest, count, search) and spot the three bugs every beginner writes.",
  alternates: { canonical: "/dsa/foundations/tracing" },
};

const TOC = [
  { id: "play-the-computer", label: "Play the computer" },
  { id: "trace-table", label: "Fill a trace table" },
  { id: "first-problems", label: "Three first problems" },
  { id: "common-bugs", label: "Three common bugs" },
];

// Every program below was run step by step in the Compiler and prints what the lesson says.
const SUM = `#include <stdio.h>

int main(void) {
  int a[] = {5, 2, 9, 1};
  int n = 4;
  int total = 0;
  for (int i = 0; i < n; i++) {
    total = total + a[i];
  }
  printf("%d\\n", total);   // 17
  return 0;
}`;

const DOUBLE_SNIPPET = `int x = 1;
for (int i = 0; i < 4; i++) {
  x = x * 2;
}
printf("%d\\n", x);`;

const DOUBLE = `#include <stdio.h>

int main(void) {
  int x = 1;
  for (int i = 0; i < 4; i++) {
    x = x * 2;
  }
  printf("%d\\n", x);
  return 0;
}`;

type Problem = { id: string; file: string; title: string; pattern: string; idea: string; code: string; run: string; example: string };

const PROBLEMS: Problem[] = [
  {
    id: "largest",
    file: "largest.c",
    title: "Find the largest number",
    pattern: "Best so far",
    idea: "Start with the first item as the best. Swap in any item that beats it.",
    code: `int largest(int a[], int n) {
  int best = a[0];
  for (int i = 1; i < n; i++) {
    if (a[i] > best) {
      best = a[i];
    }
  }
  return best;
}`,
    run: `#include <stdio.h>

int largest(int a[], int n) {
  int best = a[0];
  for (int i = 1; i < n; i++) {
    if (a[i] > best) {
      best = a[i];
    }
  }
  return best;
}

int main(void) {
  int a[] = {5, 2, 9, 1};
  int big = largest(a, 4);
  printf("%d\\n", big);
  return 0;
}`,
    example: "{5, 2, 9, 1}  →  9",
  },
  {
    id: "count-even",
    file: "count_even.c",
    title: "Count the even numbers",
    pattern: "Counter",
    idea: "Start a count at 0 and add 1 each time an item passes the test. a[i] % 2 is the remainder after dividing by 2, so 0 means even.",
    code: `int countEven(int a[], int n) {
  int count = 0;
  for (int i = 0; i < n; i++) {
    if (a[i] % 2 == 0) {
      count++;
    }
  }
  return count;
}`,
    run: `#include <stdio.h>

int countEven(int a[], int n) {
  int count = 0;
  for (int i = 0; i < n; i++) {
    if (a[i] % 2 == 0) {
      count++;
    }
  }
  return count;
}

int main(void) {
  int a[] = {5, 2, 9, 4, 8};
  int evens = countEven(a, 5);
  printf("%d\\n", evens);
  return 0;
}`,
    example: "{5, 2, 9, 4, 8}  →  3",
  },
  {
    id: "find",
    file: "find.c",
    title: "Find where a number is",
    pattern: "Search, stop early",
    idea: "Check each box. Return its index as soon as it matches. If the loop ends without a match, return -1: it means not found.",
    code: `int find(int a[], int n, int target) {
  for (int i = 0; i < n; i++) {
    if (a[i] == target) {
      return i;
    }
  }
  return -1;
}`,
    run: `#include <stdio.h>

int find(int a[], int n, int target) {
  for (int i = 0; i < n; i++) {
    if (a[i] == target) {
      return i;
    }
  }
  return -1;
}

int main(void) {
  int a[] = {5, 2, 9, 4, 8};
  int p = find(a, 5, 9);
  int q = find(a, 5, 7);
  printf("%d %d\\n", p, q);
  return 0;
}`,
    example: "find 9  →  2     find 7  →  -1",
  },
];

const BUGS = [
  { title: "Off by one", bad: "i <= n", good: "i < n", why: "Reads a[n], one box past the end of the array." },
  { title: "= instead of ==", bad: "if (x = 5)", good: "if (x == 5)", why: "Stores 5 in x, so the test is always true." },
  { title: "No starting value", bad: "int total;", good: "int total = 0;", why: "total holds whatever was left in memory." },
];

export default function TracingLessonPage() {
  return (
    <DsaLessonLayout
      step="dsa-tracing"
      intro="Play the computer: follow a loop line by line with a trace table. Then solve three first problems in C and learn to spot the three bugs every beginner writes."
      minutes={25}
      toc={TOC}
    >
      <section>
        <SectionHead n={1} id="play-the-computer" title="Play the computer" />
        <P>
          Tracing means running code in your head, one line at a time, and writing down every variable as it changes. It is how you check code before you run it,
          and how you find bugs.
        </P>
        <div className="mt-6">
          <CodeBlock file="sum.c · C" code={SUM} run={SUM} />
        </div>
        <TraceStepThrough
          title="Trace table: sum of {5, 2, 9, 1}"
          head={["i", "i < 4 ?", "a[i]", "total", "What happened"]}
          hot={3}
          rows={[
            ["start", "–", "–", "0", "total starts at 0"],
            ["0", "yes", "5", "5", "0 + 5"],
            ["1", "yes", "2", "7", "5 + 2"],
            ["2", "yes", "9", "16", "7 + 9"],
            ["3", "yes", "1", "17", "16 + 1"],
            ["4", "no", "–", "17", "stop, print 17"],
          ]}
        />
        <KeyIdea>
          The loop body ran 4 times, once per row with &ldquo;yes&rdquo;. Counting those rows is exactly how you will measure an algorithm in Reading loops.
        </KeyIdea>
      </section>

      <section>
        <SectionHead n={2} id="trace-table" title="Fill a trace table yourself" />
        <PlainSteps
          title="Four rules"
          steps={[
            "Make one column for each variable that changes, plus one for the loop test.",
            "Write the starting values in the first row.",
            "Add one row each time the loop body runs. Change only what that line changes.",
            "When the test says no, stop. That row shows the final values.",
          ]}
        />
        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30">
          <p className="text-lg font-bold">Try it: what does this print?</p>
          <p className="mt-1 text-[15px] text-slate-700 dark:text-slate-300">Draw the table on paper (columns i, i &lt; 4 ?, x) before you open the answer.</p>
          <div className="mt-4">
            <CodeBlock file="double.c · C" code={DOUBLE_SNIPPET} run={DOUBLE} />
          </div>
          <details data-testid="trace-answer" className="group mt-4 rounded-xl border border-blue-200 bg-background dark:border-blue-900">
            <summary className="cursor-pointer list-none px-5 py-3.5 font-bold text-blue-700 marker:hidden dark:text-blue-300 [&::-webkit-details-marker]:hidden">
              <span className="mr-2 inline-block transition-transform group-open:rotate-90" aria-hidden="true">▸</span>
              Show the answer
            </summary>
            <div className="border-t border-blue-100 px-5 py-4 dark:border-blue-900">
              <ul className="m-0 list-none space-y-1 p-0 font-mono text-sm text-slate-700 dark:text-slate-300">
                <li>i = 0: x 1 → 2</li>
                <li>i = 1: x 2 → 4</li>
                <li>i = 2: x 4 → 8</li>
                <li>i = 3: x 8 → 16</li>
              </ul>
              <p className="mt-3 font-bold">i = 4: 4 &lt; 4 is no, so the loop stops. It prints 16.</p>
            </div>
          </details>
        </div>
      </section>

      <section>
        <SectionHead n={3} id="first-problems" title="Three first problems" />
        <P>
          Each problem is a short loop over an array. Read the idea, trace it on the example, then press Run in Compiler and step through it. Each one is a pattern
          you will use again and again.
        </P>
        <ol className="m-0 mt-6 list-none space-y-5 p-0">
          {PROBLEMS.map((p, i) => (
            <li key={p.id} data-testid="problem" className="rounded-2xl border bg-card p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{i + 1}</span>
                <h3 className="text-lg font-bold tracking-tight">{p.title}</h3>
                <span className="rounded-full bg-purple-100 px-3 py-0.5 text-xs font-bold text-purple-700 sm:ml-auto dark:bg-purple-950 dark:text-purple-300">{p.pattern}</span>
              </div>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">The idea</p>
              <p className="mt-1 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">{p.idea}</p>
              <div className="mt-4">
                <CodeBlock file={`${p.file} · C`} code={p.code} run={p.run} />
              </div>
              <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 dark:border-emerald-900 dark:bg-emerald-950/40">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Example</span>
                <span className="whitespace-pre-wrap font-mono text-[13px] font-semibold text-emerald-900 dark:text-emerald-200">{p.example}</span>
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <SectionHead n={4} id="common-bugs" title="Three bugs every beginner writes" />
        <P>The compiler won&apos;t always catch these. A quick trace will.</P>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {BUGS.map((b) => (
            <div key={b.title} className="rounded-2xl border bg-card p-5">
              <p className="font-bold">{b.title}</p>
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-mono text-[13px] font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                <span aria-label="Wrong">✗</span> {b.bad}
              </p>
              <p className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 font-mono text-[13px] font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                <span aria-label="Right">✓</span> {b.good}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{b.why}</p>
            </div>
          ))}
        </div>
        <Tip>
          When code prints the wrong answer, don&apos;t guess. Trace it with a small example and find the first row where your table and the program disagree.
        </Tip>
      </section>
    </DsaLessonLayout>
  );
}
