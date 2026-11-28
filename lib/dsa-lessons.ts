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
// Step 3 ("DSA techniques") was added after Reading loops and the later steps moved down one; later
// DSA techniques moved to step 2 and Reading loops to step 3. Step 3 ("Coding basics in C") was then
// added before Reading loops and the later steps moved down one. Step ids (the progress keys) did not
// change, so saved progress is kept. Step 4 ("Tracing code") was then added after Coding basics and the
// later steps moved down one again (Penpot page "Foundations 4 – Tracing code"). Step 5 ("Neighbours &
// swaps") then took two problems out of Tracing code, and the later steps moved down one once more.
// Step 6 ("Concatenation of Array") was added after it the same way, then step 7 ("Shuffle the Array").
export const FOUNDATIONS_STEPS: DsaStep[] = [
  { n: 0, id: "dsa-intro", title: "What is DSA?", blurb: "Data structures and algorithms in plain words, with everyday examples.", href: "/dsa/foundations/what-is-dsa", isNew: true },
  { n: 1, id: "dsa-algorithms", title: "What is an algorithm?", blurb: "Recipes, the phone-book search, and counting steps instead of seconds.", href: "/dsa/foundations/algorithms", isNew: true },
  { n: 2, id: "dsa-techniques", title: "DSA techniques", blurb: "20 techniques with real-world pictures, and how to spot them in a question.", href: "/dsa/foundations/techniques", isNew: true },
  { n: 3, id: "dsa-coding-basics", title: "Coding basics in C", blurb: "Your first program, variables, if / else, loops, arrays and functions.", href: "/dsa/foundations/coding-basics", isNew: true },
  { n: 4, id: "dsa-tracing", title: "Tracing code", blurb: "Follow a loop line by line, solve three first problems, spot common bugs.", href: "/dsa/foundations/tracing", isNew: true },
  { n: 5, id: "dsa-neighbours-swaps", title: "Neighbours & swaps", blurb: "Compare each item with its neighbour, swap safely, reverse with two pointers.", href: "/dsa/foundations/neighbours-and-swaps", isNew: true },
  { n: 6, id: "dsa-concatenation", title: "Concatenation of Array", blurb: "Your first new array: copy nums twice into ans, writing at i and i + n.", href: "/dsa/foundations/concatenation-of-array", isNew: true },
  { n: 7, id: "dsa-shuffle", title: "Shuffle the Array", blurb: "Weave two halves into one, like a zipper: write at 2i and 2i + 1.", href: "/dsa/foundations/shuffle-the-array", isNew: true },
  { n: 8, id: "dsa-reading-loops", title: "Reading loops", blurb: "No loop O(1), one loop O(n), loop in a loop O(n²), halving O(log n).", href: "/dsa/foundations/reading-loops", isNew: true },
  { n: 9, id: "dsa-comparing", title: "Comparing two solutions", blurb: "Best and worst case, brute force vs better, and O, Ω and Θ.", href: "/dsa/foundations/comparing-solutions", isNew: true },
  { n: 10, id: "dsa-growth-memory", title: "Growth rates & memory", blurb: "Nine growth rates from O(1) to O(n!), and space complexity.", href: "/dsa/foundations/growth-rates", isNew: true },
  { n: 11, id: "dsa-arrays", title: "Arrays & strings", blurb: "Indexing, in-place updates, prefix sums and string building." },
  { n: 12, id: "dsa-hashing", title: "Hashing", blurb: "Hash maps and sets for counting, lookups and de-duplication." },
  { n: 13, id: "dsa-linked-lists", title: "Linked lists", blurb: "Pointers, reversal, fast and slow runners, merging lists." },
  { n: 14, id: "dsa-stacks-queues", title: "Stacks & queues", blurb: "LIFO and FIFO, balanced brackets, monotonic stacks." },
  { n: 15, id: "dsa-recursion", title: "Recursion", blurb: "Base cases, the call stack, and thinking in smaller problems." },
];

// The "chapter bridge" at the top of each lesson: what the last chapter covered, and what this one adds.
// Design: Penpot "27 - DSA Learning Path", page "Foundations 3 – Coding basics in C", board "Chapter bridge".
export type DsaBridge = { recap: string; now: string[] };
export const DSA_BRIDGES: Record<string, DsaBridge> = {
  "dsa-intro": { recap: "This is the first chapter. No coding needed yet.", now: ["What data structures are", "What algorithms are", "Everyday examples of both"] },
  "dsa-algorithms": { recap: "DSA = where data lives (data structures) + the steps (algorithms).", now: ["What an algorithm is", "Two ways to search a phone book", "Counting steps, not seconds"] },
  "dsa-techniques": { recap: "An algorithm is a list of steps, and we count steps to compare them.", now: ["20 reusable techniques", "A real-world picture for each", "Clues that point to each one"] },
  "dsa-coding-basics": { recap: "Techniques like traversal and two pointers, described in plain English.", now: ["Just enough C to write them", "Variables, if / else, loops", "Arrays and functions"] },
  "dsa-tracing": { recap: "Variables, if / else, loops, arrays and functions in C.", now: ["Trace a loop by hand", "Solve 3 first problems", "Spot 3 common bugs"] },
  "dsa-neighbours-swaps": { recap: "Trace a loop by hand, row by row, and three first problems in C.", now: ["Compare each item with its neighbour", "Swap two boxes safely with tmp", "Two pointers: reverse in place"] },
  "dsa-concatenation": { recap: "Compare neighbours, swap with tmp, reverse in place with two pointers.", now: ["Read a problem: input, output, example", "Build a new array of size 2n", "Write at a shifted index: i + n"] },
  "dsa-shuffle": { recap: "Built a new array of 2n and wrote each item at i and at the shifted index i + n.", now: ["Spot the x1, y1, x2, y2 pattern", "Write at 2i and 2i + 1", "Fix the \"sits on the last one\" bug"] },
  "dsa-reading-loops": { recap: "Loops you can trace row by row; each run of a loop body is one step. Concatenation and Shuffle each ran their loop n times.", now: ["Count those steps to get Big-O", "O(1), O(n), O(n²), O(log n)", "Simplify 3n² + 5n + 2"] },
  "dsa-comparing": { recap: "Read Big-O straight from the loops: one loop O(n), nested O(n²).", now: ["Best case and worst case", "Brute force → better", "Same Big-O, different code; O, Ω, Θ"] },
  "dsa-growth-memory": { recap: "Compare two correct solutions with best / worst case and O, Ω, Θ.", now: ["Nine growth rates, O(1) to O(n!)", "Space complexity: extra memory", "Rules of thumb for Big-O"] },
};

const CODING_BASICS: DsaQuestion[] = [
  {
    q: "Where does every C program start running?",
    options: ["In main", "At the first #include", "In printf", "At the last line"],
    answer: 0,
    why: "The computer starts in main and follows its instructions from top to bottom.",
  },
  {
    q: "After int count = 0; count = count + 1; what is in count?",
    options: ["0", "1", "2", "count + 1"],
    answer: 1,
    why: "= stores a value: take what's in count (0), add 1, and put the result (1) back.",
  },
  {
    q: "for (int i = 0; i < 4; i++) — how many times does the body run?",
    options: ["3", "4", "5", "It never stops"],
    answer: 1,
    why: "i takes the values 0, 1, 2 and 3. When i becomes 4, i < 4 is false and the loop stops.",
  },
  {
    q: "int a[] = {5, 2, 9, 1}; what is a[2]?",
    options: ["2", "9", "1", "5"],
    answer: 1,
    why: "Indexes start at 0: a[0] is 5, a[1] is 2, a[2] is 9.",
  },
  {
    q: "What does == mean in C?",
    options: ["Store a value", "Are these two equal?", "Add one", "Not equal"],
    answer: 1,
    why: "= stores a value; == asks whether two values are equal. != means not equal.",
  },
];

const TRACING: DsaQuestion[] = [
  {
    q: "int x = 1; then x = x * 2 runs 3 times. What is x?",
    options: ["6", "8", "3", "2"],
    answer: 1,
    why: "Trace it: 1 → 2 → 4 → 8. Each run doubles x.",
  },
  {
    q: "for (int i = 0; i < 4; i++) adds a[i] to total. How many rows say “yes” in its trace table?",
    options: ["3", "4", "5", "1"],
    answer: 1,
    why: "i is 0, 1, 2 and 3: four yes rows. When i is 4 the test says no and the loop stops.",
  },
  {
    q: "Why does largest start with best = a[0] instead of best = 0?",
    options: ["So it still works when every number is negative", "Because a[0] is always the largest", "To make the loop shorter", "It makes no difference"],
    answer: 0,
    why: "For {-5, -2, -9}, starting at 0 would wrongly return 0. Starting at a real item from the array is always safe.",
  },
  {
    q: "find(a, n, 7) returns -1. What does that tell you?",
    options: ["7 is at the last index", "7 is not in the array", "The array is empty", "7 is at index 1"],
    answer: 1,
    why: "Indexes start at 0, so -1 can never be a real position. It is the agreed signal for “not found”.",
  },
  {
    q: "A loop over n items uses for (int i = 0; i <= n; i++). What goes wrong?",
    options: ["It reads a[n], one box past the end", "It skips a[0]", "It never starts", "Nothing, it's the same as i < n"],
    answer: 0,
    why: "The last box is a[n - 1]. With <= the loop runs once more and reads a[n], which is not part of the array.",
  },
];

const NEIGHBOURS_SWAPS: DsaQuestion[] = [
  {
    q: "An array has 6 items. How many neighbour pairs does it have?",
    options: ["6", "5", "3", "12"],
    answer: 1,
    why: "Pairs sit between items: (a[0], a[1]) up to (a[4], a[5]). That's n − 1 = 5.",
  },
  {
    q: "Why does isSorted start its loop at i = 1?",
    options: ["So a[i - 1] is always a real box", "Because a[0] is never checked", "To make the loop faster", "Arrays start at 1 in C"],
    answer: 0,
    why: "The loop reads a[i - 1]. With i = 0 that would be a[-1], a box before the array.",
  },
  {
    q: "a = {7, 4}. You run a[0] = a[1]; then a[1] = a[0]; What is a now?",
    options: ["{4, 7}", "{7, 4}", "{4, 4}", "{7, 7}"],
    answer: 2,
    why: "The first line overwrites the 7 with 4, so the second line copies 4 back. That's why a swap needs tmp.",
  },
  {
    q: "Reversing {1, 2, 3, 4, 5} with two pointers: how many swaps happen?",
    options: ["5", "2", "4", "1"],
    answer: 1,
    why: "Swap a[0] and a[4], then a[1] and a[3]. Then i and j meet at the middle item, which stays put.",
  },
  {
    q: "In the two-pointer reverse, when does the loop stop?",
    options: ["When i reaches n", "When the pointers meet (i < j is false)", "After one swap", "When a[i] equals a[j]"],
    answer: 1,
    why: "Going on past the middle would swap every pair back again, so it stops as soon as i is no longer less than j.",
  },
];

const CONCATENATION: DsaQuestion[] = [
  {
    q: "nums has 4 numbers. How many numbers does ans have?",
    options: ["4", "8", "16", "5"],
    answer: 1,
    why: "ans is nums followed by nums again: 4 + 4 = 8, which is 2n.",
  },
  {
    q: "nums = {1, 2, 1}, so n = 3. Where does the second copy of nums[1] go?",
    options: ["ans[1]", "ans[2]", "ans[4]", "ans[3]"],
    answer: 2,
    why: "The second copy starts at index n, so nums[i] lands at ans[i + n] = ans[1 + 3] = ans[4].",
  },
  {
    q: "What does the loop print if you write ans[i] = nums[i]; twice instead of using i + n?",
    options: ["1 2 1 1 2 1", "1 2 1 0 0 0", "1 1 2 2 1 1", "Nothing"],
    answer: 1,
    why: "Both lines write the first half. The second half is never written, so it stays 0.",
  },
  {
    q: "Why does the loop run while i < n, not i < 2 * n?",
    options: ["nums only has n boxes to read", "It is faster", "ans only has n boxes", "C loops can't reach 2n"],
    answer: 0,
    why: "Each pass reads nums[i]. Going up to 2n would read nums[3], nums[4] …, boxes that nums doesn't have.",
  },
  {
    q: "One loop writing both copies vs. two loops, one copy each. Which is correct?",
    options: ["Only one loop", "Only two loops", "Both give the same ans", "Neither"],
    answer: 2,
    why: "Both write every box of ans exactly once. Step 9 shows they are equally fast too: O(n).",
  },
];

const SHUFFLE: DsaQuestion[] = [
  {
    q: "nums = {2, 5, 1, 3, 4, 7} and n = 3. What is the answer?",
    options: ["{2, 3, 5, 4, 1, 7}", "{2, 5, 1, 3, 4, 7}", "{3, 2, 4, 5, 7, 1}", "{2, 5, 3, 4, 1, 7}"],
    answer: 0,
    why: "The x's are 2 5 1 and the y's are 3 4 7. Take one from each in turn: 2 3, 5 4, 1 7.",
  },
  {
    q: "In round i = 2, which seat of ans does y go to?",
    options: ["ans[3]", "ans[5]", "ans[6]", "ans[4]"],
    answer: 1,
    why: "x goes to 2i = 4 and y sits right next to it at 2i + 1 = 5.",
  },
  {
    q: "Why does the seat number use 2 * i and not just i?",
    options: ["Each round fills two seats", "To make the loop faster", "ans is twice as wide", "C counts from 2"],
    answer: 0,
    why: "Every round writes an x and a y, so the next round has to start two seats further on.",
  },
  {
    q: "What prints if you write ans[i] and ans[i + 1] instead of ans[2 * i] and ans[2 * i + 1]?",
    options: ["2 3 5 4 1 7", "2 5 1 7 0 0", "2 5 1 3 4 7", "0 0 0 0 0 0"],
    answer: 1,
    why: "The seats overlap: each new x lands on the last y, and the last two seats are never written.",
  },
  {
    q: "How much work does Shuffle the Array do?",
    options: ["O(1)", "O(n)", "O(n²)", "O(log n)"],
    answer: 1,
    why: "One loop runs n times and does 2 writes each time. Double n and the work doubles: O(n).",
  },
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

const TECHNIQUES: DsaQuestion[] = [
  {
    q: "Concatenation of Array (nums followed by nums again) mainly uses which technique?",
    options: ["Binary search", "Backtracking", "Traversal", "Dynamic programming"],
    answer: 2,
    why: "You visit each item once and write it in two places: that's a traversal, O(n).",
  },
  {
    q: "In the kitchen picture, which part is the technique?",
    options: ["The containers", "Chopping", "The pancake recipe", "The fridge"],
    answer: 1,
    why: "A technique is a general way of working, like chopping. Containers are data structures; a recipe is an algorithm.",
  },
  {
    q: "A question asks for the longest subarray with a sum under 10. Which technique should you try first?",
    options: ["Sliding window", "Topological sort", "Union-Find", "Bit manipulation"],
    answer: 0,
    why: "“Longest subarray” is a sliding-window clue: a section of the list that grows and shrinks as it moves along.",
  },
  {
    q: "You must check, many times, whether a name was seen before. What makes each check one step?",
    options: ["Sorting the names every time", "Hashing: a hash set", "Two nested loops", "Recursion"],
    answer: 1,
    why: "A hash set jumps straight to where a name would be, like going straight to locker number 7.",
  },
  {
    q: "Paying 65 with the biggest coin that fits each time (50, then 10, then 5) is an example of…",
    options: ["Greedy", "Dynamic programming", "Binary search", "BFS"],
    answer: 0,
    why: "Greedy takes the best-looking choice at each step and never goes back.",
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
  "dsa-coding-basics": CODING_BASICS,
  "dsa-tracing": TRACING,
  "dsa-neighbours-swaps": NEIGHBOURS_SWAPS,
  "dsa-concatenation": CONCATENATION,
  "dsa-shuffle": SHUFFLE,
  "dsa-reading-loops": READING_LOOPS,
  "dsa-techniques": TECHNIQUES,
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
