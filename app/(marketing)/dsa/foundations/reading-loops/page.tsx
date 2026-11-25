import type { Metadata } from "next";
import { DsaLessonLayout, SectionHead } from "../../_components/dsa-lesson-layout";
import { CodeBlock } from "../../_components/code-block";
import { GrowthCounter } from "../../_components/growth-counter";
import { Cards, KeyIdea, P, PlainSteps, Tip } from "../../_components/lesson-blocks";

// Design: Penpot "27 - DSA Learning Path", page "Foundations 2 – Reading loops".

export const metadata: Metadata = {
  title: "Reading loops: Big-O basics – DSA for beginners, step 2",
  description:
    "DSA Foundations step 2: read Big-O straight from code. No loop is O(1), one loop is O(n), a loop inside a loop is O(n²), and halving is O(log n) — in plain English, then C.",
  alternates: { canonical: "/dsa/foundations/reading-loops" },
};

const TOC = [
  { id: "big-o", label: "What Big-O tells you" },
  { id: "one-loop", label: "One loop: O(n)" },
  { id: "nested-loops", label: "A loop inside a loop: O(n²)" },
  { id: "halving", label: "Halving: O(log n)" },
  { id: "no-loop", label: "No loop: O(1)" },
];

const ONE = `for (int i = 0; i < n; i++) {
  printf("%d\\n", a[i]);   // runs n times
}`;

const PAIRS = `for (int i = 0; i < n; i++) {
  for (int j = 0; j < n; j++) {
    printf("%d %d\\n", a[i], a[j]);   // runs n × n times
  }
}`;

const HALF = `int steps = 0;
while (n > 1) {
  n = n / 2;   // throw away half
  steps++;
}
// n = 1,000 → steps = 9`;

const FIRST = `int first = a[0];   // one step, whatever n is`;

export default function ReadingLoopsLessonPage() {
  return (
    <DsaLessonLayout
      step="dsa-reading-loops"
      intro="Big-O is a short label for how the work grows as the input grows. Learn to read it straight from the code: no loop, one loop, a loop inside a loop, and halving."
      minutes={15}
      toc={TOC}
    >
      <section>
        <SectionHead n={1} id="big-o" title="What Big-O tells you" />
        <P>Big-O answers one question: if the input gets bigger, how much more work does the algorithm do? It ignores small details and keeps the big picture.</P>
        <Cards
          items={[
            { t: "Drop constants", d: "2n and n grow the same way, so both are O(n)." },
            { t: "Keep the biggest part", d: "n² + n is O(n²): for big n, the n² part is almost all the work." },
            { t: "Think big", d: "Big-O is about large inputs, where the difference really shows." },
          ]}
        />
        <GrowthCounter />
      </section>

      <section>
        <SectionHead n={2} id="one-loop" title="One loop: O(n)" />
        <PlainSteps title="Print every item" steps={["Start at the first item.", "Print it.", "Move to the next item, and repeat until the end."]} />
        <div className="mt-4">
          <CodeBlock file="print_all.c · C" code={ONE} />
        </div>
        <P>The loop body runs once per item. Double the items and you double the work. That&apos;s O(n), also called linear time.</P>
      </section>

      <section>
        <SectionHead n={3} id="nested-loops" title="A loop inside a loop: O(n²)" />
        <PlainSteps
          title="Print every pair of items"
          steps={["Pick the first item.", "Pair it with every item in the list, one by one.", "Move to the next item and do it again.", "Stop after the last item."]}
        />
        <div className="mt-4">
          <CodeBlock file="print_pairs.c · C" code={PAIRS} />
        </div>
        <P>
          For each of the n items, the inner loop runs n times: n × n = n² steps. With 10 items that&apos;s 100 steps; with 1,000 items it&apos;s 1,000,000. That&apos;s
          O(n²), quadratic time.
        </P>
        <Tip title="Spot it fast">Two nested loops over the same list usually mean O(n²). Three nested loops mean O(n³).</Tip>
      </section>

      <section>
        <SectionHead n={4} id="halving" title="Halving: O(log n)" />
        <P>
          Play “guess my number” between 1 and 100. If you always guess the middle and I say “higher” or “lower”, you throw away half the numbers each time: 100 → 50 →
          25 → 13 → 7 → 4 → 2 → 1. You never need more than 7 guesses.
        </P>
        <PlainSteps
          title="Keep halving"
          steps={["Look at the middle of what's left.", "If it's the answer, stop.", "Otherwise keep only the half that can still hold the answer.", "Repeat until one item is left."]}
        />
        <div className="mt-4">
          <CodeBlock file="halving.c · C" code={HALF} />
        </div>
        <P>The number of steps is how many times you can halve n: about log₂ n. For a million items that&apos;s only about 20 steps. That&apos;s O(log n), logarithmic time.</P>
      </section>

      <section>
        <SectionHead n={5} id="no-loop" title="No loop: O(1)" />
        <div className="mt-6">
          <CodeBlock file="first.c · C" code={FIRST} />
        </div>
        <P>Reading one item by its position takes the same single step whether the list has 10 items or 10 million. That&apos;s O(1), constant time.</P>
        <KeyIdea title="Cheat sheet">No loop → O(1). Halving → O(log n). One loop → O(n). Loop inside a loop → O(n²).</KeyIdea>
      </section>
    </DsaLessonLayout>
  );
}
