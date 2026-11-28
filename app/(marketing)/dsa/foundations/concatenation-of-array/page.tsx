import type { Metadata } from "next";
import Link from "next/link";
import { DsaLessonLayout, SectionHead } from "../../_components/dsa-lesson-layout";
import { CodeBlock } from "../../_components/code-block";
import { Cards, DataTable, Figure, KeyIdea, P, PlainSteps, Tip } from "../../_components/lesson-blocks";
import { TraceStepThrough } from "../../_components/trace-step-through";

// Design: Penpot "27 - DSA Learning Path", page "Foundations 6 – Concatenation of Array"
// (boards "Section 1 addition — Technique used" and "NEW section 5 — How much work is it? (toy blocks)").

export const metadata: Metadata = {
  title: "Concatenation of Array: build a new array in C – DSA step 6",
  description:
    "DSA Foundations step 6: solve Concatenation of Array step by step. Read the problem, picture where each item goes, size a new array of 2n, write at i and i + n, trace it, and avoid three common bugs — with C you can run.",
  alternates: { canonical: "/dsa/foundations/concatenation-of-array" },
};

const TOC = [
  { id: "problem", label: "Read the problem" },
  { id: "picture", label: "Picture it" },
  { id: "code", label: "Code it" },
  { id: "two-loops", label: "Another way: two loops" },
  { id: "how-much-work", label: "How much work is it?" },
  { id: "bugs", label: "Bugs and a challenge" },
];

const CLUES = ["every item of nums", "build a new array", "same small job for each item"];
const NOT_NEEDED = ["sorting", "a hash map", "a loop inside a loop"];

// Every program below was run step by step in the Compiler and prints what the lesson says.
// They stay in main: the Compiler can't size an array from a variable (int ans[2 * n]) or fill one
// inside a void function.
const CONCAT = `int nums[] = {1, 2, 1};
int n = 3;
int ans[6];                    // room for 2 × n numbers
for (int i = 0; i < n; i++) {
  ans[i] = nums[i];            // first copy
  ans[i + n] = nums[i];        // second copy
}
// ans is now {1, 2, 1, 1, 2, 1}`;

const PRINT_ANS = `  for (int i = 0; i < 2 * n; i++) {
    printf("%d ", ans[i]);
  }
  printf("\\n");
  return 0;
}`;

const CONCAT_RUN = `#include <stdio.h>

int main(void) {
  int nums[] = {1, 2, 1};
  int n = 3;
  int ans[6];
  for (int i = 0; i < n; i++) {
    ans[i] = nums[i];
    ans[i + n] = nums[i];
  }
${PRINT_ANS}`;

const ONE_LOOP = `for (int i = 0; i < n; i++) {
  ans[i] = nums[i];
  ans[i + n] = nums[i];
}`;

const TWO_LOOPS = `for (int i = 0; i < n; i++) {
  ans[i] = nums[i];
}
for (int i = 0; i < n; i++) {
  ans[i + n] = nums[i];
}`;

const TWO_LOOPS_RUN = `#include <stdio.h>

int main(void) {
  int nums[] = {1, 2, 1};
  int n = 3;
  int ans[6];
  for (int i = 0; i < n; i++) {
    ans[i] = nums[i];
  }
  for (int i = 0; i < n; i++) {
    ans[i + n] = nums[i];
  }
${PRINT_ANS}`;

const BUG_RUN = `#include <stdio.h>

int main(void) {
  int nums[] = {1, 2, 1};
  int n = 3;
  int ans[6] = {0};
  for (int i = 0; i < n; i++) {
    ans[i] = nums[i];
    ans[i] = nums[i];
  }
${PRINT_ANS}`;

const MIRROR_RUN = `#include <stdio.h>

int main(void) {
  int nums[] = {1, 2, 3};
  int n = 3;
  int ans[6];
  for (int i = 0; i < n; i++) {
    ans[i] = nums[i];
    ans[2 * n - 1 - i] = nums[i];
  }
${PRINT_ANS}`;

const NUMS = [1, 2, 1];
const ANS = [1, 2, 1, 1, 2, 1];

const BUGS = [
  { title: "Forgetting + n", bad: "ans[i] = nums[i]; (twice)", good: "ans[i + n] = nums[i];", why: "The second half stays empty: prints 1 2 1 0 0 0." },
  { title: "ans too small", bad: "int ans[3];", good: "int ans[6];  // 2 × n", why: "ans[i + n] writes past the end of ans." },
  { title: "Looping to 2n", bad: "for (i = 0; i < 2 * n; i++)", good: "for (i = 0; i < n; i++)", why: "Reads nums[3], nums[4] …: boxes nums doesn't have." },
];

function Box({ v, label, tone }: { v: number; label: string; tone: "plain" | "hot" | "first" | "second" | "firstHot" | "secondHot" }) {
  const cls = {
    plain: "border-slate-300 bg-card dark:border-slate-600",
    hot: "border-blue-500 bg-blue-100 dark:bg-blue-950",
    first: "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40",
    firstHot: "border-blue-500 bg-blue-50 dark:bg-blue-950/60",
    second: "border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/40",
    secondHot: "border-purple-500 bg-purple-50 dark:bg-purple-950/60",
  }[tone];
  return (
    <div className="text-center">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 font-mono text-base font-extrabold sm:h-14 sm:w-14 sm:rounded-xl sm:text-xl ${cls}`}>{v}</div>
      <p className="mt-1 font-mono text-[10px] text-muted-foreground sm:text-[11px]">{label}</p>
    </div>
  );
}

export default function ConcatenationLessonPage() {
  return (
    <DsaLessonLayout
      step="dsa-concatenation"
      intro="Your first problem that builds a new array: copy nums twice into ans, writing each item in two places. You'll size the new array and work out the shifted index i + n."
      minutes={20}
      toc={TOC}
    >
      <section>
        <SectionHead n={1} id="problem" title="Read the problem" />
        <div className="mt-6 rounded-2xl border bg-card p-5 sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Problem</p>
          <p className="mt-2 text-[17px] font-semibold leading-relaxed">
            Given an array <code className="font-mono">nums</code> with n numbers, return an array <code className="font-mono">ans</code> with 2n numbers:{" "}
            <code className="font-mono">nums</code> followed by <code className="font-mono">nums</code> again.
          </p>
          <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 dark:border-emerald-900 dark:bg-emerald-950/40">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Example</span>
            <span className="font-mono text-[13px] font-semibold text-emerald-900 dark:text-emerald-200">nums = {"{1, 2, 1}"} → ans = {"{1, 2, 1, 1, 2, 1}"}</span>
          </p>
        </div>
        <DataTable
          head={["", "What", "For the example"]}
          rows={[
            ["Input", "nums: n numbers", "{1, 2, 1}   n = 3"],
            ["Output", "ans: 2n numbers", "{1, 2, 1, 1, 2, 1}"],
            ["Size", "n → 2n", "3 → 6"],
          ]}
          hot={2}
        />
        <div data-testid="technique" className="mt-6 rounded-2xl border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Technique</p>
            <Link href="/dsa/foundations/techniques" className="text-sm font-bold text-blue-600 hover:underline dark:text-blue-400">
              All 20 techniques: step 2 →
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-base font-extrabold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <span aria-hidden="true">→</span> Traversal
            </span>
            <span className="text-base font-bold">Visit every item once, in order.</span>
          </div>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
            Like reading a class register from top to bottom. Here the job for each item is the same: write it into ans twice.
          </p>
          <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Clues in this question</p>
          <ul className="m-0 mt-2 flex list-none flex-wrap gap-2 p-0">
            {CLUES.map((c) => (
              <li key={c} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[13px] font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                {c}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Not needed here</p>
          <ul className="m-0 mt-2 flex list-none flex-wrap gap-2 p-0">
            {NOT_NEEDED.map((c) => (
              <li key={c} className="rounded-full border bg-slate-100 px-3 py-1 text-[13px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {c}
              </li>
            ))}
          </ul>
        </div>
        <Tip>Before you code, write down the input, the output and one small example. Most mistakes come from skipping this.</Tip>
      </section>

      <section>
        <SectionHead n={2} id="picture" title="Picture it" />
        <P>Every item of nums goes into ans twice: once in the first half, once in the second half.</P>
        <div data-testid="concat-picture" className="mt-6 overflow-x-auto rounded-2xl border bg-slate-50 p-4 sm:p-5 dark:bg-slate-900/40">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
            <span className="shrink-0 font-mono sm:w-12 sm:pt-3 text-sm font-bold text-slate-700 dark:text-slate-300">nums</span>
            <div className="flex gap-1.5 sm:gap-3">
              {NUMS.map((v, k) => (
                <Box key={k} v={v} label={`nums[${k}]`} tone={k === 1 ? "hot" : "plain"} />
              ))}
            </div>
          </div>
          <p className="my-3 text-sm sm:pl-16 font-semibold text-slate-600 dark:text-slate-400">
            nums[1] → <span className="text-blue-700 dark:text-blue-300">ans[1]</span> and <span className="text-purple-700 dark:text-purple-300">ans[1 + 3] = ans[4]</span>
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
            <span className="shrink-0 font-mono sm:w-12 sm:pt-3 text-sm font-bold text-slate-700 dark:text-slate-300">ans</span>
            <div className="flex gap-1.5 sm:gap-3">
              {ANS.map((v, k) => (
                <Box key={k} v={v} label={`ans[${k}]`} tone={k < 3 ? (k === 1 ? "firstHot" : "first") : k === 4 ? "secondHot" : "second"} />
              ))}
            </div>
          </div>
          <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1 sm:pl-16 font-mono text-[13px] font-bold">
            <span className="text-blue-700 dark:text-blue-300">First copy: ans[i]</span>
            <span className="text-purple-700 dark:text-purple-300">Second copy: ans[i + n]</span>
          </p>
        </div>
        <KeyIdea>
          The second copy starts at index n. So item i lands at i in the first half and at i + n in the second: nums[1] goes to ans[1] and ans[1 + 3] = ans[4].
        </KeyIdea>
      </section>

      <section>
        <SectionHead n={3} id="code" title="Code it" />
        <PlainSteps
          title="The plan"
          steps={["Make ans with room for 2n numbers.", "For each i from 0 to n − 1: write nums[i] at ans[i] and at ans[i + n].", "Print ans."]}
        />
        <div className="mt-6">
          <CodeBlock file="concat.c · C" code={CONCAT} copy run={CONCAT_RUN} />
        </div>
        <TraceStepThrough
          title="Trace: concatenate {1, 2, 1}"
          head={["i", "nums[i]", "Writes to", "ans so far", "What happened"]}
          hot={3}
          rows={[
            ["start", "–", "–", "{_, _, _, _, _, _}", "ans is empty"],
            ["0", "1", "ans[0], ans[3]", "{1, _, _, 1, _, _}", "both copies of 1"],
            ["1", "2", "ans[1], ans[4]", "{1, 2, _, 1, 2, _}", "both copies of 2"],
            ["2", "1", "ans[2], ans[5]", "{1, 2, 1, 1, 2, 1}", "done"],
            ["3", "–", "–", "{1, 2, 1, 1, 2, 1}", "3 < 3 is no: stop"],
          ]}
          doneNote="The loop ran n = 3 times and filled all 2n = 6 boxes of ans."
        />
      </section>

      <section>
        <SectionHead n={4} id="two-loops" title="Another way: two loops" />
        <P>
          You can also copy nums once, then copy it again. Both are correct and give the same ans. In step 9, Comparing two solutions, you&apos;ll measure both and see
          why they are equally fast.
        </P>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="min-w-0">
            <p className="mb-2 font-bold">One loop: write both places at once</p>
            <CodeBlock file="one_loop.c · C" code={ONE_LOOP} run={CONCAT_RUN} />
          </div>
          <div className="min-w-0">
            <p className="mb-2 font-bold">Two loops: copy, then copy again</p>
            <CodeBlock file="two_loops.c · C" code={TWO_LOOPS} run={TWO_LOOPS_RUN} />
          </div>
        </div>
      </section>

      <section>
        <SectionHead n={5} id="how-much-work" title="How much work is it?" />
        <P>Imagine a row of toy blocks. Your job: build the same row twice. That is exactly what the loop does with nums and ans.</P>
        <Figure
          src="/dsa/concatenation/toy-blocks.svg"
          alt="Three toy blocks, 1, 2 and 1, each copied twice onto a new shelf twice as long: 1 2 1 1 2 1. A small graph shows the moves growing in a straight line with the number of blocks."
          caption="Each block is copied twice onto a shelf that is twice as long."
          wide
        />
        <DataTable
          head={["Blocks (n)", "Moves (time)", "Shelf spots (space)"]}
          rows={[
            ["3", "6", "6"],
            ["10", "20", "20"],
            ["100", "200", "200"],
          ]}
          hot={1}
        />
        <Cards
          items={[
            {
              big: "O(n)",
              t: "Time: how many moves",
              d: "Every block is copied twice. Double the blocks, double the moves — like handing out invitations: 10 friends, 10 trips.",
            },
            {
              big: "O(n)",
              t: "Space: how much room",
              d: "The new shelf grows with the blocks. Your hands hold one block at a time, so the extra room is only O(1).",
            },
          ]}
          cols={2}
        />
        <KeyIdea title="Why O(n) and not O(2n)?">
          Big-O only asks: when the blocks double, what happens to the work? It doubles, so it is O(n), whether each block takes 2 moves or 5. In step 8 you&apos;ll read
          this straight from the loop.
        </KeyIdea>
      </section>

      <section>
        <SectionHead n={6} id="bugs" title="Bugs and a challenge" />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {BUGS.map((b) => (
            <div key={b.title} className="flex min-w-0 flex-col rounded-2xl border bg-card p-5">
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
        <div className="mt-4">
          <CodeBlock file="forgot_plus_n.c · C" code={`ans[i] = nums[i];\nans[i] = nums[i];   // should be ans[i + n]\n// prints 1 2 1 0 0 0`} run={BUG_RUN} />
        </div>
        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30">
          <p className="text-lg font-bold">Challenge: mirror it</p>
          <p className="mt-1 text-[15px] text-slate-700 dark:text-slate-300">
            Build {"{1, 2, 3, 3, 2, 1}"}: nums, then nums backwards. Hint: like two pointers, count from the end.
          </p>
          <details data-testid="challenge-answer" className="group mt-4 rounded-xl border border-blue-200 bg-background dark:border-blue-900">
            <summary className="cursor-pointer list-none px-5 py-3.5 font-bold text-blue-700 marker:hidden dark:text-blue-300 [&::-webkit-details-marker]:hidden">
              <span className="mr-2 inline-block transition-transform group-open:rotate-90" aria-hidden="true">▸</span>
              Show one answer
            </summary>
            <div className="border-t border-blue-100 p-4 dark:border-blue-900">
              <p className="mb-3 text-[15px] text-slate-700 dark:text-slate-300">
                The last box is ans[2n − 1]. Item i goes there minus i: <code className="font-mono">ans[2 * n - 1 - i]</code>.
              </p>
              <CodeBlock file="mirror.c · C" code={MIRROR_RUN} copy run={MIRROR_RUN} />
            </div>
          </details>
        </div>
      </section>
    </DsaLessonLayout>
  );
}
