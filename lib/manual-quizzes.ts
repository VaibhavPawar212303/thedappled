// Manual testing track: the four lessons and their quiz questions. Used by the lesson pages (to render
// the quiz) and by the quiz API (to grade submitted answers on the server). No server-only imports here.

import type { StepId } from "@/lib/assignments";

export type QuizQuestion = { q: string; options: string[]; answer: number; why: string };

export type ManualLessonSlug = "fundamentals" | "test-design" | "test-cases" | "exploratory";

export type ManualLesson = { n: number; slug: ManualLessonSlug; step: StepId; title: string; href: string; questions: QuizQuestion[] };

const FUNDAMENTALS: QuizQuestion[] = [
  {
    q: "Which level tests the whole application against the requirements?",
    options: ["Unit testing", "Integration testing", "System testing", "Acceptance testing"],
    answer: 2,
    why: "System testing checks the complete, integrated application end to end against the requirements. Acceptance testing comes after, with users or the business.",
  },
  {
    q: "A quick check that a new build's critical features work, before deeper testing, is called…",
    options: ["Regression testing", "Smoke testing", "Exploratory testing", "Sanity testing"],
    answer: 1,
    why: "A smoke test is a broad, shallow check of a new build. Sanity testing is narrower: it checks one specific fix or change.",
  },
  {
    q: "“Exhaustive testing is impossible” means testers should…",
    options: ["Test every combination of inputs anyway", "Prioritise tests by risk", "Skip testing small features", "Only test at the end of the project"],
    answer: 1,
    why: "You can't test every input and path, so you focus effort where failures are most likely or most costly.",
  },
  {
    q: "In which STLC phase are test cases written?",
    options: ["Test planning", "Test case design", "Test execution", "Test closure"],
    answer: 1,
    why: "Test planning decides scope and approach; test case design turns that into concrete cases with steps and expected results.",
  },
  {
    q: "Re-running tests after a change to make sure nothing that worked is now broken is…",
    options: ["Regression testing", "Sanity testing", "Acceptance testing", "Unit testing"],
    answer: 0,
    why: "Regression testing protects existing behaviour after a code change, a bug fix or a new feature.",
  },
];

const TEST_DESIGN: QuizQuestion[] = [
  {
    q: "A field accepts 1–100. Which values does boundary value analysis test?",
    options: ["1, 50, 100", "0, 1, 100, 101", "Every value from 1 to 100", "-1 and 1,000"],
    answer: 1,
    why: "Test on each boundary (1 and 100) and just outside it (0 and 101) — that's where off-by-one bugs hide.",
  },
  {
    q: "Same field (1–100): how many equivalence partitions are there?",
    options: ["1", "2", "3", "100"],
    answer: 2,
    why: "Below 1 (invalid), 1 to 100 (valid) and above 100 (invalid) — one test from each covers the field.",
  },
  {
    q: "A full decision table with 3 yes/no conditions has how many rules?",
    options: ["3", "6", "8", "9"],
    answer: 2,
    why: "Each yes/no condition doubles the combinations: 2 × 2 × 2 = 8 rules.",
  },
  {
    q: "An account locks after 3 wrong passwords. Which technique fits best?",
    options: ["Equivalence partitioning", "State transition testing", "Decision tables", "Error guessing"],
    answer: 1,
    why: "The result depends on what happened before (how many wrong attempts), so you map the states and test every transition.",
  },
  {
    q: "Trying empty input, very long text and special characters because they often break forms is…",
    options: ["Boundary value analysis", "Error guessing", "Regression testing", "Decision tables"],
    answer: 1,
    why: "Error guessing uses experience of where bugs usually hide, rather than a formal rule.",
  },
];

const TEST_CASES: QuizQuestion[] = [
  {
    q: "A typo in the company name on the homepage is usually…",
    options: ["High severity, high priority", "Low severity, high priority", "High severity, low priority", "Low severity, low priority"],
    answer: 1,
    why: "Nothing breaks, so severity is low — but every visitor sees it and it hurts trust, so it should be fixed soon.",
  },
  {
    q: "Which test case title is best?",
    options: ["Login test", "Test 3", "Wrong password shows the error banner", "Check everything on the login page"],
    answer: 2,
    why: "A good title names one behaviour and its outcome, so anyone can tell what failed from the title alone.",
  },
  {
    q: "Which is a proper expected result?",
    options: [
      "Login should work",
      "The banner “Invalid email or password.” appears and the user stays on the sign-in page",
      "Click Sign in",
      "Tester: Priya",
    ],
    answer: 1,
    why: "An expected result is specific and checkable — exact text and exact state — so pass or fail is never a judgement call.",
  },
  {
    q: "For a developer, the most important part of a bug report is…",
    options: ["Steps to reproduce", "Severity", "Bug ID", "Reporter's name"],
    answer: 0,
    why: "If the developer can't reproduce the bug, they can't fix it or confirm the fix.",
  },
  {
    q: "After a developer marks a bug as fixed, the tester should…",
    options: ["Close it right away", "Retest it, then close it or reopen it", "Delete the test case", "Lower its priority"],
    answer: 1,
    why: "Retest the exact steps on the new build: close the bug if it passes, reopen it if it still fails.",
  },
];

const EXPLORATORY: QuizQuestion[] = [
  {
    q: "Exploratory testing is best described as…",
    options: ["Random clicking around", "Learning, designing and running tests at the same time", "Re-running the regression suite", "Testing only when there are no requirements"],
    answer: 1,
    why: "Each test teaches you something that shapes the next one. It's structured by a charter and a time-box, not random.",
  },
  {
    q: "Which is a good charter?",
    options: ["Test the app", "Explore the sign-up form with unusual inputs to discover validation gaps", "Click every button", "Find all the bugs"],
    answer: 1,
    why: "A good charter names a target, the resources or approach, and the information you're looking for.",
  },
  {
    q: "Why time-box an exploratory session?",
    options: ["So testers work faster", "It keeps the session focused and makes coverage easy to report", "Bugs only appear in the first hour", "It replaces test cases"],
    answer: 1,
    why: "A fixed slot keeps you on the charter, and the debrief shows what was covered in that time.",
  },
  {
    q: "During a session you wonder “Should emails be case-insensitive?” You should…",
    options: ["Log it as a bug", "Note it as a question to raise with the team", "Ignore it", "Mark the session as passed"],
    answer: 1,
    why: "It isn't a bug until someone decides the expected behaviour — record it as a question and bring it to the debrief.",
  },
  {
    q: "Refreshing the page and pressing Back in the middle of checkout uses which heuristic?",
    options: ["Goldilocks", "Interrupt", "CRUD", "Personas"],
    answer: 1,
    why: "The Interrupt heuristic breaks a flow halfway to see whether the app recovers or ends up in a bad state.",
  },
];

export const MANUAL_LESSONS: ManualLesson[] = [
  { n: 1, slug: "fundamentals", step: "manual-fundamentals", title: "Testing fundamentals", href: "/testing/manual-testing/fundamentals", questions: FUNDAMENTALS },
  { n: 2, slug: "test-design", step: "manual-test-design", title: "Test design techniques", href: "/testing/manual-testing/test-design", questions: TEST_DESIGN },
  { n: 3, slug: "test-cases", step: "manual-test-cases", title: "Test cases & bug reports", href: "/testing/manual-testing/test-cases", questions: TEST_CASES },
  { n: 4, slug: "exploratory", step: "manual-exploratory", title: "Exploratory testing", href: "/testing/manual-testing/exploratory", questions: EXPLORATORY },
];

export const manualLesson = (slug: string): ManualLesson | undefined => MANUAL_LESSONS.find((l) => l.slug === slug);

// Score submitted answers (one option index per question). Anything malformed scores 0 for that question.
export function gradeQuiz(lesson: ManualLesson, answers: unknown): { score: number; total: number } {
  const list = Array.isArray(answers) ? answers : [];
  const score = lesson.questions.filter((q, i) => list[i] === q.answer).length;
  return { score, total: lesson.questions.length };
}
