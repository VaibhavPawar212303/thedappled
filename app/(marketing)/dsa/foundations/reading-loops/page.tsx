import type { Metadata } from "next";
import { DsaLessonLayout, SectionHead } from "../../_components/dsa-lesson-layout";
import { CodeBlock } from "../../_components/code-block";
import { GrowthCounter } from "../../_components/growth-counter";
import { Cards, DataTable, Figure, KeyIdea, P, PlainSteps, Tip } from "../../_components/lesson-blocks";

// Design: Penpot "27 - DSA Learning Path", page "Foundations 2 – Reading loops".
// Animated isometric illustrations: public/dsa/reading-loops/*.svg, made by scripts/gen-dsa-illustrations.mjs.

export const metadata: Metadata = {
  title: "Reading loops: Big-O basics – DSA for beginners, step 2",
  description:
    "DSA Foundations step 2: read Big-O straight from code, step by step. What O(n) really means, how to simplify 3n² + 5n + 2, and the four patterns: no loop O(1), one loop O(n), a loop inside a loop O(n²), and halving O(log n) — with animations, tables and C.",
  alternates: { canonical: "/dsa/foundations/reading-loops" },
};

const PIC = "/dsa/reading-loops";

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
      intro="Big-O is a short label for how the work grows as the input grows. Learn what it means, how to simplify it, and how to read it straight from the code: no loop, one loop, a loop inside a loop, and halving."
      minutes={20}
      toc={TOC}
    >
      <section>
        <SectionHead n={1} id="big-o" title="What Big-O tells you" />
        <P>
          Big-O answers one question: <strong>if the input gets bigger, how much more work does the algorithm do?</strong> We call the size of the input n (how many
          items in the list). Big-O describes the <em>shape</em> of the work as n grows, not the exact number of seconds.
        </P>
        <Cards
          items={[
            { big: "O( )", t: "Read it as “grows like”", d: "O(n) means “the steps grow like n”." },
            { big: "n", t: "The size of the input", d: "How many items: names, numbers, pages." },
            { big: "n²", t: "The shape of the work", d: "n² means n × n steps: double n, four times the work." },
          ]}
        />
        <Figure
          src={`${PIC}/big-o-shapes.svg`}
          alt="As n goes 2, 4, 8: O(1) stays one block, O(log n) adds one block, O(n) doubles, O(n²) grows into a square wall"
          caption="Each block is one step. Double n and O(1) stays the same, O(log n) adds one, O(n) doubles, and O(n²) becomes four times bigger."
        />
        <DataTable
          caption="How many steps for each shape?"
          head={["Big-O", "n = 10", "n = 100", "n = 1,000", "n = 1,000,000"]}
          rows={[
            ["O(1)", "1", "1", "1", "1"],
            ["O(log n)", "≈ 3", "≈ 7", "≈ 10", "≈ 20"],
            ["O(n)", "10", "100", "1,000", "1,000,000"],
            ["O(n²)", "100", "10,000", "1,000,000", "1,000,000,000,000"],
          ]}
        />
        <P>Try it yourself: pick an n and see how each shape grows.</P>
        <GrowthCounter />
        <P>Real code rarely does exactly n steps. Big-O keeps only the part that matters for big inputs, with two simple rules:</P>
        <Cards
          items={[
            { t: "Drop constants", d: "2n and n grow the same way, so both are O(n)." },
            { t: "Keep the biggest part", d: "n² + n is O(n²): for big n, the n² part is almost all the work." },
            { t: "Think big", d: "Big-O is about large inputs, where the difference really shows." },
          ]}
        />
        <PlainSteps
          title="Worked example: simplify 3n² + 5n + 2"
          steps={[
            "Write the step count: 3n² + 5n + 2.",
            "Keep only the part that grows fastest: 3n².",
            "Drop the number in front: n².",
            "So the algorithm is O(n²).",
          ]}
        />
        <Tip title="Why is it safe to drop the rest?">
          At n = 1,000 the 3n² part is 3,000,000 steps, while 5n + 2 is only 5,002, less than 0.2% of the total. For big n the small parts don&apos;t change the picture.
        </Tip>
      </section>

      <section>
        <SectionHead n={2} id="one-loop" title="One loop: O(n)" />
        <P>Everyday example: reading every name on a class register out loud. 30 names, 30 reads. 60 names, 60 reads.</P>
        <Figure
          src={`${PIC}/one-loop.svg`}
          alt="A pointer visits each of 8 items once while a counter goes from 1 step to 8 steps"
          caption="One loop visits every item once: 8 items, 8 steps."
        />
        <PlainSteps title="Print every item" steps={["Start at the first item.", "Print it.", "Move to the next item, and repeat until the end."]} />
        <div className="mt-4">
          <CodeBlock file="print_all.c · C" code={ONE} />
        </div>
        <DataTable head={["Items (n)", "Times the loop body runs"]} rows={[["5", "5"], ["100", "100"], ["1,000", "1,000"]]} hot={1} />
        <P>
          The loop body runs once per item. Double the items and you double the work. That&apos;s O(n), also called <strong>linear time</strong>: the steps grow in a
          straight line with n.
        </P>
        <Tip title="How to spot it">A loop that goes from the first item to the last, one item at a time, is O(n).</Tip>
      </section>

      <section>
        <SectionHead n={3} id="nested-loops" title="A loop inside a loop: O(n²)" />
        <P>
          Everyday example: everyone in a room shakes hands with everyone (we count shaking your own hand, to keep it simple). Each of the n people does n handshakes:
          n × n in total.
        </P>
        <Figure
          src={`${PIC}/nested-loop.svg`}
          alt="A 4 by 4 grid: for each row (outer loop), a pointer visits all 4 columns (inner loop) and the cells light up, 16 steps in total"
          caption="The outer loop picks a row (purple); the inner loop visits every column in that row. 4 rows × 4 columns = 16 steps."
        />
        <PlainSteps
          title="Print every pair of items"
          steps={["Pick the first item.", "Pair it with every item in the list, one by one.", "Move to the next item and do it again.", "Stop after the last item."]}
        />
        <div className="mt-4">
          <CodeBlock file="print_pairs.c · C" code={PAIRS} />
        </div>
        <DataTable head={["Items (n)", "Steps (n × n)"]} rows={[["10", "100"], ["100", "10,000"], ["1,000", "1,000,000"]]} hot={1} />
        <P>
          For each of the n items, the inner loop runs n times: n × n = n² steps. Ten times more items means a hundred times more work. That&apos;s O(n²),{" "}
          <strong>quadratic time</strong>.
        </P>
        <Tip title="Spot it fast">Two nested loops over the same list usually mean O(n²). Three nested loops mean O(n³).</Tip>
      </section>

      <section>
        <SectionHead n={4} id="halving" title="Halving: O(log n)" />
        <P>
          Play “guess my number” between 1 and 100. If you always guess the middle and I say “higher” or “lower”, you throw away half the numbers each time: 100 → 50 →
          25 → 13 → 7 → 4 → 2 → 1. You never need more than 7 guesses.
        </P>
        <Figure
          src={`${PIC}/halving.svg`}
          alt="16 items: each step cuts the group in the middle and keeps one half, 16, 8, 4, 2, 1, found after 4 steps"
          caption="Each step cuts what's left in half: 16 → 8 → 4 → 2 → 1. Four steps for 16 items."
        />
        <PlainSteps
          title="Keep halving"
          steps={["Look at the middle of what's left.", "If it's the answer, stop.", "Otherwise keep only the half that can still hold the answer.", "Repeat until one item is left."]}
        />
        <div className="mt-4">
          <CodeBlock file="halving.c · C" code={HALF} />
        </div>
        <DataTable head={["Items (n)", "Halvings to reach 1 (log₂ n)"]} rows={[["8", "3"], ["16", "4"], ["1,024", "10"], ["1,000,000", "≈ 20"]]} hot={1} />
        <P>
          <strong>log₂ n is simply “how many times can I halve n before I reach 1?”</strong> Doubling n adds just one more step. For a million items that&apos;s only about
          20 steps. That&apos;s O(log n), <strong>logarithmic time</strong>.
        </P>
      </section>

      <section>
        <SectionHead n={5} id="no-loop" title="No loop: O(1)" />
        <P>Everyday example: going straight to locker number 7. You don&apos;t open lockers 1 to 6 first, so a longer corridor doesn&apos;t slow you down.</P>
        <Figure
          src={`${PIC}/no-loop.svg`}
          alt="The list grows from 4 to 8 to 16 items, but an arrow always goes straight to a[0]: one step every time"
          caption="The list grows from 4 to 8 to 16 items, but reading a[0] is still one step."
        />
        <div className="mt-6">
          <CodeBlock file="first.c · C" code={FIRST} />
        </div>
        <P>Reading one item by its position takes the same single step whether the list has 10 items or 10 million. That&apos;s O(1), <strong>constant time</strong>.</P>
        <DataTable
          caption="Cheat sheet: read Big-O from the code"
          head={["Code pattern", "Big-O", "Name", "Steps for n = 1,000"]}
          rows={[
            ["No loop", "O(1)", "constant", "1"],
            ["Halving loop", "O(log n)", "logarithmic", "≈ 10"],
            ["One loop", "O(n)", "linear", "1,000"],
            ["Loop inside a loop", "O(n²)", "quadratic", "1,000,000"],
          ]}
          hot={1}
        />
        <KeyIdea title="Cheat sheet">No loop → O(1). Halving → O(log n). One loop → O(n). Loop inside a loop → O(n²).</KeyIdea>
      </section>
    </DsaLessonLayout>
  );
}
