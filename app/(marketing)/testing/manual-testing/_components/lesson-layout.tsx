import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

// Shared frame for Manual testing lessons: hero, "On this page" sidebar, previous/next navigation.
// Design: Penpot "26 - Testing Learning Path", page "Manual testing".

type StepLink = { label: string; href?: string }; // no href = coming soon

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

export function LessonLayout({
  step,
  title,
  intro,
  minutes,
  toc,
  prev,
  next,
  children,
}: {
  step: number;
  title: string;
  intro: string;
  minutes: number;
  toc: { id: string; label: string }[];
  prev?: StepLink;
  next?: StepLink;
  children: React.ReactNode;
}) {
  const sections = toc.filter((t) => t.id !== "quiz").length;
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
            <span aria-current="page" className="font-semibold text-foreground">{title}</span>
          </nav>
          <span className="mt-5 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            Manual testing · Step {step} · Beginner
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
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
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Next{next.href ? "" : " · Coming soon"}</p>
                  {next.href ? (
                    <Link href={next.href} className="text-lg font-bold text-blue-600 hover:underline dark:text-blue-400">{next.label} →</Link>
                  ) : (
                    <p className="text-lg font-bold text-slate-400">{next.label}</p>
                  )}
                </>
              )}
            </div>
          </nav>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border bg-card p-6">
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
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Next step</p>
                    {next.href ? (
                      <Link href={next.href} className="mt-1 block text-sm font-bold text-blue-600 hover:underline dark:text-blue-400">{next.label} →</Link>
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
        </aside>
      </div>
    </div>
  );
}
