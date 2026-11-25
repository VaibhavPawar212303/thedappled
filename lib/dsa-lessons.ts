// DSA learning path: the roadmap steps and the lesson quizzes. Used by the /dsa pages (to render
// the roadmap, sidebar and quiz) and by the DSA quiz API (to grade answers on the server).
// No server-only imports here.

export type DsaQuestion = { q: string; options: string[]; answer: number; why: string };

// A roadmap step. id is the progress key (an AssignmentEvent name). No href = coming soon.
export type DsaStep = { n: number; id: string; title: string; blurb: string; href?: string; isNew?: boolean };

// Progress for the Foundations track is stored as one Assignment (slug below, tool "none") per
// learner, with one verified event per completed step. It is not part of the Testing leaderboards.
export const DSA_FOUNDATIONS = "dsa-foundations";

// Steps 1-4 replace the earlier single "Complexity & Big-O" lesson (id "dsa-complexity"), split
// into short beginner lessons. Design: Penpot "27 - DSA Learning Path", pages "Foundations 1-4".
// Step 0 ("Start here") was added before step 1 so the existing step numbers stay the same.
export const FOUNDATIONS_STEPS: DsaStep[] = [
  { n: 0, id: "dsa-intro", title: "What is DSA?", blurb: "Data structures and algorithms in plain words, with everyday examples.", href: "/dsa/foundations/what-is-dsa", isNew: true },
  { n: 1, id: "dsa-algorithms", title: "What is an algorithm?", blurb: "Recipes, the phone-book search, and counting steps instead of seconds.", href: "/dsa/foundations/algorithms", isNew: true },
  { n: 2, id: "dsa-reading-loops", title: "Reading loops", blurb: "No loop O(1), one loop O(n), loop in a loop O(n²), halving O(log n).", href: "/dsa/foundations/reading-loops", isNew: true },
  { n: 3, id: "dsa-comparing", title: "Comparing two solutions", blurb: "Best and worst case, brute force vs better, and O, Ω and Θ.", href: "/dsa/foundations/comparing-solutions", isNew: true },
  { n: 4, id: "dsa-growth-memory", title: "Growth rates & memory", blurb: "Nine growth rates from O(1) to O(n!), and space complexity.", href: "/dsa/foundations/growth-rates", isNew: true },
  { n: 5, id: "dsa-arrays", title: "Arrays & strings", blurb: "Indexing, in-place updates, prefix sums and string building." },
  { n: 6, id: "dsa-hashing", title: "Hashing", blurb: "Hash maps and sets for counting, lookups and de-duplication." },
  { n: 7, id: "dsa-linked-lists", title: "Linked lists", blurb: "Pointers, reversal, fast and slow runners, merging lists." },
  { n: 8, id: "dsa-stacks-queues", title: "Stacks & queues", blurb: "LIFO and FIFO, balanced brackets, monotonic stacks." },
  { n: 9, id: "dsa-recursion", title: "Recursion", blurb: "Base cases, the call stack, and thinking in smaller problems." },
];

const INTRO: DsaQuestion[] = [
  {
    q: "What does DSA stand for?",
    options: ["Data Structures and Algorithms", "Data Science and Analytics", "Digital Systems Architecture", "Data Storage Arrays"],
    answer: 0,
    why: "DSA is Data Structures (how you store data) and Algorithms (the steps that use it).",
  },
  {
    q: "Which of these is a data structure?",
    options: ["A stack: like a pile of plates, last in is first out", "Sorting a list", "Finding the tallest person", "A for loop"],
    answer: 0,
    why: "A stack is a way to store data. Sorting and finding the tallest are algorithms; a for loop is a piece of code.",
  },
  {
    q: "A line at a ticket counter, where the first person in is served first, works like a…",
    options: ["Stack", "Queue", "Tree", "Hash map"],
    answer: 1,
    why: "A queue is first in, first out, exactly like a line of people.",
  },
  {
    q: "Folders inside folders on your computer are organised like a…",
    options: ["Queue", "Tree", "Stack", "Array"],
    answer: 1,
    why: "A tree has one top item with branches below it, and each branch can have its own branches.",
  },
  {
    q: "Why does choosing the right data structure matter?",
    options: ["It makes the algorithm's steps shorter and faster", "It changes the programming language", "It makes the code longer", "It doesn't matter"],
    answer: 0,
    why: "The same task can take a few steps or a huge number of steps depending on how the data is stored.",
  },
];

const ALGORITHMS: DsaQuestion[] = [
  {
    q: "What is an algorithm?",
    options: ["A list of steps that solves a problem", "A type of computer", "A programming language", "A very fast program"],
    answer: 0,
    why: "An algorithm is the step-by-step method. You can write it in plain English or in any programming language.",
  },
  {
    q: "Why do we count steps instead of timing code in seconds?",
    options: ["Steps are easier to write down", "Seconds depend on the computer; steps depend on the algorithm", "Computers can't measure time", "Steps are always smaller numbers"],
    answer: 1,
    why: "The same code is faster on a new laptop than on an old phone. The number of steps stays the same on both.",
  },
  {
    q: "A sorted phone book has 1,000 names. About how many looks does “open the middle and keep half” need?",
    options: ["About 10", "About 100", "About 500", "1,000"],
    answer: 0,
    why: "1,000 → 500 → 250 → … → 1 takes about 10 halvings.",
  },
  {
    q: "In DSA, what does n usually stand for?",
    options: ["The number of loops", "The size of the input", "The number of seconds", "The name of the function"],
    answer: 1,
    why: "n is how big the input is: how many numbers in the list, how many names in the book.",
  },
  {
    q: "Adding up a list of n numbers takes how many additions?",
    options: ["1", "n", "n × n", "It depends on the computer"],
    answer: 1,
    why: "One addition per number, so n additions, on any computer.",
  },
];

const READING_LOOPS: DsaQuestion[] = [
  {
    q: "What is the Big-O of 3n² + 5n + 2?",
    options: ["O(n)", "O(n²)", "O(3n²)", "O(1)"],
    answer: 1,
    why: "Keep the biggest part (3n²) and drop the constant 3: O(n²).",
  },
  {
    q: "A single loop runs once for each of n items. Its Big-O is…",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    answer: 2,
    why: "Double the items and you double the work: that's O(n).",
  },
  {
    q: "Two loops, one inside the other, both go over all n items. How many times does the inner part run?",
    options: ["n", "2n", "n × n", "log n"],
    answer: 2,
    why: "For each of the n items, the inner loop runs n times: n × n = n², which is O(n²).",
  },
  {
    q: "A loop that halves n each time until n is 1 is…",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    answer: 1,
    why: "You can only halve n about log₂ n times, so it's O(log n).",
  },
  {
    q: "Reading a[0] from a list of 1 million items is…",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    answer: 0,
    why: "Reading one item by its position is a single step, however long the list is.",
  },
];

const COMPARING: DsaQuestion[] = [
  {
    q: "Searching a list for a number that happens to be first is the…",
    options: ["Best case", "Worst case", "Average case", "Error case"],
    answer: 0,
    why: "The luckiest input, where the answer is found straight away, is the best case.",
  },
  {
    q: "Comparing every pair of n items takes how many comparisons in the worst case?",
    options: ["n", "2n", "n(n − 1) ÷ 2", "n log n"],
    answer: 2,
    why: "Each item is paired with every item after it: (n − 1) + (n − 2) + … + 1 = n(n − 1) ÷ 2, which is O(n²).",
  },
  {
    q: "The pair check stops as soon as it finds a match. Which statement is true?",
    options: ["Its best case is Ω(1) and its worst case is O(n²)", "It is always Θ(1)", "It is always Θ(n)", "Its best case is Ω(n²)"],
    answer: 0,
    why: "If a[0] equals a[1] it stops after one comparison: Ω(1). With no duplicate it checks every pair: O(n²). Its worst case on its own is Θ(n²).",
  },
  {
    q: "Why does sorting first help the duplicate check?",
    options: ["Sorting removes duplicates", "Equal numbers end up next to each other, so one pass is enough", "A sorted list is shorter", "It doesn't help"],
    answer: 1,
    why: "After sorting, any duplicates sit side by side, so comparing each number with its neighbour finds them in one pass.",
  },
  {
    q: "For 1,000 items, how many comparisons can the pair check need?",
    options: ["1,000", "About 10,000", "499,500", "1,000,000,000"],
    answer: 2,
    why: "n(n − 1) ÷ 2 = 1,000 × 999 ÷ 2 = 499,500.",
  },
];

const GROWTH_MEMORY: DsaQuestion[] = [
  {
    q: "Which of these grows fastest as n gets large?",
    options: ["O(n²)", "O(n log n)", "O(2ⁿ)", "O(n)"],
    answer: 2,
    why: "O(2ⁿ) doubles with every extra item. At n = 100 it is already about 1.3 × 10³⁰ steps.",
  },
  {
    q: "Binary search on a sorted list of 1,000 items needs about how many steps?",
    options: ["About 10", "About 100", "About 500", "1,000"],
    answer: 0,
    why: "Each step halves the range, so it takes about log₂(1,000) ≈ 10 steps.",
  },
  {
    q: "An algorithm makes an extra array the same size as its input. Its extra space is…",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    answer: 2,
    why: "The extra memory grows in step with n, so the space complexity is O(n).",
  },
  {
    q: "Three loops nested inside each other, each over n items, are…",
    options: ["O(n)", "O(n²)", "O(n³)", "O(3n)"],
    answer: 2,
    why: "n × n × n = n³ steps, so O(n³).",
  },
  {
    q: "O(2n) simplifies to…",
    options: ["O(n)", "O(2n)", "O(n²)", "O(2ⁿ)"],
    answer: 0,
    why: "Big-O drops constants: 2n grows the same way as n.",
  },
];

export const DSA_QUIZZES: Record<string, DsaQuestion[]> = {
  "dsa-intro": INTRO,
  "dsa-algorithms": ALGORITHMS,
  "dsa-reading-loops": READING_LOOPS,
  "dsa-comparing": COMPARING,
  "dsa-growth-memory": GROWTH_MEMORY,
};

export const dsaStep = (id: string): DsaStep | undefined => FOUNDATIONS_STEPS.find((s) => s.id === id);

// Score submitted answers (one option index per question). Anything malformed scores 0 for that question.
export function gradeDsaQuiz(questions: DsaQuestion[], answers: unknown): { score: number; total: number } {
  const list = Array.isArray(answers) ? answers : [];
  const score = questions.filter((q, i) => list[i] === q.answer).length;
  return { score, total: questions.length };
}
