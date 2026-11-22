"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STEPS, type AssignmentStatus, type StepId } from "@/lib/assignments";
import { REASON_TEXT } from "@/lib/verification";

// What each check expects, shown on the step the learner should do next.
const HINTS: Partial<Record<StepId, { hint: string; ids: string[] }>> = {
  "login-empty": { hint: "Submit the sign in form with both fields empty, then expect an error on each field.", ids: ["login-submit", "login-error-email", "login-error-password"] },
  "login-wrong": { hint: "Sign in with demo@thedappled.com and any wrong password, then expect the error banner.", ids: ["login-email", "login-password", "login-submit", "login-error"] },
  "login-success": { hint: "Sign in with demo@thedappled.com / Test@1234, then expect the welcome message.", ids: ["login-email", "login-password", "login-submit", "login-success"] },
  "signup-empty": { hint: "Submit the sign up form with every field empty, then expect an error on all five fields.", ids: ["signup-submit", "signup-error-name", "signup-error-email", "signup-error-password", "signup-error-confirm", "signup-error-terms"] },
  "signup-mismatch": { hint: "Fill the form with two different passwords and submit, then expect the confirm-password error.", ids: ["signup-password", "signup-confirm", "signup-submit", "signup-error-confirm"] },
  "signup-success": { hint: "Fill every field with valid values (8+ chars, a number and a symbol), tick the terms and submit.", ids: ["signup-name", "signup-email", "signup-password", "signup-confirm", "signup-terms", "signup-success"] },
};

function starterScript(tool: "playwright" | "cypress", loginUrl: string) {
  if (tool === "cypress") {
    return `const LOGIN = "${loginUrl}";

describe("sign in", () => {
  it("empty form shows both errors", () => {
    cy.visit(LOGIN);
    cy.get('[data-testid="login-submit"]').click();
    cy.get('[data-testid="login-error-email"]').should("be.visible");
    cy.get('[data-testid="login-error-password"]').should("be.visible");
  });

  // TODO: wrong password, valid login, then the sign up checks
});
`;
  }
  return `import { test, expect } from "@playwright/test";

const LOGIN = "${loginUrl}";

test("sign in: empty form shows both errors", async ({ page }) => {
  await page.goto(LOGIN);
  await page.getByTestId("login-submit").click();
  await expect(page.getByTestId("login-error-email")).toBeVisible();
  await expect(page.getByTestId("login-error-password")).toBeVisible();
});

// TODO: wrong password, valid login, then the sign up checks
`;
}

function Time({ iso, withDate = false }: { iso: string | null; withDate?: boolean }) {
  const [text, setText] = React.useState("");
  React.useEffect(() => {
    if (!iso) return;
    const d = new Date(iso);
    setText(withDate ? d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }, [iso, withDate]);
  return <span suppressHydrationWarning>{text}</span>;
}

function CopyButton({ text, label = "Copy", testid, className = "" }: { text: string; label?: string; testid?: string; className?: string }) {
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
      className={`inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 ${className}`}
    >
      <Copy className="h-3 w-3" /> {copied ? "Copied" : label}
    </button>
  );
}

// "Live · updated 4s ago" — re-renders every second from the time of the last successful poll.
function LiveIndicator({ at, paused }: { at: number | null; paused: boolean }) {
  const [now, setNow] = React.useState<number | null>(null);
  React.useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const secs = at && now ? Math.max(0, Math.round((now - at) / 1000)) : null;
  return (
    <span data-testid="assignment-live" className="inline-flex items-center gap-2 text-muted-foreground">
      <span className={`h-2 w-2 rounded-full ${paused ? "bg-slate-400" : "animate-pulse bg-emerald-500"}`} aria-hidden="true" />
      {paused ? "Paused while this tab is hidden" : secs === null ? "Live" : `Live · updated ${secs}s ago`}
    </span>
  );
}

export function AssignmentView({ initial, siteUrl, rank }: { initial: AssignmentStatus; siteUrl: string; rank?: { rank: number; total: number } | null }) {
  const [status, setStatus] = React.useState(initial);
  const [updatedAt, setUpdatedAt] = React.useState<number | null>(null);
  const [hidden, setHidden] = React.useState(false);
  const [tool, setTool] = React.useState<"playwright" | "cypress">("playwright");
  const completed = Boolean(status.completedAt);

  // Live progress: poll while the assignment is open and the tab is visible; refresh at once when it comes back.
  React.useEffect(() => {
    if (completed) return;
    let alive = true;
    const poll = async () => {
      try {
        const r = await fetch("/api/assignments/ui-automation", { cache: "no-store" });
        if (!r.ok) return;
        const { assignment } = await r.json();
        if (alive && assignment) {
          setStatus(assignment);
          setUpdatedAt(Date.now());
        }
      } catch {}
    };
    let id: ReturnType<typeof setInterval> | null = null;
    const startTimer = () => {
      if (id) return;
      id = setInterval(poll, 3000);
    };
    const stopTimer = () => {
      if (id) clearInterval(id);
      id = null;
    };
    const onVisibility = () => {
      const isHidden = document.visibilityState === "hidden";
      setHidden(isHidden);
      if (isHidden) stopTimer();
      else {
        poll();
        startTimer();
      }
    };
    setUpdatedAt(Date.now());
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      alive = false;
      stopTimer();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [completed]);

  const loginUrl = `${siteUrl}/testing/ui-automation/login?a=${status.token}`;
  const signupUrl = `${siteUrl}/testing/ui-automation/signup?a=${status.token}`;
  const byId = new Map(status.steps.map((s) => [s.id, s]));
  const nextId = completed ? null : (STEPS.find((s) => !byId.get(s.id)?.done)?.id ?? null);
  const pct = Math.round((status.done / status.total) * 100);
  const minutes = status.completedAt
    ? Math.max(1, Math.round((new Date(status.completedAt).getTime() - new Date(status.startedAt).getTime()) / 60000))
    : 0;

  const groups = [
    { name: "Sign in", url: loginUrl, id: "login" },
    { name: "Sign up", url: signupUrl, id: "signup" },
  ] as const;

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
                <span data-testid="assignment-verified" className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">✓ Verified as automated</span>
                <p className="mt-2 text-emerald-100">All {status.total} checks passed through an automation tool.</p>
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
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Assignment: automate sign in and sign up</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">● In progress</span>
                <span className="text-muted-foreground">Only steps run by an automation tool count</span>
                <LiveIndicator at={updatedAt} paused={hidden} />
              </div>
            </div>
            {rankChip}
          </div>
        )}

        {completed && <div className="mt-4 flex justify-end">{rankChip}</div>}

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.15fr_1fr]">
          <section className="min-w-0 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold">{completed ? "Your results" : "Requirements"}</h2>
              <span data-testid="assignment-count" className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                {status.done} of {status.total} verified
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
            </div>

            {groups.map((g) => (
              <div key={g.name} className="mt-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{g.name}</h3>
                  {!completed && (
                    <a
                      href={g.url}
                      target="_blank"
                      rel="noreferrer"
                      data-testid={`open-${g.id}`}
                      className="inline-flex items-center gap-1 text-[13px] font-bold text-blue-600 hover:underline"
                    >
                      Open {g.name.toLowerCase()} page <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <ul className="m-0 mt-3 list-none space-y-3 p-0">
                  {STEPS.filter((s) => s.group === g.name).map((s) => {
                    const st = byId.get(s.id);
                    const done = Boolean(st?.done);
                    const rejected = !done ? st?.rejected : null;
                    const isNext = s.id === nextId;
                    const hint = isNext ? HINTS[s.id] : undefined;
                    return (
                      <li
                        key={s.id}
                        data-testid={`step-${s.id}`}
                        data-done={done}
                        data-rejected={rejected ?? ""}
                        data-next={isNext}
                        className={`flex items-start gap-3 text-[15px] ${isNext ? "-mx-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30" : ""}`}
                      >
                        <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-extrabold ${done ? "border-emerald-500 bg-emerald-500 text-white" : rejected ? "border-amber-500 bg-amber-100 text-amber-700 dark:bg-amber-950" : isNext ? "border-emerald-500" : "border-slate-300 dark:border-slate-600"}`}>
                          {done ? <Check className="h-3.5 w-3.5" /> : rejected ? "!" : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className={`font-medium ${isNext ? "font-semibold" : done || rejected ? "" : "text-muted-foreground"}`}>{s.label}</span>
                            {isNext && <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-white">NEXT</span>}
                          </span>
                          {rejected && <span className="mt-0.5 block text-[13px] font-semibold text-amber-700 dark:text-amber-400">{REASON_TEXT[rejected].short}</span>}
                          {hint && (
                            <span data-testid="step-hint" className="mt-1.5 block">
                              <span className="block text-[13px] text-emerald-900 dark:text-emerald-200">{hint.hint}</span>
                              <span className="mt-2 flex flex-wrap gap-1.5">
                                {hint.ids.map((id) => (
                                  <code key={id} className="rounded-md border border-emerald-200 bg-white px-1.5 py-0.5 text-[11px] text-emerald-700 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-300">{id}</code>
                                ))}
                              </span>
                            </span>
                          )}
                        </span>
                        {done && (
                          <span className="flex shrink-0 items-center gap-3">
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Automated</span>
                            {!completed && <span className="text-xs text-muted-foreground"><Time iso={st?.at ?? null} /></span>}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            {!completed && <p className="mt-6 text-sm text-muted-foreground">Waiting for your script… run it against your links. This page updates by itself.</p>}
          </section>

          {completed ? (
            <div className="min-w-0 space-y-6">
              <section className="min-w-0 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
                <h2 className="text-lg font-extrabold">What you practised</h2>
                <ul className="m-0 mt-4 list-none space-y-2.5 p-0 text-sm font-medium">
                  {["Locators with data-testid", "Assertions on error and success states", "Form validation flows", "Running tests with an automation tool"].map((t) => (
                    <li key={t} className="flex items-center gap-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><Check className="h-3 w-3" /></span>
                      {t}
                    </li>
                  ))}
                </ul>
              </section>
              <section data-testid="next-stage" className="rounded-2xl bg-purple-100 p-6 dark:bg-purple-950/40 sm:p-8">
                <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-purple-700 dark:bg-purple-900 dark:text-purple-200">Stage 2 · Unlocked</span>
                <h2 className="mt-3 text-xl font-extrabold text-purple-700 dark:text-purple-300">Next: Framework setup</h2>
                <p className="mt-2 text-sm text-purple-800/80 dark:text-purple-200/80">
                  Keep config and credentials in .env, call them from your tests, and save the project on GitHub with secrets.
                </p>
                <Button asChild size="lg" className="mt-5 w-full bg-purple-600 text-white hover:bg-purple-700">
                  <Link href="/testing/framework-setup" data-testid="start-next-stage">
                    Start stage 2 <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </section>
            </div>
          ) : (
            <div className="min-w-0 space-y-6">
              <section className="min-w-0 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
                <h2 className="text-xl font-extrabold">Your assignment links</h2>
                <p className="mt-1 text-[13px] text-muted-foreground">Open these in your script. They are unique to you.</p>
                {groups.map((l) => (
                  <div key={l.id} className="mt-5">
                    <p className="text-[13px] font-bold">{l.name}</p>
                    <div className="mt-2 flex items-center gap-3 rounded-[10px] border bg-slate-50 p-2 pl-3 dark:bg-slate-900/50">
                      <code data-testid={`assignment-link-${l.id}`} className="min-w-0 flex-1 truncate text-xs">{l.url}</code>
                      <CopyButton text={l.url} testid={`copy-${l.id}`} />
                    </div>
                  </div>
                ))}
              </section>
              <section data-testid="starter-script" className="min-w-0 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-extrabold">Starter script</h2>
                  <div role="tablist" aria-label="Automation tool" className="inline-flex rounded-lg bg-slate-200 p-[3px] dark:bg-slate-800">
                    {(["playwright", "cypress"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        role="tab"
                        aria-selected={tool === t}
                        data-testid={`starter-tab-${t}`}
                        onClick={() => setTool(t)}
                        className={`rounded-md px-2.5 py-1 text-xs font-bold ${tool === t ? "bg-white text-foreground shadow-sm dark:bg-slate-950" : "text-muted-foreground"}`}
                      >
                        {t === "playwright" ? "Playwright" : "Cypress"}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-[13px] text-muted-foreground">Your links are already filled in. Paste it into a test file and finish the TODOs.</p>
                <pre className="mt-4 max-h-72 overflow-auto rounded-[10px] bg-slate-900 p-4 text-[11px] leading-relaxed text-slate-200"><code data-testid="starter-code">{starterScript(tool, loginUrl)}</code></pre>
                <CopyButton text={starterScript(tool, loginUrl)} label="Copy script" testid="copy-starter" className="mt-3 h-10 w-full text-[13px]" />
              </section>
              <section data-testid="verification-card" className="rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30 sm:p-8">
                <h2 className="text-lg font-extrabold text-blue-900 dark:text-blue-200">How verification works</h2>
                <ul className="m-0 mt-4 list-none space-y-4 p-0">
                  {[
                    ["Automation tools only", "Steps count when Playwright, Cypress, Selenium or Puppeteer run them."],
                    ["Hand-driven steps don’t count", "We record them and tell you why, so you can re-run with your script."],
                    ["Your typing stays private", "We only count mouse and key activity. We never read what you type."],
                  ].map(([h, d]) => (
                    <li key={h} className="flex gap-3">
                      <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"><Check className="h-3 w-3" /></span>
                      <span>
                        <span className="block text-sm font-bold text-blue-900 dark:text-blue-200">{h}</span>
                        <span className="mt-0.5 block text-[13px] text-blue-800 dark:text-blue-300">{d}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
