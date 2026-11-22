import type { Metadata } from "next";
import { LessonLayout, SectionHead } from "../_components/lesson-layout";
import { LessonQuiz, type QuizQuestion } from "../_components/lesson-quiz";

// Design: Penpot "26 - Testing Learning Path", page "Manual testing", board "Manual 2 - Test design techniques".

export const metadata: Metadata = {
  title: "Test Design Techniques – equivalence partitioning, boundary values, decision tables",
  description:
    "Manual testing step 2: equivalence partitioning, boundary value analysis, decision tables, state transition testing and error guessing — each with a worked example and a quick self-check.",
  alternates: { canonical: "/testing/manual-testing/test-design" },
};

const TOC = [
  { id: "why", label: "Why test design?" },
  { id: "equivalence", label: "Equivalence partitioning" },
  { id: "boundaries", label: "Boundary value analysis" },
  { id: "decision-tables", label: "Decision tables" },
  { id: "state-transition", label: "State transition testing" },
  { id: "error-guessing", label: "Error guessing" },
  { id: "quiz", label: "Check your understanding" },
];

const PARTITIONS = [
  { title: "Invalid: below 18", eg: "e.g. 10", expect: "Expect: error", ok: false },
  { title: "Valid: 18 to 60", eg: "e.g. 35", expect: "Expect: accepted", ok: true },
  { title: "Invalid: above 60", eg: "e.g. 70", expect: "Expect: error", ok: false },
];

const RULES = [
  { member: "Yes", coupon: "Yes", discount: "20%" },
  { member: "Yes", coupon: "No", discount: "10%" },
  { member: "No", coupon: "Yes", discount: "10%" },
  { member: "No", coupon: "No", discount: "0%" },
];

const STATES = [
  { label: "Active", tone: "ok" },
  { label: "1 wrong attempt", tone: "warn" },
  { label: "2 wrong attempts", tone: "warn" },
  { label: "Locked", tone: "bad" },
] as const;

const STATE_TONE = {
  ok: "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  warn: "border-amber-600 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  bad: "border-red-600 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
};

const GUESSES = [
  "Empty input / only spaces",
  "Very long text (1,000+ characters)",
  "Special characters and emoji: ' \" < > 😀",
  "Leading / trailing spaces in emails",
  "Double-clicking a submit button",
  "Browser back after submitting",
];

const QUIZ: QuizQuestion[] = [
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

export default function TestDesignPage() {
  return (
    <LessonLayout
      step={2}
      title="Test design techniques"
      intro="You can't test everything — so pick the few tests that catch the most bugs. Five techniques, each with a worked example you can reuse."
      minutes={25}
      toc={TOC}
      prev={{ label: "1. Testing fundamentals", href: "/testing/manual-testing/fundamentals" }}
      next={{ label: "3. Test cases & bug reports", href: "/testing/manual-testing/test-cases" }}
    >
      <section>
        <SectionHead n={1} id="why" title="Why test design?" />
        <p className="mt-4 text-[17px] leading-relaxed text-slate-700 dark:text-slate-300">
          A sign-up form with a few fields already has millions of possible inputs. Test design techniques split that space into groups and
          edges, so a handful of well-chosen tests gives you confidence that the rest would pass too.
        </p>
        <div className="mt-6 rounded-xl border border-blue-200 border-l-[6px] border-l-blue-600 bg-blue-50 p-5 dark:border-blue-900 dark:border-l-blue-500 dark:bg-blue-950/40">
          <p className="font-bold text-blue-700 dark:text-blue-300">Black-box techniques</p>
          <p className="mt-1 text-blue-900 dark:text-blue-200">All five on this page work from the requirements — you don&apos;t need to read the code.</p>
        </div>
      </section>

      <section>
        <SectionHead n={2} id="equivalence" title="Equivalence partitioning" />
        <p className="mt-4 text-[17px] text-slate-700 dark:text-slate-300">
          Split inputs into groups the system should treat the same way, then test one value from each group.
        </p>
        <p className="mt-5 rounded-xl bg-slate-900 px-5 py-4 font-mono text-sm text-slate-200">
          Requirement: <span className="text-emerald-300">Age must be between 18 and 60.</span>
        </p>
        <ul className="m-0 mt-4 grid list-none gap-3 p-0 sm:grid-cols-3">
          {PARTITIONS.map((p) => (
            <li
              key={p.title}
              className={`rounded-xl border p-5 ${p.ok ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30" : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"}`}
            >
              <p className={`font-bold ${p.ok ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}`}>{p.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{p.eg}</p>
              <p className={`mt-4 text-sm font-bold ${p.ok ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}`}>{p.expect}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[15px] text-muted-foreground">3 partitions → 3 tests instead of testing every age.</p>
      </section>

      <section>
        <SectionHead n={3} id="boundaries" title="Boundary value analysis" />
        <p className="mt-4 text-[17px] text-slate-700 dark:text-slate-300">
          Bugs love edges (a <code>&lt;</code> written as <code>&lt;=</code>). Test the values on and just outside each boundary.
        </p>
        <figure className="mt-6 rounded-2xl border bg-card px-6 py-8">
          <div className="relative mx-auto h-24 max-w-xl" role="img" aria-label="Number line: 17 just below the range, 18 minimum, 60 maximum, 61 just above">
            <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="absolute left-[18%] right-[18%] top-1/2 h-4 -translate-y-1/2 rounded-full bg-emerald-200 dark:bg-emerald-900" />
            <p className="absolute left-1/2 top-[calc(50%+14px)] -translate-x-1/2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">valid range</p>
            {[
              { v: 17, pos: "left-[12%]", ok: false, note: "just below", up: false },
              { v: 18, pos: "left-[18%]", ok: true, note: "min", up: true },
              { v: 60, pos: "left-[82%]", ok: true, note: "max", up: true },
              { v: 61, pos: "left-[88%]", ok: false, note: "just above", up: false },
            ].map((b) => (
              <div key={b.v} className={`absolute top-1/2 ${b.pos} -translate-x-1/2 -translate-y-1/2`}>
                <span className={`block h-5 w-5 rounded-full border-2 ${b.ok ? "border-emerald-600 bg-emerald-100" : "border-red-600 bg-red-100"}`} />
                <span className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-center text-xs ${b.up ? "bottom-7" : "top-7"}`}>
                  <span className={`block text-sm font-bold ${b.ok ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>{b.v}</span>
                  <span className="text-muted-foreground">{b.note}</span>
                </span>
              </div>
            ))}
          </div>
        </figure>
        <p className="mt-4 text-[15px] text-muted-foreground">Test 17, 18, 60 and 61. Pair it with equivalence partitioning for full coverage of a range.</p>
      </section>

      <section>
        <SectionHead n={4} id="decision-tables" title="Decision tables" />
        <p className="mt-4 text-[17px] text-slate-700 dark:text-slate-300">
          When the result depends on a combination of conditions, list every combination as a rule — each rule becomes one test.
        </p>
        <div className="mt-6 overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[520px] text-left text-[15px]">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-muted-foreground dark:bg-slate-900/60">
              <tr>
                <th scope="col" className="px-5 py-3">Conditions / action</th>
                {RULES.map((_, i) => (
                  <th key={i} scope="col" className="px-5 py-3 text-center">Rule {i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <th scope="row" className="px-5 py-3 font-bold">Is a member?</th>
                {RULES.map((r, i) => <td key={i} className="px-5 py-3 text-center">{r.member}</td>)}
              </tr>
              <tr className="border-t">
                <th scope="row" className="px-5 py-3 font-bold">Has a coupon?</th>
                {RULES.map((r, i) => <td key={i} className="px-5 py-3 text-center">{r.coupon}</td>)}
              </tr>
              <tr className="border-t bg-blue-50 dark:bg-blue-950/40">
                <th scope="row" className="px-5 py-4 font-bold text-blue-700 dark:text-blue-300">→ Discount</th>
                {RULES.map((r, i) => <td key={i} className="px-5 py-4 text-center font-extrabold text-blue-700 dark:text-blue-300">{r.discount}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[15px] text-muted-foreground">2 yes/no conditions → 2 × 2 = 4 rules. Three conditions would give 8.</p>
      </section>

      <section>
        <SectionHead n={5} id="state-transition" title="State transition testing" />
        <p className="mt-4 text-[17px] text-slate-700 dark:text-slate-300">
          Some features behave differently depending on what happened before. Map the states and the events that move between them, then
          test each move.
        </p>
        <figure className="mt-6 rounded-2xl border bg-card p-6">
          <ol className="m-0 flex list-none flex-col items-stretch gap-2 p-0 sm:flex-row sm:items-center" aria-label="Account lock states">
            {STATES.map((s, i) => (
              <li key={s.label} className="flex flex-col items-center gap-2 sm:flex-1 sm:flex-row">
                <span className={`w-full rounded-full border-2 px-4 py-3 text-center text-sm font-bold ${STATE_TONE[s.tone]}`}>{s.label}</span>
                {i < STATES.length - 1 && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    <span className="sm:hidden">↓ wrong password</span>
                    <span className="hidden sm:inline">wrong →</span>
                  </span>
                )}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm font-semibold text-emerald-700 dark:text-emerald-400">↺ A correct password from 1 or 2 wrong attempts goes back to Active.</p>
        </figure>
        <p className="mt-4 text-[15px] text-muted-foreground">
          Test every arrow — including &ldquo;correct password after 2 wrong attempts&rdquo; and &ldquo;any password once locked&rdquo;.
        </p>
      </section>

      <section>
        <SectionHead n={6} id="error-guessing" title="Error guessing" />
        <p className="mt-4 text-[17px] text-slate-700 dark:text-slate-300">Use experience of where bugs usually hide. A starter checklist for any input field:</p>
        <ul className="m-0 mt-6 grid list-none gap-3 p-0 sm:grid-cols-2">
          {GUESSES.map((g) => (
            <li key={g} className="rounded-xl border bg-slate-50 px-5 py-3.5 text-[15px] dark:bg-slate-900/40">{g}</li>
          ))}
        </ul>
      </section>

      <LessonQuiz questions={QUIZ} doneText="nice work, you're ready for step 3." />
    </LessonLayout>
  );
}
