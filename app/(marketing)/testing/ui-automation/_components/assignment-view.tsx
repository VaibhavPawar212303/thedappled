"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STEPS, type AssignmentStatus } from "@/lib/assignments";

function Time({ iso, withDate = false }: { iso: string | null; withDate?: boolean }) {
  const [text, setText] = React.useState("");
  React.useEffect(() => {
    if (!iso) return;
    const d = new Date(iso);
    setText(withDate ? d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }, [iso, withDate]);
  return <span suppressHydrationWarning>{text}</span>;
}

function CopyButton({ text, label = "Copy", testid }: { text: string; label?: string; testid?: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      type="button"
      data-testid={testid}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {}
      }}
      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900"
    >
      <Copy className="h-3 w-3" /> {copied ? "Copied" : label}
    </button>
  );
}

export function AssignmentView({ initial, siteUrl, rank }: { initial: AssignmentStatus; siteUrl: string; rank?: { rank: number; total: number } | null }) {
  const [status, setStatus] = React.useState(initial);
  const completed = Boolean(status.completedAt);

  // Live progress: poll while the assignment is still open.
  React.useEffect(() => {
    if (completed) return;
    const id = setInterval(async () => {
      try {
        const r = await fetch("/api/assignments/ui-automation", { cache: "no-store" });
        if (!r.ok) return;
        const { assignment } = await r.json();
        if (assignment) setStatus(assignment);
      } catch {}
    }, 3000);
    return () => clearInterval(id);
  }, [completed]);

  const loginUrl = `${siteUrl}/testing/ui-automation/login?a=${status.token}`;
  const signupUrl = `${siteUrl}/testing/ui-automation/signup?a=${status.token}`;
  const byId = new Map(status.steps.map((s) => [s.id, s]));
  const pct = Math.round((status.done / status.total) * 100);
  const minutes = status.completedAt
    ? Math.max(1, Math.round((new Date(status.completedAt).getTime() - new Date(status.startedAt).getTime()) / 60000))
    : 0;


  const groups = ["Sign in", "Sign up"] as const;

  const rankChip = (
    <Link
      href="/testing/leaderboard"
      data-testid="assignment-rank"
      className="inline-flex items-center gap-3 rounded-xl border bg-card px-4 py-2.5 text-sm shadow-sm hover:shadow-md"
    >
      {rank && (
        <span>
          <span className="text-muted-foreground">Rank </span>
          <span className="font-extrabold">#{rank.rank} of {rank.total}</span>
        </span>
      )}
      <span className="font-bold text-blue-600">View leaderboard →</span>
    </Link>
  );

  return (
    <div className="bg-slate-50 dark:bg-slate-900/40">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/testing" className="hover:text-foreground">Testing</Link>
          <span aria-hidden="true">/</span>
          <Link href="/testing/ui-automation" className="hover:text-foreground">UI automation</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-semibold text-foreground">Assignment</span>
        </nav>

        {completed ? (
          <div data-testid="assignment-complete" role="status" className="flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-emerald-700 p-8 text-white md:p-10">
            <div className="flex items-center gap-5">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/15 text-4xl">✓</span>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Assignment complete!</h1>
                <p className="mt-1 text-emerald-100">You automated sign in and sign up — all {status.total} checks passed.</p>
                <p className="mt-2 text-sm text-emerald-100/80">
                  Completed <Time iso={status.completedAt} withDate /> · Took {minutes} minute{minutes === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <Button asChild size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50">
              <Link href="/testing#roadmap">Back to roadmap</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Assignment: automate sign in and sign up</h1>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">● In progress</span>
                  <span className="text-muted-foreground">Updates live while your script runs</span>
                </div>
              </div>
              {rankChip}
            </div>
          </>
        )}

        {completed && <div className="mt-4 flex justify-end">{rankChip}</div>}

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.15fr_1fr]">
          <section className="min-w-0 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold">{completed ? "Your results" : "Requirements"}</h2>
              <span data-testid="assignment-count" className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                {status.done} of {status.total}
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
            </div>

            {groups.map((g) => (
              <div key={g} className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{g}</h3>
                <ul className="m-0 mt-3 list-none space-y-3 p-0">
                  {STEPS.filter((s) => s.group === g).map((s) => {
                    const st = byId.get(s.id);
                    const done = Boolean(st?.done);
                    return (
                      <li key={s.id} data-testid={`step-${s.id}`} data-done={done} className="flex items-center gap-3 text-[15px]">
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 dark:border-slate-600"}`}>
                          {done && <Check className="h-3.5 w-3.5" />}
                        </span>
                        <span className={`flex-1 font-medium ${done ? "" : "text-muted-foreground"}`}>{s.label}</span>
                        {done && <span className="text-xs text-muted-foreground"><Time iso={st?.at ?? null} /></span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            {!completed && <p className="mt-6 text-sm text-muted-foreground">Waiting for your script… run it against the links on the right.</p>}
          </section>

          {completed ? (
            <div className="min-w-0 space-y-6">
              <section className="min-w-0 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
                <h2 className="text-lg font-extrabold">What you practised</h2>
                <ul className="m-0 mt-4 list-none space-y-2.5 p-0 text-sm font-medium">
                  {["Locators with data-testid", "Assertions on error and success states", "Form validation flows"].map((t) => (
                    <li key={t} className="flex items-center gap-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><Check className="h-3 w-3" /></span>
                      {t}
                    </li>
                  ))}
                </ul>
              </section>
              <section className="rounded-2xl bg-purple-100 p-6 dark:bg-purple-950/40 sm:p-8">
                <h2 className="text-lg font-extrabold text-purple-700 dark:text-purple-300">Next: Frameworks &amp; CI</h2>
                <p className="mt-2 text-sm text-purple-800/80 dark:text-purple-200/80">Page objects, fixtures, reporting and GitHub Actions pipelines.</p>
                <Button disabled className="mt-5 bg-purple-300 text-purple-900">Coming soon</Button>
              </section>
            </div>
          ) : (
            <section className="min-w-0 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-extrabold">Your assignment links</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">Open these in your script. They are unique to you.</p>
              {[
                { label: "Sign in", url: loginUrl, id: "login" },
                { label: "Sign up", url: signupUrl, id: "signup" },
              ].map((l) => (
                <div key={l.id} className="mt-5">
                  <p className="text-[13px] font-bold">{l.label}</p>
                  <div className="mt-2 flex items-center gap-3 rounded-[10px] border bg-slate-50 p-2 pl-3 dark:bg-slate-900/50">
                    <code data-testid={`assignment-link-${l.id}`} className="min-w-0 flex-1 truncate text-xs">{l.url}</code>
                    <CopyButton text={l.url} testid={`copy-${l.id}`} />
                  </div>
                </div>
              ))}
              <h3 className="mt-8 text-[15px] font-extrabold">How it works</h3>
              <ol className="m-0 mt-3 list-none space-y-3 p-0 text-sm font-medium">
                {["Copy a link into your test", "Run your script (Playwright or Cypress)", "Watch the checks turn green here"].map((t, i) => (
                  <li key={t} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900">{i + 1}</span>
                    {t}
                  </li>
                ))}
              </ol>
              <Button asChild variant="outline" className="mt-6 w-full">
                <Link href={`/testing/ui-automation/login?a=${status.token}`}>View sign in demo page</Link>
              </Button>
            </section>
          )}
        </div>

      </div>
    </div>
  );
}
