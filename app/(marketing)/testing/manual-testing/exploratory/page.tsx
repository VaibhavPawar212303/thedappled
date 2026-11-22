import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LessonLayout, SectionHead } from "../_components/lesson-layout";

// Design: Penpot "26 - Testing Learning Path", page "Manual testing", board "Manual 4 - Exploratory testing".

export const metadata: Metadata = {
  title: "Exploratory Testing – charters, time-boxed sessions and heuristics",
  description:
    "Manual testing step 4: what exploratory testing is, scripted vs exploratory, writing charters, running time-boxed sessions with notes, and heuristics — with charters to try on real practice pages.",
  alternates: { canonical: "/testing/manual-testing/exploratory" },
};

const TOC = [
  { id: "what", label: "What is exploratory testing?" },
  { id: "compare", label: "Scripted vs exploratory" },
  { id: "charter", label: "Write a charter" },
  { id: "session", label: "Run a time-boxed session" },
  { id: "heuristics", label: "Heuristics to guide you" },
  { id: "try-it", label: "Try it now" },
  { id: "quiz", label: "Check your understanding" },
];

const COMPARE = [
  { row: "Tests designed", scripted: "Before running them", exploratory: "While running them" },
  { row: "Best for", scripted: "Known requirements, regression", exploratory: "New features, unclear specs" },
  { row: "Finds", scripted: "Expected failures", exploratory: "Unexpected ones" },
  { row: "Output", scripted: "Pass / fail per test case", exploratory: "Session notes, bugs, questions" },
];

const CHARTERS = [
  { target: "the sign-up form", resources: "unusual inputs", info: "validation gaps" },
  { target: "sign-in", resources: "a keyboard only", info: "accessibility problems" },
  { target: "the cart", resources: "back, refresh and two tabs", info: "state bugs" },
];

const SESSION_STEPS = [
  { t: "Set up", d: "Pick a charter and a time-box (45–90 min)." },
  { t: "Explore & take notes", d: "Stay on the charter; note bugs, questions, ideas." },
  { t: "Debrief", d: "Share what you covered, found and still wonder." },
];

const NOTES = [
  { tag: "Bug", cls: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300", t: "Full name accepts 300 characters and breaks the success message layout." },
  { tag: "Bug", cls: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300", t: "“ demo@x.com” with a leading space is rejected as invalid." },
  { tag: "Question", cls: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300", t: "Should emails be case-insensitive? The spec doesn't say." },
  { tag: "Idea", cls: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300", t: "Next session: the same form on a phone-width screen." },
];

const HEURISTICS = [
  { t: "Goldilocks", d: "Too small, too big, just right — for every input." },
  { t: "Interrupt", d: "Refresh, Back, close the tab, lose the network mid-flow." },
  { t: "CRUD", d: "Create, read, update and delete every kind of data." },
  { t: "Personas", d: "Be a new user, a power user, an impatient user." },
  { t: "Follow the data", d: "Enter something, then find everywhere it shows up." },
  { t: "Error states", d: "Trigger every error message and check what comes after." },
];

const TRY = [
  { t: "Sign-in page", d: "Explore sign-in with wrong, empty and odd inputs to discover unclear errors.", href: "/testing/ui-automation/login" },
  { t: "Sign-up page", d: "Explore sign-up with unusual inputs to discover validation gaps.", href: "/testing/ui-automation/signup" },
  { t: "Sign-up, keyboard only", d: "Explore sign-up without a mouse to discover focus and accessibility problems.", href: "/testing/ui-automation/signup" },
];

const TRACK_DONE = (
  <div data-testid="track-done" className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-purple-300 bg-purple-50 p-6 dark:border-purple-900 dark:bg-purple-950/30 sm:p-8">
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">Manual testing track · Done</p>
      <p className="mt-1 text-xl font-extrabold">Ready to automate what you just tested by hand?</p>
      <p className="mt-1 text-sm text-muted-foreground">The Automation track starts with the same sign-in and sign-up pages.</p>
    </div>
    <Link href="/testing/ui-automation" className="inline-flex h-11 items-center gap-1.5 rounded-[10px] bg-purple-700 px-5 text-sm font-bold text-white hover:bg-purple-800">
      Start UI automation <ArrowRight className="h-4 w-4" />
    </Link>
  </div>
);

export default function ExploratoryTestingPage() {
  return (
    <LessonLayout
      lesson="exploratory"
      intro="Find the bugs no script would: learn the app, design tests and run them at the same time — guided by a charter and a time-box."
      minutes={25}
      toc={TOC}
      prev={{ label: "3. Test cases & bug reports", href: "/testing/manual-testing/test-cases" }}
      next={{ label: "UI automation", href: "/testing/ui-automation", track: true }}
      after={TRACK_DONE}
    >
      <section>
        <SectionHead n={1} id="what" title="What is exploratory testing?" />
        <p className="mt-4 text-[17px] leading-relaxed text-slate-700 dark:text-slate-300">
          You learn the product, design tests and run them at the same time, using what each test shows you to decide the next one. It
          finds the surprising bugs that scripted test cases miss.
        </p>
        <div className="mt-6 rounded-xl border border-blue-200 border-l-[6px] border-l-blue-600 bg-blue-50 p-5 dark:border-blue-900 dark:border-l-blue-500 dark:bg-blue-950/40">
          <p className="font-bold text-blue-700 dark:text-blue-300">Not random clicking</p>
          <p className="mt-1 text-blue-900 dark:text-blue-200">Good exploratory testing has a mission (a charter), a time limit and written notes.</p>
        </div>
      </section>

      <section>
        <SectionHead n={2} id="compare" title="Scripted vs exploratory" />
        <div className="mt-6 overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[520px] text-left text-[15px]">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-muted-foreground dark:bg-slate-900/60">
              <tr>
                <th scope="col" className="px-5 py-3"><span className="sr-only">Aspect</span></th>
                <th scope="col" className="px-5 py-3">Scripted</th>
                <th scope="col" className="px-5 py-3">Exploratory</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((c) => (
                <tr key={c.row} className="border-t">
                  <th scope="row" className="whitespace-nowrap px-5 py-3 font-bold">{c.row}</th>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{c.scripted}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{c.exploratory}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[15px] text-muted-foreground">Teams use both: scripts for what must keep working, exploration for what nobody thought of.</p>
      </section>

      <section>
        <SectionHead n={3} id="charter" title="Write a charter" />
        <p className="mt-4 text-[17px] text-slate-700 dark:text-slate-300">A charter is a one-line mission for a session. A simple template:</p>
        <p className="mt-5 rounded-xl bg-slate-900 px-5 py-4 font-mono text-[15px] text-slate-200">
          Explore <span className="text-blue-300">&lt;target&gt;</span> with <span className="text-emerald-300">&lt;resources&gt;</span> to discover{" "}
          <span className="text-amber-300">&lt;information&gt;</span>
        </p>
        <ul className="m-0 mt-3 list-none space-y-2.5 p-0">
          {CHARTERS.map((c) => (
            <li key={c.target} className="rounded-xl border bg-slate-50 px-5 py-3.5 text-[15px] dark:bg-slate-900/40">
              Explore <strong>{c.target}</strong> with <strong>{c.resources}</strong> to discover <strong>{c.info}</strong>.
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHead n={4} id="session" title="Run a time-boxed session" />
        <ol className="m-0 mt-6 grid list-none gap-3 p-0 sm:grid-cols-3">
          {SESSION_STEPS.map((s, i) => (
            <li key={s.t} className="rounded-xl border bg-card p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 font-extrabold text-blue-700 dark:bg-blue-950 dark:text-blue-300">{i + 1}</span>
              <p className="mt-3 font-bold">{s.t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-4 rounded-2xl border bg-card p-6" data-testid="session-notes">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Session notes · Sign-up form · 60 min</p>
          <ul className="m-0 mt-4 list-none space-y-3 p-0">
            {NOTES.map((n) => (
              <li key={n.t} className="flex items-start gap-3 text-[15px]">
                <span className={`mt-0.5 w-20 shrink-0 rounded-full px-2 py-0.5 text-center text-[11px] font-extrabold uppercase ${n.cls}`}>{n.tag}</span>
                <span className="text-slate-700 dark:text-slate-300">{n.t}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">Coverage: all 5 fields, terms box, submit · Not covered: password show/hide</p>
        </div>
      </section>

      <section>
        <SectionHead n={5} id="heuristics" title="Heuristics to guide you" />
        <ul className="m-0 mt-6 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {HEURISTICS.map((h) => (
            <li key={h.t} className="rounded-xl border bg-slate-50 p-5 dark:bg-slate-900/40">
              <p className="font-bold">{h.t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{h.d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHead n={6} id="try-it" title="Try it now" />
        <p className="mt-4 text-[17px] text-slate-700 dark:text-slate-300">Pick a charter, set a 30-minute timer and explore one of our practice pages.</p>
        <ul className="m-0 mt-6 list-none space-y-3 p-0">
          {TRY.map((t) => (
            <li key={t.t}>
              <Link href={t.href} className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border bg-card px-5 py-4 transition hover:shadow-md">
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{t.t}</span>
                  <span className="block text-sm text-muted-foreground">{t.d}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400">
                  Open page <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </LessonLayout>
  );
}
