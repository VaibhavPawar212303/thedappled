// DSA learning path: the roadmap steps and the lesson quizzes. Used by the /dsa pages (to render
// the roadmap, sidebar and quiz) and by the DSA quiz API (to grade answers on the server).
// No server-only imports here.

export type DsaQuestion = { q: string; options: string[]; answer: number; why: string };

// A roadmap step. id is the progress key (an AssignmentEvent name). No href = coming soon.
export type DsaStep = { n: number; id: string; title: string; blurb: string; href?: string };

// Progress for the Foundations track is stored as one Assignment (slug below, tool "none") per
// learner, with one verified event per completed step. It is not part of the Testing leaderboards.
export const DSA_FOUNDATIONS = "dsa-foundations";

export const FOUNDATIONS_STEPS: DsaStep[] = [
  { n: 1, id: "dsa-complexity", title: "Complexity & Big-O", blurb: "Time and space cost, and how to compare two solutions.", href: "/dsa/foundations/complexity" },
  { n: 2, id: "dsa-arrays", title: "Arrays & strings", blurb: "Indexing, in-place updates, prefix sums and string building." },
  { n: 3, id: "dsa-hashing", title: "Hashing", blurb: "Hash maps and sets for counting, lookups and de-duplication." },
  { n: 4, id: "dsa-linked-lists", title: "Linked lists", blurb: "Pointers, reversal, fast and slow runners, merging lists." },
  { n: 5, id: "dsa-stacks-queues", title: "Stacks & queues", blurb: "LIFO and FIFO, balanced brackets, monotonic stacks." },
  { n: 6, id: "dsa-recursion", title: "Recursion", blurb: "Base cases, the call stack, and thinking in smaller problems." },
];

const COMPLEXITY: DsaQuestion[] = [
  {
    q: "What is the Big-O of 3n² + 5n + 2?",
    options: ["O(n)", "O(n²)", "O(3n²)", "O(1)"],
    answer: 1,
    why: "Keep the fastest-growing term (3n²) and drop the constant 3: O(n²).",
  },
  {
    q: "Comparing every pair of n items takes how many comparisons in the worst case?",
    options: ["n", "2n", "n(n − 1) ÷ 2", "n log n"],
    answer: 2,
    why: "Each of the n items is paired with every item after it: (n − 1) + (n − 2) + … + 1 = n(n − 1) ÷ 2, which is O(n²).",
  },
  {
    q: "The pair check returns as soon as it finds a match. Which statement is true?",
    options: [
      "Its best case is Ω(1) and its worst case is O(n²)",
      "It is always Θ(1)",
      "It is always Θ(n)",
      "Its best case is Ω(n²)",
    ],
    answer: 0,
    why: "If a[0] equals a[1] it stops after one comparison: Ω(1). With no duplicate it checks every pair: O(n²). Its worst case on its own is Θ(n²).",
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
];

export const DSA_QUIZZES: Record<string, DsaQuestion[]> = {
  "dsa-complexity": COMPLEXITY,
};

export const dsaStep = (id: string): DsaStep | undefined => FOUNDATIONS_STEPS.find((s) => s.id === id);

// Score submitted answers (one option index per question). Anything malformed scores 0 for that question.
export function gradeDsaQuiz(questions: DsaQuestion[], answers: unknown): { score: number; total: number } {
  const list = Array.isArray(answers) ? answers : [];
  const score = questions.filter((q, i) => list[i] === q.answer).length;
  return { score, total: questions.length };
}
