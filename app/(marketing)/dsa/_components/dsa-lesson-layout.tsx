import * as React from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Check, Clock } from "lucide-react";
import { DSA_QUIZZES, FOUNDATIONS_STEPS, dsaStep } from "@/lib/dsa-lessons";
import { getDsaProgress } from "@/lib/dsa-progress";
import { DsaQuiz } from "./dsa-quiz";
import { DsaFooter } from "./dsa-footer";

// Shared frame for DSA Foundations lessons: hero (with "Completed" badge), the lesson sections,
// the quiz, step navigation, and a sidebar ("Your progress", "On this page", next step).
// Design: Penpot "27 - DSA Learning Path", page "Foundations 1 – Complexity & Big-O".

export function SectionHead({ n, id, title }: { n: number; id: string; title: string }) {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Section {n}</p>
      <h2 id={id} className="mt-1 scroll-mt-24 text-3xl font-extrabold tracking-tight">
        {title}
      </h2>
    </>
  );
}

export async function DsaLessonLayout({
  step,
  intro,
  minutes,
  toc,
  children,
}: {
  step: string;
  intro: string;
  minutes: number;
  toc: { id: string; label: string }[];
  children: React.ReactNode;
}) {
  const S = dsaStep(step)!;
  const questions = DSA_QUIZZES[step] ?? [];
  const { userId } = await auth();
  const progress = await getDsaProgress(userId);
  const doneSet = new Set(progress?.done ?? []);
  const completed = doneSet.has(S.id);
  const doneCount = FOUNDATIONS_STEPS.filter((s) => doneSet.has(s.id)).length;
  const upNext = FOUNDATIONS_STEPS.find((s) => !doneSet.has(s.id));
  const next = FOUNDATIONS_STEPS.find((s) => s.n === S.n + 1);
  const prev = FOUNDATIONS_STEPS.find((s) => s.n === S.n - 1);
  const sections = toc.length;
  const allToc = [...toc, { id: "quiz", label: "Check your understanding" }];

  return (
    <div className="bg-background text-foreground">
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900/40">
        <div className="pointer-events-none absolute -right-16 top-12 h-72 w-72 rounded-full bg-blue-200/60 blur-2xl dark:bg-blue-900/20" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link href="/dsa" className="hover:text-foreground">DSA</Link>
            <span aria-hidden="true">/</span>
            <Link href="/dsa#roadmap" className="hover:text-foreground">Foundations</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="font-semibold text-foreground">{S.title}</span>
          </nav>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              Foundations · Step {S.n} · Beginner
            </span>
            {completed && (
              <span data-testid="lesson-completed" className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Check className="h-3.5 w-3.5" /> Completed
              </span>
            )}
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">{S.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{intro}</p>
          <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> About {minutes} minutes</span>
            <span aria-hidden="true">·</span>
            <span>{sections} short sections</span>
            <span aria-hidden="true">·</span>
            <span>{questions.length}-question check at the end</span>
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:px-8 lg:grid-cols-[1fr_300px]">
        <article className="min-w-0 space-y-16">
          {children}

          <section>
            <SectionHead n={sections + 1} id="quiz" title="Check your understanding" />
            <p className="mt-3 text-[15px] text-muted-foreground">
              {questions.length} questions. Score {questions.length} out of {questions.length} to complete this step — sign in to save your progress.
            </p>
            <DsaQuiz
              step={S.id}
              questions={questions}
              signedIn={Boolean(userId)}
              next={next?.href ? { label: "Next step", href: next.href } : undefined}
            />
          </section>

          <nav aria-label="Step navigation" className="grid items-center gap-6 border-t pt-8 sm:grid-cols-3">
            <div>
              {prev?.href && (
                <Link href={prev.href} className="group block">
                  <span className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">Previous</span>
                  <span className="text-lg font-bold text-blue-600 group-hover:underline dark:text-blue-400">← {prev.n}. {prev.title}</span>
                </Link>
              )}
            </div>
            <div className="sm:text-center">
              <Link href="/dsa#roadmap" className="font-bold text-blue-600 hover:underline dark:text-blue-400">
                Back to roadmap
              </Link>
            </div>
            <div className="sm:text-right">
              {next && (
                <>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Next{next.href ? "" : " · Coming soon"}</p>
                  {next.href ? (
                    <Link href={next.href} className="text-lg font-bold text-blue-600 hover:underline dark:text-blue-400">{next.n}. {next.title} →</Link>
                  ) : (
                    <p className="text-lg font-bold text-slate-400">{next.n}. {next.title}</p>
                  )}
                </>
              )}
            </div>
          </nav>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            {progress && (
              <div data-testid="lesson-progress" className="rounded-2xl border bg-card p-6">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your progress</p>
                  <p className="text-sm font-extrabold text-blue-700 dark:text-blue-300">
                    {doneCount} of {FOUNDATIONS_STEPS.length} steps
                  </p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${(doneCount / FOUNDATIONS_STEPS.length) * 100}%` }} />
                </div>
                <ol className="m-0 mt-4 list-none space-y-2.5 p-0 text-sm">
                  {FOUNDATIONS_STEPS.map((s) => {
                    const done = doneSet.has(s.id);
                    const isNext = !done && upNext?.id === s.id;
                    const label = `${s.n}. ${s.title}`;
                    const cls = s.id === S.id || isNext ? "font-bold text-blue-700 dark:text-blue-300" : done ? "text-slate-700 dark:text-slate-300" : "text-muted-foreground";
                    return (
                      <li key={s.id} className="flex items-center gap-2.5">
                        {done ? (
                          <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white" aria-label="Done">
                            <Check className="h-3 w-3" />
                          </span>
                        ) : (
                          <span className={`h-[18px] w-[18px] shrink-0 rounded-full border-2 ${isNext ? "border-blue-600" : "border-slate-300 dark:border-slate-600"}`} aria-label={isNext ? "Up next" : "Not done"} />
                        )}
                        {s.href ? (
                          <Link href={s.href} aria-current={s.id === S.id ? "page" : undefined} className={`hover:underline ${cls}`}>{label}</Link>
                        ) : (
                          <span className={cls}>{label}</span>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            <div className="rounded-2xl border bg-card p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">On this page</p>
              <ol className="m-0 mt-4 list-none space-y-3 p-0 text-sm">
                {allToc.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400">
                      {i + 1}. {s.label}
                    </a>
                  </li>
                ))}
              </ol>
              {next && (
                <div className="mt-6 border-t pt-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Next step</p>
                  {next.href ? (
                    <Link href={next.href} className="mt-1 block text-sm font-bold text-blue-600 hover:underline dark:text-blue-400">{next.n}. {next.title} →</Link>
                  ) : (
                    <>
                      <p className="mt-1 text-sm font-bold">{next.n}. {next.title}</p>
                      <span className="mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">Coming soon</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
      <DsaFooter />
    </div>
  );
}
