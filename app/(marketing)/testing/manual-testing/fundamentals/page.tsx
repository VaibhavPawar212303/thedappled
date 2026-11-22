import type { Metadata } from "next";
import { LessonLayout, SectionHead } from "../_components/lesson-layout";
import { LessonQuiz, type QuizQuestion } from "../_components/lesson-quiz";

// Design: Penpot "26 - Testing Learning Path", page "Manual testing", board "Manual 1 - Testing fundamentals".

export const metadata: Metadata = {
  title: "Testing Fundamentals – SDLC, STLC, test levels, types and the 7 principles",
  description:
    "Manual testing step 1: what software testing is, SDLC vs STLC, unit to acceptance test levels, functional and non-functional test types, and the 7 testing principles — with a quick self-check.",
  alternates: { canonical: "/testing/manual-testing/fundamentals" },
};

const TOC = [
  { id: "what-is-testing", label: "What is software testing?" },
  { id: "sdlc-stlc", label: "SDLC and STLC" },
  { id: "test-levels", label: "Test levels" },
  { id: "test-types", label: "Test types" },
  { id: "principles", label: "The 7 testing principles" },
  { id: "good-tester", label: "What makes a good tester" },
  { id: "quiz", label: "Check your understanding" },
];

const STLC = ["Requirement analysis", "Test planning", "Test case design", "Environment setup", "Test execution", "Test closure"];

const LEVELS = [
  { t: "Unit testing", d: "One function or component on its own. Usually written by developers." },
  { t: "Integration testing", d: "Parts working together — modules, APIs, the database." },
  { t: "System testing", d: "The whole application, end to end, checked against the requirements." },
  { t: "Acceptance testing (UAT)", d: "Users or the business confirm it meets their needs before release." },
];

const TYPES = [
  { t: "Functional", d: "Features do what the requirements say." },
  { t: "Non-functional", d: "How well it works: performance, usability, security." },
  { t: "Smoke", d: "A quick check that a new build's critical features work." },
  { t: "Sanity", d: "A narrow check that one specific fix or change works." },
  { t: "Regression", d: "Re-testing after a change so nothing that worked is broken." },
  { t: "Exploratory", d: "Learning and testing at the same time, without a script." },
];

const PRINCIPLES = [
  { t: "Testing shows defects are present", d: "It can't prove the software is bug-free." },
  { t: "Exhaustive testing is impossible", d: "Prioritise by risk instead." },
  { t: "Early testing saves time and money", d: "Review requirements before code exists." },
  { t: "Defects cluster together", d: "A few modules hold most of the bugs." },
  { t: "Beware the pesticide paradox", d: "The same tests stop finding new bugs." },
  { t: "Testing is context dependent", d: "A bank app and a game need different testing." },
  { t: "Absence of errors is a fallacy", d: "Bug-free software that doesn't meet users' needs is still a failure." },
];

const TRAITS = [
  { t: "Curious", d: "Asks “what if…?” and tries it." },
  { t: "Detail-oriented", d: "Notices small differences." },
  { t: "Clear writer", d: "Writes bug reports anyone can reproduce." },
  { t: "User-minded", d: "Thinks like the people who use it." },
];

const QUIZ: QuizQuestion[] = [
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

export default function TestingFundamentalsPage() {
  return (
    <LessonLayout
      step={1}
      title="Testing fundamentals"
      intro="What testing is, where it fits in a project, the levels and types of testing, and the principles every tester works by."
      minutes={20}
      toc={TOC}
      next={{ label: "2. Test design techniques", href: "/testing/manual-testing/test-design" }}
    >
      <section>
        <SectionHead n={1} id="what-is-testing" title="What is software testing?" />
        <p className="mt-4 text-[17px] leading-relaxed text-slate-700 dark:text-slate-300">
          Testing is checking that software does what it should — and finding where it doesn&apos;t — before users do. It covers both
          <strong> verification</strong> (are we building the product right?) and <strong>validation</strong> (are we building the right product?).
        </p>
        <div className="mt-6 rounded-xl border border-blue-200 border-l-[6px] border-l-blue-600 bg-blue-50 p-5 dark:border-blue-900 dark:border-l-blue-500 dark:bg-blue-950/40">
          <p className="font-bold text-blue-700 dark:text-blue-300">Key idea</p>
          <p className="mt-1 text-blue-900 dark:text-blue-200">Testing shows that defects are present — it can never prove there are none.</p>
        </div>
      </section>

      <section>
        <SectionHead n={2} id="sdlc-stlc" title="SDLC and STLC" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border bg-card p-6">
            <p className="text-lg font-extrabold">SDLC</p>
            <p className="text-sm text-muted-foreground">Software Development Life Cycle</p>
            <p className="mt-4 text-[15px] text-slate-700 dark:text-slate-300">How the whole product is built: requirements, design, development, testing, release and maintenance.</p>
          </div>
          <div className="rounded-2xl border-[1.5px] border-blue-600 bg-card p-6">
            <p className="text-lg font-extrabold">STLC</p>
            <p className="text-sm text-muted-foreground">Software Testing Life Cycle</p>
            <p className="mt-4 text-[15px] text-slate-700 dark:text-slate-300">
              The testing activities inside the SDLC — from reading requirements to closing the test cycle. Its six phases are below.
            </p>
          </div>
        </div>
        <ol className="m-0 mt-4 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3 lg:grid-cols-6">
          {STLC.map((s, i) => (
            <li key={s} className="flex min-h-14 items-center justify-center rounded-xl bg-blue-50 px-2 py-3 text-center text-[13px] font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
              {i + 1} · {s}
            </li>
          ))}
        </ol>
      </section>

      <section>
        <SectionHead n={3} id="test-levels" title="Test levels" />
        <p className="mt-4 text-[17px] text-slate-700 dark:text-slate-300">Each level tests a bigger piece of the system. Bugs are cheapest to fix at the lowest level.</p>
        <ol className="m-0 mt-6 list-none space-y-3 p-0">
          {LEVELS.map((l, i) => (
            <li key={l.t} className="flex items-start gap-4 rounded-xl border bg-card p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 font-extrabold text-blue-700 dark:bg-blue-950 dark:text-blue-300">{i + 1}</span>
              <span>
                <span className="block font-bold">{l.t}</span>
                <span className="block text-sm text-muted-foreground">{l.d}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <SectionHead n={4} id="test-types" title="Test types" />
        <div className="mt-6 overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-left text-[15px]">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-muted-foreground dark:bg-slate-900/60">
              <tr>
                <th scope="col" className="px-5 py-3">Type</th>
                <th scope="col" className="px-5 py-3">What it checks</th>
              </tr>
            </thead>
            <tbody>
              {TYPES.map((t) => (
                <tr key={t.t} className="border-t">
                  <th scope="row" className="whitespace-nowrap px-5 py-3 font-bold">{t.t}</th>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{t.d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <SectionHead n={5} id="principles" title="The 7 testing principles" />
        <ol className="m-0 mt-6 grid list-none gap-3 p-0 sm:grid-cols-2">
          {PRINCIPLES.map((p, i) => (
            <li key={p.t} className={`rounded-xl border bg-slate-50 p-5 dark:bg-slate-900/40 ${i === PRINCIPLES.length - 1 ? "sm:col-span-2" : ""}`}>
              <p className="font-bold">
                <span className="mr-2 text-blue-700 dark:text-blue-400">{i + 1}</span>
                {p.t}
              </p>
              <p className="mt-1 pl-5 text-sm text-muted-foreground">{p.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <SectionHead n={6} id="good-tester" title="What makes a good tester" />
        <ul className="m-0 mt-6 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-4">
          {TRAITS.map((t) => (
            <li key={t.t} className="rounded-xl border bg-card p-5">
              <p className="font-bold">{t.t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t.d}</p>
            </li>
          ))}
        </ul>
      </section>

      <LessonQuiz questions={QUIZ} doneText="nice work, you're ready for step 2." />
    </LessonLayout>
  );
}
