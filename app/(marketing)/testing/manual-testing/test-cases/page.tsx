import type { Metadata } from "next";
import { Paperclip } from "lucide-react";
import { LessonLayout, SectionHead } from "../_components/lesson-layout";
import { LessonQuiz, type QuizQuestion } from "../_components/lesson-quiz";

// Design: Penpot "26 - Testing Learning Path", page "Manual testing", board "Manual 3 - Test cases & bug reports".

export const metadata: Metadata = {
  title: "Test Cases & Bug Reports – templates, severity vs priority, bug life cycle",
  description:
    "Manual testing step 3: write test cases anyone can run and bug reports developers can fix — with a worked test case, an example bug report, severity vs priority and the bug life cycle.",
  alternates: { canonical: "/testing/manual-testing/test-cases" },
};

const TOC = [
  { id: "test-case", label: "Anatomy of a test case" },
  { id: "clear-steps", label: "Writing clear steps" },
  { id: "bug-report", label: "What goes in a bug report" },
  { id: "example-bug", label: "Example bug report" },
  { id: "severity-priority", label: "Severity vs priority" },
  { id: "life-cycle", label: "The bug life cycle" },
  { id: "quiz", label: "Check your understanding" },
];

const label = "text-xs font-bold uppercase tracking-wide text-muted-foreground";

const REPORT_FIELDS = [
  { t: "Title", d: "What's wrong, where.", key: false },
  { t: "Environment", d: "Browser, device, build.", key: false },
  { t: "Steps to reproduce", d: "The most important part.", key: true },
  { t: "Expected vs actual", d: "What should vs did happen.", key: false },
  { t: "Severity & priority", d: "Impact and urgency.", key: false },
  { t: "Evidence", d: "Screenshot, video, logs.", key: false },
];

const GRID = [
  { h: "High severity · High priority", d: "Checkout crashes for every user.", cls: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30", head: "text-red-700 dark:text-red-300" },
  { h: "High severity · Low priority", d: "Crash in a yearly admin export that nobody needs until March.", cls: "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30", head: "text-orange-700 dark:text-orange-300" },
  { h: "Low severity · High priority", d: "The company name is misspelled on the homepage.", cls: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30", head: "text-amber-700 dark:text-amber-300" },
  { h: "Low severity · Low priority", d: "A footer icon is 2px out of line.", cls: "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40", head: "text-slate-500" },
];

const LIFE = ["New", "Assigned", "In progress", "Fixed", "Retest", "Closed"];

const QUIZ: QuizQuestion[] = [
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

export default function TestCasesPage() {
  return (
    <LessonLayout
      step={3}
      title="Test cases & bug reports"
      intro="Write test cases anyone can run, and bug reports a developer can fix on the first read — with templates you can copy."
      minutes={25}
      toc={TOC}
      prev={{ label: "2. Test design techniques", href: "/testing/manual-testing/test-design" }}
      next={{ label: "4. Exploratory testing", href: "/testing/manual-testing/exploratory" }}
    >
      <section>
        <SectionHead n={1} id="test-case" title="Anatomy of a test case" />
        <p className="mt-4 text-[17px] text-slate-700 dark:text-slate-300">
          A test case is one check, written so anyone can run it and get the same answer. Here&apos;s a complete one for a sign-in page:
        </p>
        <div data-testid="example-test-case" className="mt-6 overflow-hidden rounded-2xl border bg-card">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-blue-50 px-6 py-4 dark:bg-blue-950/40">
            <span className="font-mono text-sm font-bold text-blue-700 dark:text-blue-300">TC-LOGIN-003</span>
            <span className="flex-1 font-bold">Wrong password shows the error banner</span>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">Priority: High</span>
          </div>
          <dl className="m-0 space-y-5 p-6 text-[15px]">
            <div>
              <dt className={label}>Preconditions</dt>
              <dd className="m-0 mt-1">A registered user exists: demo@thedappled.com</dd>
            </div>
            <div>
              <dt className={label}>Steps</dt>
              <dd className="m-0 mt-1">
                <ol className="m-0 list-decimal space-y-1 pl-5">
                  <li>Open /testing/ui-automation/login</li>
                  <li>Enter demo@thedappled.com in Email</li>
                  <li>Enter WrongPass1 in Password</li>
                  <li>Click Sign in</li>
                </ol>
              </dd>
            </div>
            <div>
              <dt className={label}>Expected result</dt>
              <dd className="m-0 mt-1">The banner &ldquo;Invalid email or password.&rdquo; appears and the user stays on the sign-in page. The password field is cleared.</dd>
            </div>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t pt-5">
              <div className="flex items-center gap-3">
                <dt className={label}>Actual result</dt>
                <dd className="m-0 text-muted-foreground">filled in when run</dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className={label}>Status</dt>
                <dd className="m-0 flex gap-1.5 text-xs font-bold">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Pass</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-500 dark:bg-slate-800">Fail</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-500 dark:bg-slate-800">Blocked</span>
                </dd>
              </div>
            </div>
          </dl>
        </div>
      </section>

      <section>
        <SectionHead n={2} id="clear-steps" title="Writing clear steps" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
            <p className="font-extrabold text-red-700 dark:text-red-300">✕ Vague</p>
            <dl className="m-0 mt-3 space-y-2 text-[15px]">
              <div><dt className="inline font-semibold">Title: </dt><dd className="m-0 inline">Login test</dd></div>
              <div><dt className="inline font-semibold">Steps: </dt><dd className="m-0 inline">Try logging in with a bad password.</dd></div>
              <div><dt className="inline font-semibold">Expected: </dt><dd className="m-0 inline">Error shows.</dd></div>
            </dl>
            <p className="mt-4 text-sm text-red-700 dark:text-red-400">Which page? Which error? What text?</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
            <p className="font-extrabold text-emerald-700 dark:text-emerald-300">✓ Specific</p>
            <dl className="m-0 mt-3 space-y-2 text-[15px]">
              <div><dt className="inline font-semibold">Title: </dt><dd className="m-0 inline">Wrong password shows the error banner</dd></div>
              <div><dt className="inline font-semibold">Steps: </dt><dd className="m-0 inline">Exact page, exact data, one action per step.</dd></div>
              <div><dt className="inline font-semibold">Expected: </dt><dd className="m-0 inline">The exact banner text.</dd></div>
            </dl>
            <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-400">Two testers get the same result.</p>
          </div>
        </div>
        <ul className="mt-6 list-disc space-y-2 pl-5 text-[15px] text-slate-700 dark:text-slate-300">
          <li>One behaviour per test case — if it fails, you know exactly what broke.</li>
          <li>Use real test data, not &ldquo;a valid email&rdquo;.</li>
          <li>Each case can run on its own — don&apos;t rely on the previous case.</li>
        </ul>
      </section>

      <section>
        <SectionHead n={3} id="bug-report" title="What goes in a bug report" />
        <ul className="m-0 mt-6 grid list-none gap-3 p-0 sm:grid-cols-3">
          {REPORT_FIELDS.map((f) => (
            <li
              key={f.t}
              className={`rounded-xl border p-5 ${f.key ? "border-[1.5px] border-blue-600 bg-blue-50 dark:bg-blue-950/40" : "bg-slate-50 dark:bg-slate-900/40"}`}
            >
              <p className={`font-bold ${f.key ? "text-blue-700 dark:text-blue-300" : ""}`}>{f.t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHead n={4} id="example-bug" title="Example bug report" />
        <div data-testid="example-bug-report" className="mt-6 overflow-hidden rounded-2xl border bg-card">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-red-50 px-6 py-4 dark:bg-red-950/30">
            <span className="font-mono text-sm font-bold text-red-700 dark:text-red-300">BUG-112</span>
            <span className="flex-1 font-bold">Sign up accepts mismatched passwords</span>
            <span className="flex gap-2 text-xs font-bold">
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-red-700 dark:bg-red-950 dark:text-red-300">Severity: Major</span>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-amber-700 dark:bg-amber-950 dark:text-amber-300">Priority: High</span>
            </span>
          </div>
          <dl className="m-0 space-y-5 p-6 text-[15px]">
            <div className="sm:flex sm:gap-6">
              <dt className={`${label} sm:w-44 sm:shrink-0 sm:pt-0.5`}>Environment</dt>
              <dd className="m-0 mt-1 sm:mt-0">Chrome 131 · Windows 11 · build 2026.11.22</dd>
            </div>
            <div>
              <dt className={label}>Steps to reproduce</dt>
              <dd className="m-0 mt-1">
                <ol className="m-0 list-decimal space-y-1 pl-5">
                  <li>Open /testing/ui-automation/signup</li>
                  <li>Fill all fields; Password: Test@1234, Confirm: Test@9999</li>
                  <li>Tick the terms box and click Create account</li>
                </ol>
              </dd>
            </div>
            <div>
              <dt className={label}>Expected</dt>
              <dd className="m-0 mt-1">&ldquo;Passwords do not match&rdquo; error under Confirm password; no account created.</dd>
            </div>
            <div>
              <dt className={label}>Actual</dt>
              <dd className="m-0 mt-1 text-red-700 dark:text-red-400">The success message appears and the account is created.</dd>
            </div>
            <div className="sm:flex sm:items-center sm:gap-6">
              <dt className={`${label} sm:w-44 sm:shrink-0`}>Evidence</dt>
              <dd className="m-0 mt-1 flex flex-wrap items-center gap-3 sm:mt-0">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Paperclip className="h-3.5 w-3.5" /> signup-mismatch.png
                </span>
                <span className="text-sm text-muted-foreground">Reproduces 3 of 3 times.</span>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section>
        <SectionHead n={5} id="severity-priority" title="Severity vs priority" />
        <p className="mt-4 text-[17px] text-slate-700 dark:text-slate-300">
          <strong>Severity</strong> is how badly it breaks the product. <strong>Priority</strong> is how soon it must be fixed. They often match — but not always.
        </p>
        <ul className="m-0 mt-6 grid list-none gap-3 p-0 sm:grid-cols-2">
          {GRID.map((g) => (
            <li key={g.h} className={`rounded-xl border p-5 ${g.cls}`}>
              <p className={`text-xs font-extrabold uppercase tracking-wide ${g.head}`}>{g.h}</p>
              <p className="mt-2 text-[15px] text-slate-700 dark:text-slate-300">{g.d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHead n={6} id="life-cycle" title="The bug life cycle" />
        <figure className="mt-6 rounded-2xl border bg-card p-6">
          <ol className="m-0 flex list-none flex-wrap items-center gap-2 p-0" aria-label="Bug states in order">
            {LIFE.map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                <span
                  className={`rounded-full border px-4 py-2 text-sm font-bold ${
                    s === "Retest"
                      ? "border-amber-600 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                      : s === "Closed"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                  }`}
                >
                  {s}
                </span>
                {i < LIFE.length - 1 && <span aria-hidden="true" className="text-slate-400">›</span>}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm font-semibold text-red-700 dark:text-red-400">↺ Reopened — if it still fails on retest, it goes back to In progress.</p>
        </figure>
      </section>

      <LessonQuiz questions={QUIZ} doneText="nice work, you're ready for step 4." />
    </LessonLayout>
  );
}
