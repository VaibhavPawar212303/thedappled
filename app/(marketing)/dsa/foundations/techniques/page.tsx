import type { Metadata } from "next";
import { DsaLessonLayout, SectionHead } from "../../_components/dsa-lesson-layout";
import { Cards, DataTable, Figure, KeyIdea, P, Tip } from "../../_components/lesson-blocks";

// Design: Penpot "27 - DSA Learning Path", page "Foundations 3 – DSA techniques".
// Animated isometric illustrations: public/dsa/techniques/*.svg, made by scripts/gen-dsa-illustrations.mjs.

export const metadata: Metadata = {
  title: "DSA techniques: 20 problem-solving patterns with real-world examples – DSA step 3",
  description:
    "DSA Foundations step 3: what a technique is, then 20 core techniques in five families, from traversal, two pointers and sliding window to hashing, binary search, recursion, greedy, dynamic programming, BFS and DFS. Each with a real-world picture and the clues that point to it in a question.",
  alternates: { canonical: "/dsa/foundations/techniques" },
};

const PIC = "/dsa/techniques";

const TOC = [
  { id: "what-is-a-technique", label: "What is a technique?" },
  { id: "going-through-data", label: "Going through data" },
  { id: "searching", label: "Searching and looking up faster" },
  { id: "breaking-down", label: "Breaking problems down" },
  { id: "smart-choices", label: "Making smart choices" },
  { id: "graphs", label: "Trees, graphs and bits" },
  { id: "spot-it", label: "Spot the technique" },
];

export default function TechniquesLessonPage() {
  return (
    <DsaLessonLayout
      step="dsa-techniques"
      intro="A technique is a reusable way of working on data. Most coding questions use one of about 20. Meet each one with a real-world picture, so you can spot it when you read a question."
      minutes={15}
      toc={TOC}
    >
      <section>
        <SectionHead n={1} id="what-is-a-technique" title="What is a technique?" />
        <P>
          A data structure is where the data lives. An algorithm is the exact steps for one task. A <strong>technique</strong> sits in between: a general way of working on
          the data that you can reuse in many different algorithms.
        </P>
        <Figure
          src={`${PIC}/kitchen.svg`}
          alt="Three kitchen stations light up in turn: jars (the containers), a carrot being chopped (the technique), and a recipe card whose lines tick off (the algorithm)"
          caption="In a kitchen, the containers are the data structure, chopping is the technique, and the recipe is the algorithm. Chopping works for onions, carrots and herbs: one technique, many recipes."
        />
        <Cards
          items={[
            { t: "Data structure", d: "How the data is stored. In a kitchen: the containers, like a shelf, a spice rack or a fridge." },
            { t: "Technique", d: "A general way of working on the data. In a kitchen: chopping, stirring, boiling." },
            { t: "Algorithm", d: "The exact steps for one task. In a kitchen: the recipe for pancakes." },
          ]}
        />
        <KeyIdea>Questions look different on the surface, but most use one of about 20 techniques. Spot the technique and the question is half solved.</KeyIdea>
      </section>

      <section>
        <SectionHead n={2} id="going-through-data" title="Going through data" />
        <P>The first five techniques are ways to walk through a list. Most easy questions use one of them.</P>
        <Figure
          src={`${PIC}/going-through.svg`}
          alt="A row of 8 numbers: first one pointer visits each item, then two pointers move in from both ends, then an amber window over 3 items slides along while its sum changes"
          caption="Three ways to walk the same list: one pointer visits every item, two pointers meet in the middle, and a window of 3 slides along."
        />
        <Cards
          items={[
            { big: "→", t: "Traversal", d: "Visit every item once, in order. Like reading a class register from top to bottom." },
            { big: "Σ", t: "Prefix sum", d: "Keep running totals, so any range sum takes one step. Like the running balance on a bank statement." },
            { big: "→ ←", t: "Two pointers", d: "Two markers move through the list, often from both ends. Like two people walking towards each other along a shelf." },
            { big: "[ ]→", t: "Sliding window", d: "Look at a section that slides along the list. Like looking out of a moving train window." },
            { big: "» ›", t: "Fast and slow pointers", d: "One moves 2 steps, the other 1. Like two runners on a track: the faster one laps the slower one." },
          ]}
        />
        <Tip title="Spot it in the question">“Subarray”, “contiguous”, “sum of a range” or “sorted array, find a pair” usually point to one of these.</Tip>
      </section>

      <section>
        <SectionHead n={3} id="searching" title="Searching and looking up faster" />
        <P>These five help you find things without checking every item, often turning O(n²) into O(n) or O(log n).</P>
        <Figure
          src={`${PIC}/hashing.svg`}
          alt="Five lockers: Ana, Raj and Mia each drop straight into their own locker; then “find Raj” points straight at locker 0"
          caption="Hashing turns a name into a locker number, so storing and finding a name each take one step."
        />
        <Cards
          items={[
            { big: "#", t: "Hashing", d: "Jump straight to an item by its key. Like going straight to locker number 7." },
            { big: "½", t: "Binary search", d: "Cut the search space in half each step. Like guessing a number with “higher or lower?”." },
            { big: "1 2 3", t: "Sorting first", d: "Put the data in order so the rest is easy. Like sorting your cards before looking for a run." },
            { big: "▁▃▅", t: "Monotonic stack", d: "A stack kept in order, to find the next bigger or smaller item. Like looking along a queue for the next person taller than you." },
            { big: "▲", t: "Heap / top K", d: "Always keep the smallest or largest item ready. Like a hospital that always treats the most urgent patient first." },
          ]}
        />
        <Tip title="Spot it in the question">“Duplicates”, “count”, “sorted”, “next greater” or “k largest” usually point to one of these.</Tip>
      </section>

      <section>
        <SectionHead n={4} id="breaking-down" title="Breaking problems down" />
        <P>When a problem is too big to solve in one go, these split it into smaller pieces.</P>
        <Figure
          src={`${PIC}/divide-conquer.svg`}
          alt="Merge sort in rows: 8 numbers split into two groups of 4, then four pairs; each pair is sorted, the pairs merge into two sorted groups, then into one sorted row 1 to 8"
          caption="Divide and conquer (merge sort): split until the pieces are tiny, sort the tiny pieces, then merge them back together in order."
        />
        <Cards
          items={[
            { big: "↻", t: "Recursion", d: "Solve a smaller copy of the same problem. Like opening Russian dolls until you reach the smallest one." },
            { big: "÷", t: "Divide and conquer", d: "Split in half, solve each half, then combine. Like two teachers each sorting half the exam papers, then merging the piles." },
            { big: "↶", t: "Backtracking", d: "Try a choice and go back if it fails. Like finding your way out of a maze." },
          ]}
        />
        <Tip title="Spot it in the question">“All combinations”, “all permutations” or “every possible way” usually point to backtracking.</Tip>
      </section>

      <section>
        <SectionHead n={5} id="smart-choices" title="Making smart choices" />
        <P>For “find the best” questions: the cheapest, the shortest, the most, or the number of ways.</P>
        <Figure
          src={`${PIC}/greedy.svg`}
          alt="Coins 50, 20, 10, 5 and 1: to pay 65, 50 is taken, 20 is skipped because it is too big, then 10 and 5 are taken"
          caption="Greedy: to pay 65, always take the biggest coin that still fits. 50 + 10 + 5, three coins."
        />
        <Figure
          src={`${PIC}/dynamic-programming.svg`}
          alt="A staircase of 6 stairs: the number of ways to climb each one appears in turn, 1, 2, 3, 5, 8, 13, each the sum of the two before it"
          caption="Dynamic programming: the ways to climb 6 stairs (1 or 2 at a time) build on the answers you already wrote down: 1, 2, 3, 5, 8, 13."
        />
        <Cards
          items={[
            { big: "★", t: "Greedy", d: "Take the best-looking choice at each step. Like paying with the biggest coin first." },
            { big: "▦", t: "Dynamic programming", d: "Remember answers to small problems so you never solve them twice. Like writing down 7 × 8 once instead of working it out every time." },
          ]}
        />
        <Tip title="Spot it in the question">“Minimum”, “maximum” or “number of ways” usually point to greedy or dynamic programming.</Tip>
      </section>

      <section>
        <SectionHead n={6} id="graphs" title="Trees, graphs and bits" />
        <P>
          Trees and graphs are data where items connect to other items, like folders or a map of roads. The first four work on those connections; the last one is a trick for
          numbers.
        </P>
        <Figure
          src={`${PIC}/bfs.svg`}
          alt="A small graph: starting at S, its neighbours light up as level 1, then their neighbours as level 2, then level 3, with rings spreading out like ripples"
          caption="BFS visits a graph level by level, like ripples spreading out from where a stone hits the water."
        />
        <Cards
          items={[
            { big: "◎", t: "BFS", d: "Breadth-first search: explore level by level. Like ripples spreading out in water." },
            { big: "↓", t: "DFS", d: "Depth-first search: go as deep as possible, then come back. Like exploring a maze one path at a time." },
            { big: "1→2→3", t: "Topological sort", d: "Put tasks in order when some depend on others. Like getting dressed: socks before shoes." },
            { big: "∪", t: "Union-Find", d: "Quickly check if two items are in the same group. Like friend circles: are A and B connected?" },
            { big: "0 1", t: "Bit manipulation", d: "Work with the 0s and 1s of a number. Like a row of light switches, each on or off." },
          ]}
        />
        <Tip title="Spot it in the question">“Shortest path”, “levels”, “connected”, “islands” or “dependencies” usually point to one of these.</Tip>
      </section>

      <section>
        <SectionHead n={7} id="spot-it" title="Spot the technique" />
        <P>Read the question, look for the clue, then try the matching technique first. Keep this table nearby while you practise.</P>
        <DataTable
          caption="Cheat sheet: clue in the question → technique"
          head={["Clue in the question", "Try this first"]}
          rows={[
            ["Visit every item, build a new array", "Traversal"],
            ["Sum of a range, asked many times", "Prefix sum"],
            ["Sorted array, find a pair", "Two pointers"],
            ["Longest or shortest subarray", "Sliding window"],
            ["Seen before? Count? Duplicates?", "Hashing"],
            ["Sorted, find a value fast", "Binary search"],
            ["Next greater or smaller item", "Monotonic stack"],
            ["The k largest or k smallest", "Heap / top K"],
            ["All combinations or permutations", "Backtracking"],
            ["Number of ways, minimum cost", "Dynamic programming"],
            ["Shortest path, levels", "BFS"],
            ["Tasks that depend on other tasks", "Topological sort"],
          ]}
          hot={1}
          plain
        />
        <P>
          Practice habit: after every problem you solve, write down its technique, for example “Concatenation of Array → Traversal”. After about 50 problems you&apos;ll
          start to spot the technique as you read.
        </P>
        <KeyIdea title="Learn them in order">Start with going through data and searching. They cover most easy questions, and the later techniques build on them.</KeyIdea>
      </section>
    </DsaLessonLayout>
  );
}
