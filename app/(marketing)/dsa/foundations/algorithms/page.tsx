import type { Metadata } from "next";
import { DsaLessonLayout, SectionHead } from "../../_components/dsa-lesson-layout";
import { CodeBlock } from "../../_components/code-block";
import { Cards, Figure, Illustration, KeyIdea, P, PlainSteps, Tip } from "../../_components/lesson-blocks";

// Animated isometric illustrations (public/dsa/algorithms/*.svg, made by scripts/gen-dsa-illustrations.mjs).
const PIC = "/dsa/algorithms";

// Design: Penpot "27 - DSA Learning Path", page "Foundations 1 – What is an algorithm?".

export const metadata: Metadata = {
  title: "What is an algorithm? – DSA for beginners, step 1",
  description:
    "DSA Foundations step 1: what an algorithm is, two ways to find a name in a phone book, why we count steps instead of seconds, and what n means — in plain English, then C.",
  alternates: { canonical: "/dsa/foundations/algorithms" },
};

const TOC = [
  { id: "recipe", label: "An algorithm is a recipe" },
  { id: "phone-book", label: "Two ways to find a name" },
  { id: "count-steps", label: "Count steps, not seconds" },
  { id: "what-n-means", label: "What n means" },
];

const SUM = `int sum(int a[], int n) {
  int total = 0;               // step 1
  for (int i = 0; i < n; i++)  // step 2: one by one
    total = total + a[i];      // step 3: once per number
  return total;                // step 4
}`;

const HALVING = ["1,000", "500", "250", "125", "63", "32", "16", "8", "4", "2", "1"];

export default function AlgorithmsLessonPage() {
  return (
    <DsaLessonLayout
      step="dsa-algorithms"
      intro="An algorithm is a list of steps that solves a problem. See why some step lists finish fast and others crawl, using a phone book, a list of numbers and a few lines of C."
      minutes={12}
      toc={TOC}
    >
      <section>
        <SectionHead n={1} id="recipe" title="An algorithm is a recipe" />
        <P>An algorithm is a list of steps that solves a problem, in a fixed order. You follow algorithms every day without calling them that.</P>
        <Cards
          items={[
            { t: "Making tea", d: "Boil water, add tea, wait 3 minutes, pour." },
            { t: "Finding a contact", d: "Scroll your phone's list until you see the name." },
            { t: "Sorting playing cards", d: "Find the smallest card, put it first, repeat." },
          ]}
        />
        <Figure
          src={`${PIC}/recipe.svg`}
          alt="Four steps as a staircase (boil water, add tea, wait, pour) lighting up one after another"
          caption="An algorithm runs its steps in a fixed order, from the first to the last."
        />
        <KeyIdea>
          A computer can&apos;t guess. An algorithm spells out every step so the computer can follow it exactly, and so we can count how many steps it takes.
        </KeyIdea>
      </section>

      <section>
        <SectionHead n={2} id="phone-book" title="Two ways to find a name" />
        <P>Imagine a printed phone book with 1,000 names, sorted A to Z. You want to find “Meera”. Here are two algorithms that both work:</P>
        <div data-testid="phone-book" className="mt-6 grid gap-4 rounded-2xl border bg-card p-4 sm:grid-cols-2 sm:p-5">
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/30">
            <Illustration
              src={`${PIC}/phone-book-scan.svg`}
              alt="A row of ten pages; a pointer checks each one in turn and finds the name on the eighth look"
              className="-mx-5 -mt-5 mb-4 rounded-t-xl border-b border-red-200 dark:border-red-900"
            />
            <p className="font-bold">Way 1: check every name</p>
            <p className="mt-1 text-sm text-muted-foreground">Start at the first page and read each name until you find it.</p>
            <p className="mt-4 text-3xl font-extrabold text-red-700 dark:text-red-400">up to 1,000 looks</p>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">Twice the names → twice the looks.</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
            <Illustration
              src={`${PIC}/phone-book-halve.svg`}
              alt="Sixteen pages; each look opens the middle and the other half fades away, finding the name in four looks"
              className="-mx-5 -mt-5 mb-4 rounded-t-xl border-b border-emerald-200 dark:border-emerald-900"
            />
            <p className="font-bold">Way 2: open the middle</p>
            <p className="mt-1 text-sm text-muted-foreground">Names are sorted. Open the middle, keep the half with your name, repeat.</p>
            <p className="mt-4 text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">about 10 looks</p>
            <p className="mt-3 font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300">{HALVING.join(" → ")}</p>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">Each look throws away half the names.</p>
          </div>
        </div>
        <P>
          Both give the right answer. The difference is how much work they do. If the book doubles to 2,000 names, Way 1 can need 2,000 looks, but Way 2 needs only one
          more look (about 11).
        </P>
        <Tip>A correct answer is not enough. A good algorithm is correct and does as little work as possible.</Tip>
      </section>

      <section>
        <SectionHead n={3} id="count-steps" title="Count steps, not seconds" />
        <P>
          Why not just time the code with a stopwatch? Because the same code runs faster on a new laptop than on an old phone. Seconds tell you about the computer.
          Steps tell you about the algorithm.
        </P>
        <Figure
          src={`${PIC}/sum.svg`}
          alt="Numbers 3, 1, 4, 1 and 5 hop one by one into a total box that counts up to 14"
          caption="One addition per number: 5 numbers, 5 additions."
        />
        <PlainSteps
          title="Add up a list of numbers"
          steps={["Start with a total of 0.", "Go through the numbers one by one.", "Add each number to the total.", "When you reach the end, the total is the answer."]}
        />
        <div className="mt-4">
          <CodeBlock file="sum.c · C" code={SUM} />
        </div>
        <P>For a list of 5 numbers this does 5 additions. For 1,000 numbers, 1,000 additions. The number of steps follows the size of the list, on any computer.</P>
      </section>

      <section>
        <SectionHead n={4} id="what-n-means" title="What n means" />
        <P>We use the letter n for the size of the input: how many numbers are in the list, how many names are in the book. Then we describe the work using n.</P>
        <Cards
          items={[
            { big: "n", t: "Sum a list", d: "n additions: one per number." },
            { big: "n", t: "Phone book, way 1", d: "Up to n looks: one per name." },
            { big: "log n", t: "Phone book, way 2", d: "About log₂ n looks: halve until one name is left." },
          ]}
        />
        <Figure
          src={`${PIC}/n-grows.svg`}
          alt="As n goes from 4 to 8 to 16, a row of n blocks doubles while a log n tower grows by one block"
          caption="n = 4, 8, 16: the n-step row doubles each time, the log n tower adds just one block."
        />
        <KeyIdea title="Coming up">Big-O is a short label for how the number of steps grows as n grows. Next you&apos;ll meet the core DSA techniques and the C you need to write them; in step 7 you&apos;ll learn to read Big-O straight from a loop.</KeyIdea>
      </section>
    </DsaLessonLayout>
  );
}
