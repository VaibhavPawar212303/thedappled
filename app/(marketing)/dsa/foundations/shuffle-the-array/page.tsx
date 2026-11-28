import type { Metadata } from "next";
import Link from "next/link";
import { DsaLessonLayout, SectionHead } from "../../_components/dsa-lesson-layout";
import { CodeBlock } from "../../_components/code-block";
import { Cards, DataTable, Figure, KeyIdea, P, PlainSteps, Tip } from "../../_components/lesson-blocks";
import { TraceStepThrough } from "../../_components/trace-step-through";

// Design: Penpot "27 - DSA Learning Path", page "Foundations 7 – Shuffle the Array".

export const metadata: Metadata = {
  title: "Shuffle the Array: weave two halves in C – DSA step 7",
  description:
    "DSA Foundations step 7: solve Shuffle the Array (LeetCode 1470) step by step. See it in a zipper, a card shuffle and stereo music, write at 2i and 2i + 1, trace it, try a write pointer, and fix the bug where every new item sits on the last one — with C you can run.",
  alternates: { canonical: "/dsa/foundations/shuffle-the-array" },
};

const TOC = [
  { id: "problem", label: "Read the problem" },
  { id: "real-life", label: "Where you see it in real life" },
  { id: "picture", label: "Picture it" },
  { id: "code", label: "Code it" },
  { id: "write-pointer", label: "Another way: a write pointer" },
  { id: "how-much-work", label: "How much work is it?" },
  { id: "bugs", label: "Bugs and a challenge" },
];

const CLUES = ["two halves of nums", "one from each half, in turn", "new array, same size"];
const NOT_NEEDED = ["sorting", "a hash map", "a loop inside a loop"];

// Every program below was run step by step in the Compiler and prints what the lesson says.
// They stay in main with int ans[6]: the Compiler can't size an array from a variable or use malloc.
const SHUFFLE = `int nums[] = {2, 5, 1, 3, 4, 7};
int n = 3;
int ans[6];                      // 2 × n seats
for (int i = 0; i < n; i++) {
  ans[2 * i] = nums[i];          // x goes to an even seat
  ans[2 * i + 1] = nums[i + n];  // y sits right next to it
}
// ans is now {2, 3, 5, 4, 1, 7}`;

const PRINT_ANS = `  for (int i = 0; i < 2 * n; i++) {
    printf("%d ", ans[i]);
  }
  printf("\\n");
  return 0;
}`;

const runOf = (nums: string, body: string, init = "") => `#include <stdio.h>

int main(void) {
  int nums[] = {${nums}};
  int n = 3;
  int ans[6]${init};
${body}
${PRINT_ANS}`;

const SHUFFLE_RUN = runOf(
  "2, 5, 1, 3, 4, 7",
  `  for (int i = 0; i < n; i++) {
    ans[2 * i] = nums[i];
    ans[2 * i + 1] = nums[i + n];
  }`,
);

const INDEX_MATH = `for (int i = 0; i < n; i++) {
  ans[2 * i] = nums[i];
  ans[2 * i + 1] = nums[i + n];
}`;

const WRITE_POINTER = `int k = 0;                // next empty seat
for (int i = 0; i < n; i++) {
  ans[k] = nums[i];
  k++;
  ans[k] = nums[i + n];
  k++;
}`;

const WRITE_POINTER_RUN = runOf(
  "2, 5, 1, 3, 4, 7",
  `  int k = 0;
  for (int i = 0; i < n; i++) {
    ans[k] = nums[i];
    k++;
    ans[k] = nums[i + n];
    k++;
  }`,
);

const BUG_RUN = runOf(
  "2, 5, 1, 3, 4, 7",
  `  for (int i = 0; i < n; i++) {
    ans[i] = nums[i];
    ans[i + 1] = nums[i + n];
  }`,
  " = {0}",
);

const UNSHUFFLE_RUN = runOf(
  "2, 3, 5, 4, 1, 7",
  `  for (int i = 0; i < n; i++) {
    ans[i] = nums[2 * i];
    ans[i + n] = nums[2 * i + 1];
  }`,
);

// The LeetCode version (problem 1470). Shown without a Run button: the Compiler doesn't support malloc.
const LEETCODE = `int* shuffle(int* nums, int numsSize, int n, int* returnSize) {
  int *ans = malloc(2 * n * sizeof(int));
  for (int i = 0; i < n; i++) {
    ans[2 * i] = nums[i];
    ans[2 * i + 1] = nums[i + n];
  }
  *returnSize = 2 * n;   // tell LeetCode how many to read
  return ans;
}`;

const NUMS = [2, 5, 1, 3, 4, 7];
const ANS = [2, 3, 5, 4, 1, 7];

const REAL_LIFE = [
  { big: "🧥", t: "Zipper", d: "Teeth from the left and right tapes lock in turn: left, right, left, right. Pull the slider and two rows become one." },
  { big: "🃏", t: "Card shuffle", d: "Split the deck into two halves. Drop one card from each hand in turn: a perfect riffle shuffle is exactly this problem." },
  { big: "🎧", t: "Stereo music", d: "A music file stores sound as left, right, left, right: the two channels are woven into one stream, sample by sample." },
];

const BUGS = [
  { title: "Sits on the last one", bad: "ans[i] … ans[i + 1]", good: "ans[2*i] … ans[2*i + 1]", why: "Seats overlap: each x lands on the last y. Prints 2 5 1 7 0 0." },
  { title: "x and y swapped", bad: "ans[2*i] = nums[i + n];", good: "ans[2*i] = nums[i];", why: "y comes first: you get 3 2 4 5 7 1." },
  { title: "Looping to 2n", bad: "for (i = 0; i < 2 * n; i++)", good: "for (i = 0; i < n; i++)", why: "nums[i + n] reads past the end of nums." },
];

type Tone = "x" | "y" | "xHot" | "yHot";
const TONE: Record<Tone, string> = {
  x: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300",
  xHot: "border-blue-500 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  y: "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-300",
  yHot: "border-purple-500 bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
};

function Box({ v, label, tone }: { v: number; label: string; tone: Tone }) {
  return (
    <div className="text-center">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 font-mono text-base font-extrabold sm:h-14 sm:w-14 sm:rounded-xl sm:text-xl ${TONE[tone]}`}>{v}</div>
      <p className="mt-1 font-mono text-[10px] text-muted-foreground sm:text-[11px]">{label}</p>
    </div>
  );
}

function Chips({ items, cls }: { items: string[]; cls: string }) {
  return (
    <ul className="m-0 mt-2 flex list-none flex-wrap gap-2 p-0">
      {items.map((c) => (
        <li key={c} className={`rounded-full border px-3 py-1 text-[13px] font-semibold ${cls}`}>
          {c}
        </li>
      ))}
    </ul>
  );
}

export default function ShuffleLessonPage() {
  return (
    <DsaLessonLayout
      step="dsa-shuffle"
      intro="Two halves, one line: take one from each half in turn, like the teeth of a zipper. You'll write at 2i and 2i + 1, and fix the bug where every new item sits on the last one."
      minutes={20}
      toc={TOC}
    >
      <section>
        <SectionHead n={1} id="problem" title="Read the problem" />
        <div className="mt-6 rounded-2xl border bg-card p-5 sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Problem</p>
          <p className="mt-2 text-[17px] font-semibold leading-relaxed">
            <code className="font-mono">nums</code> has 2n numbers in the form [x1, x2, …, xn, y1, y2, …, yn]. Return them in the form [x1, y1, x2, y2, …, xn, yn].
          </p>
          <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 dark:border-emerald-900 dark:bg-emerald-950/40">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Example</span>
            <span className="font-mono text-[13px] font-semibold text-emerald-900 dark:text-emerald-200">
              nums = {"{2, 5, 1, 3, 4, 7}"}, n = 3 → ans = {"{2, 3, 5, 4, 1, 7}"}
            </span>
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            x&apos;s: <span className="font-mono font-semibold text-blue-700 dark:text-blue-300">2 5 1</span> · y&apos;s:{" "}
            <span className="font-mono font-semibold text-purple-700 dark:text-purple-300">3 4 7</span> · one from each, in turn
          </p>
        </div>
        <DataTable
          head={["", "What", "For the example"]}
          rows={[
            ["Input", "nums: 2n numbers, n", "{2, 5, 1, 3, 4, 7}   n = 3"],
            ["Output", "ans: 2n numbers", "{2, 3, 5, 4, 1, 7}"],
            ["Size", "2n → 2n", "6 → 6 (same size)"],
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
            One pass over the first half. In each round, i points at an x and i + n points at its y: both go into ans side by side.
          </p>
          <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Clues in this question</p>
          <Chips items={CLUES} cls="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300" />
          <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Not needed here</p>
          <Chips items={NOT_NEEDED} cls="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" />
        </div>
        <Tip>Write the input, the output and one small example first. Here, colour the x&apos;s and y&apos;s in the example: the pattern jumps out.</Tip>
      </section>

      <section>
        <SectionHead n={2} id="real-life" title="Where you see it in real life" />
        <P>Taking one from each of two lines, in turn, is everywhere. Once you spot it, you&apos;ve already solved this problem.</P>
        <Figure
          src="/dsa/shuffle/zipper.svg"
          alt="The first half 2 5 1 and the second half 3 4 7 merge into one line, one from each half in turn: 2 3 5 4 1 7. Next to it, a zipper's teeth lock the same way: one from the left, one from the right."
          caption="The two halves of nums zip together into one line, just like the teeth of a zipper."
          wide
        />
        <Cards items={REAL_LIFE} />
        <KeyIdea>
          Two lists, woven together one by one, is this exact problem. In a music file the computer does it 44,100 times a second for each channel: that&apos;s why the
          loop has to be simple and fast.
        </KeyIdea>
      </section>

      <section>
        <SectionHead n={3} id="picture" title="Picture it" />
        <P>Each round takes one x and one y and puts them next to each other. Round i = 1:</P>
        <div data-testid="shuffle-picture" className="mt-6 overflow-x-auto rounded-2xl border bg-slate-50 p-4 sm:p-5 dark:bg-slate-900/40">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
            <span className="shrink-0 font-mono text-sm font-bold text-slate-700 sm:w-12 sm:pt-3 dark:text-slate-300">nums</span>
            <div className="flex gap-1.5 sm:gap-3">
              {NUMS.map((v, k) => (
                <Box key={k} v={v} label={`nums[${k}]`} tone={k < 3 ? (k === 1 ? "xHot" : "x") : k === 4 ? "yHot" : "y"} />
              ))}
            </div>
          </div>
          <p className="my-3 text-sm font-semibold text-slate-600 sm:pl-16 dark:text-slate-400">
            <span className="text-blue-700 dark:text-blue-300">nums[1] → ans[2 × 1] = ans[2]</span> and{" "}
            <span className="text-purple-700 dark:text-purple-300">nums[1 + 3] → ans[2 × 1 + 1] = ans[3]</span>
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
            <span className="shrink-0 font-mono text-sm font-bold text-slate-700 sm:w-12 sm:pt-3 dark:text-slate-300">ans</span>
            <div className="flex gap-1.5 sm:gap-3">
              {ANS.map((v, k) => (
                <Box key={k} v={v} label={`ans[${k}]`} tone={k % 2 === 0 ? (k === 2 ? "xHot" : "x") : k === 3 ? "yHot" : "y"} />
              ))}
            </div>
          </div>
          <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[13px] font-bold sm:pl-16">
            <span className="text-blue-700 dark:text-blue-300">x → ans[2i]</span>
            <span className="text-purple-700 dark:text-purple-300">y → ans[2i + 1]</span>
          </p>
        </div>
        <DataTable
          head={["i", "x = nums[i]", "goes to 2i", "y = nums[i + n]", "goes to 2i + 1"]}
          rows={[
            ["0", "2", "ans[0]", "3", "ans[1]"],
            ["1", "5", "ans[2]", "4", "ans[3]"],
            ["2", "1", "ans[4]", "7", "ans[5]"],
          ]}
          hot={2}
        />
        <KeyIdea>Each round fills two seats, so the seat number jumps by 2: x sits at 2i and y right next to it at 2i + 1. Two seats per round, no seat used twice.</KeyIdea>
      </section>

      <section>
        <SectionHead n={4} id="code" title="Code it" />
        <PlainSteps
          title="The plan"
          steps={["Make ans with room for 2n numbers.", "For each i from 0 to n − 1: put nums[i] at ans[2i] and nums[i + n] at ans[2i + 1].", "Print ans."]}
        />
        <div className="mt-6">
          <CodeBlock file="shuffle.c · C" code={SHUFFLE} copy run={SHUFFLE_RUN} />
        </div>
        <TraceStepThrough
          title="Trace: shuffle {2, 5, 1, 3, 4, 7}"
          head={["i", "x, y", "Writes to", "ans so far", "What happened"]}
          hot={3}
          rows={[
            ["start", "–", "–", "{_, _, _, _, _, _}", "ans is empty"],
            ["0", "2, 3", "ans[0], ans[1]", "{2, 3, _, _, _, _}", "first pair"],
            ["1", "5, 4", "ans[2], ans[3]", "{2, 3, 5, 4, _, _}", "second pair"],
            ["2", "1, 7", "ans[4], ans[5]", "{2, 3, 5, 4, 1, 7}", "done"],
            ["3", "–", "–", "{2, 3, 5, 4, 1, 7}", "3 < 3 is no: stop"],
          ]}
          doneNote="The loop ran n = 3 times and filled all 2n = 6 seats of ans, two per round."
        />
        <Tip title="On LeetCode">
          The function returns int* and also sets *returnSize = 2 * n. A C array doesn&apos;t know its own length, so without that line LeetCode reads 0 numbers and
          shows [].
        </Tip>
        <div className="mt-4">
          <CodeBlock file="leetcode_1470.c · C" code={LEETCODE} copy />
        </div>
      </section>

      <section>
        <SectionHead n={5} id="write-pointer" title="Another way: a write pointer" />
        <P>
          Instead of working out 2i, keep a second counter k: the next empty seat. Write, move k on, write, move k on. Same answer, and you&apos;ll meet this &quot;write
          pointer&quot; again in later problems.
        </P>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="min-w-0">
            <p className="mb-2 font-bold">Index math: 2i and 2i + 1</p>
            <CodeBlock file="index_math.c · C" code={INDEX_MATH} run={SHUFFLE_RUN} />
          </div>
          <div className="min-w-0">
            <p className="mb-2 font-bold">Write pointer: k moves on</p>
            <CodeBlock file="write_pointer.c · C" code={WRITE_POINTER} run={WRITE_POINTER_RUN} />
          </div>
        </div>
      </section>

      <section>
        <SectionHead n={6} id="how-much-work" title="How much work is it?" />
        <DataTable
          head={["n (pairs)", "Rounds", "Writes (time)", "Seats in ans (space)"]}
          rows={[
            ["3", "3", "6", "6"],
            ["10", "10", "20", "20"],
            ["1,000", "1,000", "2,000", "2,000"],
          ]}
          hot={2}
        />
        <Cards
          items={[
            { big: "O(n)", t: "Time", d: "One loop, n rounds, 2 writes each. Double the pairs, double the work." },
            { big: "O(n)", t: "Space", d: "ans has 2n seats. Besides ans you only keep i (and k): O(1) extra." },
          ]}
          cols={2}
        />
      </section>

      <section>
        <SectionHead n={7} id="bugs" title="Bugs and a challenge" />
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
          <CodeBlock file="sits_on_last.c · C" code={`ans[i] = nums[i];\nans[i + 1] = nums[i + n];   // should be 2 * i and 2 * i + 1\n// prints 2 5 1 7 0 0`} run={BUG_RUN} />
        </div>
        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30">
          <p className="text-lg font-bold">Challenge: un-shuffle it</p>
          <p className="mt-1 text-[15px] text-slate-700 dark:text-slate-300">
            Start from {"{2, 3, 5, 4, 1, 7}"} and get {"{2, 5, 1, 3, 4, 7}"} back. Hint: this time, read at 2i and 2i + 1.
          </p>
          <details data-testid="challenge-answer" className="group mt-4 rounded-xl border border-blue-200 bg-background dark:border-blue-900">
            <summary className="cursor-pointer list-none px-5 py-3.5 font-bold text-blue-700 marker:hidden dark:text-blue-300 [&::-webkit-details-marker]:hidden">
              <span className="mr-2 inline-block transition-transform group-open:rotate-90" aria-hidden="true">▸</span>
              Show one answer
            </summary>
            <div className="border-t border-blue-100 p-4 dark:border-blue-900">
              <p className="mb-3 text-[15px] text-slate-700 dark:text-slate-300">
                Swap the sides of each line: read the pair at <code className="font-mono">nums[2 * i]</code> and <code className="font-mono">nums[2 * i + 1]</code>, write
                them at <code className="font-mono">ans[i]</code> and <code className="font-mono">ans[i + n]</code>.
              </p>
              <CodeBlock file="unshuffle.c · C" code={UNSHUFFLE_RUN} copy run={UNSHUFFLE_RUN} />
            </div>
          </details>
        </div>
      </section>
    </DsaLessonLayout>
  );
}
