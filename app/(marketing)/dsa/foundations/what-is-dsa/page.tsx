import type { Metadata } from "next";
import { DsaLessonLayout, SectionHead } from "../../_components/dsa-lesson-layout";
import { CodeBlock } from "../../_components/code-block";
import { Cards, Figure, KeyIdea, P, PlainSteps, Tip } from "../../_components/lesson-blocks";

// Isometric illustrations for the data structure cards (public/dsa/what-is-dsa/*.svg).
const pic = (name: string, alt: string) => ({ src: `/dsa/what-is-dsa/${name}.svg`, alt });

// Design: Penpot "27 - DSA Learning Path", page "Foundations 0 – What is DSA?".

export const metadata: Metadata = {
  title: "What is DSA? Data structures and algorithms explained simply – start here",
  description:
    "Start here: what DSA (Data Structures and Algorithms) means, everyday examples of arrays, stacks, queues, hash maps, trees and graphs, a first algorithm in plain English and C, and why DSA matters.",
  alternates: { canonical: "/dsa/foundations/what-is-dsa" },
};

const TOC = [
  { id: "what-dsa-means", label: "What DSA means" },
  { id: "data-structures", label: "Data structures: ways to store data" },
  { id: "algorithms", label: "Algorithms: steps that use the data" },
  { id: "why", label: "Why learn DSA?" },
  { id: "how-it-works", label: "How this path works" },
];

const TALLEST = `int tallest(int h[], int n) {
  int best = h[0];              // step 1
  for (int i = 1; i < n; i++)   // step 2
    if (h[i] > best)            // step 3
      best = h[i];
  return best;                  // step 4
}`;

export default function WhatIsDsaLessonPage() {
  return (
    <DsaLessonLayout
      step="dsa-intro"
      intro="DSA stands for Data Structures and Algorithms: how to store data, and the steps that use it. Start here to see what that means with everyday examples, why it matters, and how this path works."
      minutes={10}
      toc={TOC}
    >
      <section>
        <SectionHead n={1} id="what-dsa-means" title="What DSA means" />
        <P>
          DSA stands for Data Structures and Algorithms. It is two ideas that always work together: a data structure is how you store your data, and an algorithm is
          the list of steps that does something with it.
        </P>
        <Cards
          items={[
            { big: "DS", t: "Data structure", d: "How you organise data so it is easy to use." },
            { big: "A", t: "Algorithm", d: "The steps that solve a problem using that data." },
            { big: "DS + A", t: "Together", d: "The right structure makes the steps short and fast." },
          ]}
        />
        <KeyIdea>
          Every app you use is data plus steps. Your contacts list, a maps route and a shopping cart are all data structures with algorithms working on them.
        </KeyIdea>
      </section>

      <section>
        <SectionHead n={2} id="data-structures" title="Data structures: ways to store data" />
        <P>You already use data structures in real life. Each one is good at a different job:</P>
        <Cards
          items={[
            { t: "Array", d: "A row of numbered boxes, like seats in a cinema row. Jump straight to seat 5.", img: pic("array", "A row of six numbered boxes; box 5 is reached directly") },
            { t: "Stack", d: "A pile of plates. You add to the top and take from the top.", img: pic("stack", "A pile of plates; push adds to the top, pop takes from the top") },
            { t: "Queue", d: "A line at a ticket counter. The first person in is served first.", img: pic("queue", "A line of blocks; new ones join at the back, the front one leaves first") },
            { t: "Hash map", d: "A dictionary. Look up a word and get its meaning straight away.", img: pic("hash-map", "Keys cat, sun and map each drop straight into their own bucket") },
            { t: "Tree", d: "A family tree, or folders inside folders on your computer.", img: pic("tree", "A root block with two branches, each with two more branches") },
            { t: "Graph", d: "A map of cities and roads: anything connected to anything.", img: pic("graph", "Five city blocks joined by roads; one route is highlighted") },
          ]}
        />
        <Tip>Picking the right structure is half the work. Finding a word is slow in a pile of loose pages and fast in a sorted dictionary.</Tip>
      </section>

      <section>
        <SectionHead n={3} id="algorithms" title="Algorithms: steps that use the data" />
        <P>An algorithm is a list of steps. Here is one that works on a simple array of heights:</P>
        <Figure
          src="/dsa/what-is-dsa/tallest.svg"
          alt="Six people as pillars of different heights in a line; the tallest, 222, is highlighted"
          caption="Heights in a line. Walk down it once, remembering the tallest so far: here it ends at 222."
        />
        <PlainSteps
          title="Find the tallest person in a line"
          steps={[
            "Remember the first person's height as the tallest so far.",
            "Walk down the line, one person at a time.",
            "If someone is taller than the tallest so far, remember them instead.",
            "At the end of the line, the person you remember is the tallest.",
          ]}
        />
        <div className="mt-4">
          <CodeBlock file="tallest.c · C" code={TALLEST} />
        </div>
        <P>The data structure is an array of heights, and the algorithm walks through it once. Step 1 of this path looks at algorithms more closely.</P>
      </section>

      <section>
        <SectionHead n={4} id="why" title="Why learn DSA?" />
        <Cards
          items={[
            { t: "Faster programs", d: "The right choice can turn hours of work into seconds." },
            { t: "Job interviews", d: "Most software interviews ask DSA questions." },
            { t: "Clear thinking", d: "You learn to break a big problem into small, exact steps." },
          ]}
        />
      </section>

      <section>
        <SectionHead n={5} id="how-it-works" title="How this path works" />
        <PlainSteps
          title="Every step in Foundations"
          steps={[
            "Read the idea in plain English, with an everyday example.",
            "See it step by step in a small visual.",
            "Read the same idea in C, line by line.",
            "Answer 5 questions. 5 out of 5 marks the step done.",
          ]}
        />
        <KeyIdea title="Your path">
          Steps 1 to 4: how to measure code (algorithms and Big-O). Steps 5 to 9: the core data structures, from arrays to recursion. Then the Patterns & advanced
          track.
        </KeyIdea>
      </section>
    </DsaLessonLayout>
  );
}
