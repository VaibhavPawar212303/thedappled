import * as React from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, Check, Clock } from "lucide-react";
import { MANUAL_LESSONS, manualLesson, type ManualLessonSlug } from "@/lib/manual-quizzes";
import { getManualProgress } from "@/lib/manual-progress";
import { LessonQuiz } from "./lesson-quiz";
import { ManualPendingSync } from "./manual-pending-sync";

// Shared frame for Manual testing lessons: hero (with "Completed" badge), sidebar ("Your progress" +
// "On this page" + previous/next), the lesson content, the quiz, and previous/next navigation.
// Design: Penpot "26 - Testing Learning Path", page "Manual testing" (lesson boards + "Manual - progress states").

// No href = coming soon. track = the link leads to the next track (purple "Next track" styling).
type StepLink = { label: string; href?: string; track?: boolean };

const nextLinkClass = (next: StepLink) =>
  next.track ? "text-purple-700 dark:text-purple-300" : "text-blue-600 dark:text-blue-400";

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

export async function LessonLayout({
  lesson,
  intro,
  minutes,
  toc,
  prev,
  next,
  after,
  children,
}: {
  lesson: ManualLessonSlug;
  intro: string;
  minutes: number;
  toc: { id: string; label: string }[];
  prev?: StepLink;
  next?: StepLink;
  after?: React.ReactNode; // shown after the quiz (e.g. the track-done card)
  children: React.ReactNode;
}) {
  const L = manualLesson(lesson)!;
  const { userId } = await auth();
  const progress = await getManualProgress(userId);
  const doneSet = new Set<string>(progress?.done ?? []);
  const completed = doneSet.has(L.step);
  const sections = toc.filter((t) => t.id !== "quiz").length;
  const firstOpen = MANUAL_LESSONS.find((l) => !doneSet.has(l.step));

  return (
    <div className="bg-background text-foreground">
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900/40">
        <div className="pointer-events-none absolute -right-16 top-12 h-72 w-72 rounded-full bg-blue-200/60 blur-2xl dark:bg-blue-900/20" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link href="/testing" className="hover:text-foreground">Testing</Link>
            <span aria-hidden="true">/</span>
            <Link href="/testing#roadmap" className="hover:text-foreground">Manual testing</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="font-semibold text-foreground">{L.title}</span>
          </nav>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              Manual testing · Step {L.n} · Beginner
            </span>
            {completed && (
              <span data-testid="lesson-completed" className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Check className="h-3.5 w-3.5" /> Completed
              </span>
            )}
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">{L.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{intro}</p>
          <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> About {minutes} minutes</span>
            <span aria-hidden="true">·</span>
            <span>{sections} short sections</span>
            <span aria-hidden="true">·</span>
            <span>5-question check at the end</span>
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:px-8 lg:grid-cols-[1fr_300px]">
        <article className="min-w-0 space-y-16">
          {children}

          <LessonQuiz
            lesson={lesson}
            questions={L.questions}
            signedIn={Boolean(userId)}
            next={next?.href ? { label: next.track ? `Start ${next.label}` : "Next step", href: next.href } : undefined}
          />

          {after}

          <nav aria-label="Step navigation" className="grid items-center gap-6 border-t pt-8 sm:grid-cols-3">
            <div>
              {prev?.href ? (
                <Link href={prev.href} className="group block">
                  <span className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">Previous</span>
                  <span className="inline-flex items-center gap-1.5 text-lg font-bold text-blue-600 group-hover:underline dark:text-blue-400">
                    <ArrowLeft className="h-4 w-4" /> {prev.label}
                  </span>
                </Link>
              ) : null}
            </div>
            <div className="sm:text-center">
              <Link href="/testing#roadmap" className="font-bold text-blue-600 hover:underline dark:text-blue-400">
                Back to roadmap
              </Link>
            </div>
            <div className="sm:text-right">
              {next && (
                <>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{next.track ? "Next track" : "Next"}{next.href ? "" : " · Coming soon"}</p>
                  {next.href ? (
                    <Link href={next.href} className={`text-lg font-bold hover:underline ${nextLinkClass(next)}`}>{next.label} →</Link>
                  ) : (
                    <p className="text-lg font-bold text-slate-400">{next.label}</p>
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
                    {doneSet.size} of {MANUAL_LESSONS.length} steps
                  </p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${(doneSet.size / MANUAL_LESSONS.length) * 100}%` }} />
                </div>
                <ol className="m-0 mt-4 list-none space-y-2.5 p-0 text-sm">
                  {MANUAL_LESSONS.map((l) => {
                    const done = doneSet.has(l.step);
                    const current = l.slug === lesson;
                    const upNext = !done && firstOpen?.slug === l.slug;
                    return (
                      <li key={l.slug} className="flex items-center gap-2.5">
                        {done ? (
                          <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white" aria-label="Done">
                            <Check className="h-3 w-3" />
                          </span>
                        ) : (
                          <span className={`h-[18px] w-[18px] shrink-0 rounded-full border-2 ${upNext ? "border-blue-600" : "border-slate-300 dark:border-slate-600"}`} aria-label={upNext ? "Up next" : "Not done"} />
                        )}
                        <Link
                          href={l.href}
                          aria-current={current ? "page" : undefined}
                          className={`hover:underline ${current || upNext ? "font-bold text-blue-700 dark:text-blue-300" : done ? "text-slate-700 dark:text-slate-300" : "text-muted-foreground"}`}
                        >
                          {l.n}. {l.title}
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            <div className="rounded-2xl border bg-card p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">On this page</p>
              <ol className="m-0 mt-4 list-none space-y-3 p-0 text-sm">
                {toc.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400">
                      {i + 1}. {s.label}
                    </a>
                  </li>
                ))}
              </ol>
              {(prev || next) && (
                <div className="mt-6 space-y-4 border-t pt-5">
                  {prev?.href && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Previous</p>
                      <Link href={prev.href} className="mt-1 block text-sm font-bold text-blue-600 hover:underline dark:text-blue-400">← {prev.label}</Link>
                    </div>
                  )}
                  {next && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{next.track ? "Next track" : "Next step"}</p>
                      {next.href ? (
                        <Link href={next.href} className={`mt-1 block text-sm font-bold hover:underline ${nextLinkClass(next)}`}>{next.label} →</Link>
                      ) : (
                        <>
                          <p className="mt-1 text-sm font-bold">{next.label}</p>
                          <span className="mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">Coming soon</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
      <ManualPendingSync skip={lesson} />
    </div>
  );
}
