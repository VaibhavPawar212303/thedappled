"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FRAMEWORK_STEPS, type AssignmentStatus } from "@/lib/assignments";
import { REASON_TEXT } from "@/lib/verification";
import { TOOL_LABEL, withTool, type Tool } from "@/lib/tools";
import { TrackLine } from "../../_components/card-tool";

type Env = { BASE_URL: string; ASSIGNMENT_TOKEN: string; DEMO_EMAIL: string; DEMO_PASSWORD: string };
type Check = { ok: boolean; message: string };
type Scan = { repo: string; branch: string; checks: Record<"repo-config" | "repo-ignore" | "repo-ci", Check> };

function CopyButton({ text, testid }: { text: string; testid?: string }) {
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
      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-slate-700 px-3 text-xs font-semibold text-white hover:bg-slate-600"
    >
      <Copy className="h-3 w-3" /> {copied ? "Copied" : "Copy"}
    </button>
  );
}

const PLAYWRIGHT_SNIPPET = `// playwright.config.ts
import 'dotenv/config';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: { baseURL: process.env.BASE_URL },
});

// tests/login.spec.ts
test('signs in with the .env credentials', async ({ page }) => {
  await page.goto(\`/testing/framework-setup/login?a=\${process.env.ASSIGNMENT_TOKEN}\`);
  await page.getByTestId('env-email').fill(process.env.DEMO_EMAIL!);
  await page.getByTestId('env-password').fill(process.env.DEMO_PASSWORD!);
  await page.getByTestId('env-submit').click();
  await expect(page.getByTestId('env-success')).toBeVisible();
});`;

const CYPRESS_SNIPPET = `// cypress.config.ts
import 'dotenv/config';
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: process.env.BASE_URL,
    env: {
      ASSIGNMENT_TOKEN: process.env.ASSIGNMENT_TOKEN,
      DEMO_EMAIL: process.env.DEMO_EMAIL,
      DEMO_PASSWORD: process.env.DEMO_PASSWORD,
    },
  },
});

// cypress/e2e/login.cy.ts
it('signs in with the .env credentials', () => {
  cy.visit(\`/testing/framework-setup/login?a=\${Cypress.env('ASSIGNMENT_TOKEN')}\`);
  cy.get('[data-testid="env-email"]').type(Cypress.env('DEMO_EMAIL'));
  cy.get('[data-testid="env-password"]').type(Cypress.env('DEMO_PASSWORD'), { log: false });
  cy.get('[data-testid="env-submit"]').click();
  cy.get('[data-testid="env-success"]').should('be.visible');
});

# .github/workflows/tests.yml (run step)
- run: npx cypress run
  env:
    BASE_URL: \${{ secrets.BASE_URL }}
    ASSIGNMENT_TOKEN: \${{ secrets.ASSIGNMENT_TOKEN }}
    DEMO_EMAIL: \${{ secrets.DEMO_EMAIL }}
    DEMO_PASSWORD: \${{ secrets.DEMO_PASSWORD }}`;

const SNIPPETS: Record<Tool, string> = { playwright: PLAYWRIGHT_SNIPPET, cypress: CYPRESS_SNIPPET };

export function FrameworkView({ tool, initial, env, siteUrl, rank }: { tool: Tool; initial: AssignmentStatus; env: Env; siteUrl: string; rank?: { rank: number; total: number } | null }) {
  const [status, setStatus] = React.useState(initial);
  const [showPw, setShowPw] = React.useState(false);
  const [repoUrl, setRepoUrl] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [scan, setScan] = React.useState<Scan | null>(null);
  const completed = Boolean(status.completedAt);

  // Live progress from the learner's test runs.
  React.useEffect(() => {
    if (completed) return;
    const id = setInterval(async () => {
      try {
        const r = await fetch(`/api/assignments/framework-setup?tool=${tool}`, { cache: "no-store" });
        if (!r.ok) return;
        const { assignment } = await r.json();
        if (assignment) setStatus(assignment);
      } catch {}
    }, 3000);
    return () => clearInterval(id);
  }, [completed, tool]);

  const check = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/assignments/framework-setup/repo?tool=${tool}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(d.error ?? "Could not check the repository.");
      } else {
        setScan(d);
        if (d.assignment) setStatus(d.assignment);
      }
    } catch {
      setError("Could not reach the server. Try again.");
    }
    setBusy(false);
  };

  const envText = `BASE_URL=${env.BASE_URL}\nASSIGNMENT_TOKEN=${env.ASSIGNMENT_TOKEN}\nDEMO_EMAIL=${env.DEMO_EMAIL}\nDEMO_PASSWORD=${env.DEMO_PASSWORD}`;
  const shownEnv = showPw ? envText : envText.replace(env.DEMO_PASSWORD, "••••••••••••");
  const byId = new Map(status.steps.map((s) => [s.id, s]));
  const pct = Math.round((status.done / status.total) * 100);
  const minutes = status.completedAt
    ? Math.max(1, Math.round((new Date(status.completedAt).getTime() - new Date(status.startedAt).getTime()) / 60000))
    : 0;
  const groups = ["Run your tests", "Save it on GitHub"] as const;

  const rankChip = (
    <Link href={withTool("/testing/leaderboard?stage=framework-setup", tool)} data-testid="assignment-rank" className="inline-flex items-center gap-3 rounded-xl border bg-card px-4 py-2.5 text-sm shadow-sm hover:shadow-md">
      {rank && (
        <span>
          <span className="text-muted-foreground">Rank </span>
          <span className="font-extrabold">#{rank.rank} of {rank.total}</span>
        </span>
      )}
      <span className="font-bold text-blue-600">View {TOOL_LABEL[tool]} leaderboard →</span>
    </Link>
  );

  return (
    <div className="bg-slate-50 dark:bg-slate-900/40">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/testing" className="hover:text-foreground">Testing</Link>
          <span aria-hidden="true">/</span>
          <Link href={withTool("/testing/framework-setup", tool)} className="hover:text-foreground">Framework setup</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-semibold text-foreground">Assignment</span>
        </nav>

        {completed ? (
          <div data-testid="assignment-complete" role="status" className="flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-purple-700 p-8 text-white md:p-10">
            <div className="flex items-center gap-5">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/15 text-4xl">✓</span>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">{TOOL_LABEL[tool]} assignment complete!</h1>
                <p className="mt-2 text-purple-100">Your framework reads its config from .env and runs in GitHub Actions with secrets.</p>
                <p className="mt-2 text-sm text-purple-100/80">Took {minutes} minute{minutes === 1 ? "" : "s"}</p>
              </div>
            </div>
            <Button asChild size="lg" className="bg-white text-purple-700 hover:bg-purple-50">
              <Link href="/testing#roadmap">Back to roadmap</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Assignment: framework setup</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <TrackLine slug="framework-setup" tool={tool} />
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">● In progress</span>
                <span className="text-muted-foreground">Test runs update live · GitHub checks run when you submit your repo</span>
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
              <span data-testid="assignment-count" className="text-base font-extrabold text-purple-700 dark:text-purple-300">
                {status.done} of {status.total} verified
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
              <div className="h-full rounded-full bg-purple-600 transition-all" style={{ width: `${pct}%` }} />
            </div>

            {groups.map((g) => (
              <div key={g} className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{g}</h3>
                <ul className="m-0 mt-3 list-none space-y-3 p-0">
                  {FRAMEWORK_STEPS.filter((s) => s.group === g).map((s) => {
                    const st = byId.get(s.id);
                    const done = Boolean(st?.done);
                    const rejected = !done ? st?.rejected : null;
                    const repoMsg = !done && scan ? scan.checks[s.id as keyof Scan["checks"]]?.message : null;
                    return (
                      <li key={s.id} data-testid={`step-${s.id}`} data-done={done} className="flex items-start gap-3 text-[15px]">
                        <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-extrabold ${done ? "border-purple-600 bg-purple-600 text-white" : rejected || repoMsg ? "border-red-500 bg-red-100 text-red-700 dark:bg-red-950" : "border-slate-300 dark:border-slate-600"}`}>
                          {done ? <Check className="h-3.5 w-3.5" /> : rejected || repoMsg ? "✕" : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block font-medium ${done || rejected || repoMsg ? "" : "text-muted-foreground"}`}>{s.label}</span>
                          {rejected && <span className="mt-0.5 block text-[13px] font-semibold text-amber-700 dark:text-amber-400">{REASON_TEXT[rejected].short}</span>}
                          {repoMsg && <span data-testid={`why-${s.id}`} className="mt-0.5 block text-[13px] font-semibold text-red-700 dark:text-red-400">{repoMsg}</span>}
                        </span>
                        {done && <span className="shrink-0 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-950 dark:text-purple-300">Verified</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            <div className="mt-8 border-t pt-6">
              <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">GitHub repository</h3>
              <div className="mt-3 flex flex-wrap gap-3">
                <input
                  data-testid="repo-url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/you/dappled-framework"
                  className="h-12 min-w-0 flex-1 rounded-[10px] border border-input bg-background px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                />
                <Button data-testid="repo-check" onClick={check} disabled={busy || !repoUrl.trim()} className="h-12 bg-purple-600 px-6 text-white hover:bg-purple-700">
                  {busy ? "Checking…" : scan ? "Check again" : "Check my repo"}
                </Button>
              </div>
              <p className="mt-2 text-[13px] text-muted-foreground">Public repos only. We read files through the GitHub API; nothing is cloned. We keep your repo name and the result.</p>
              {error && <p data-testid="repo-error" role="alert" className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
              {scan && !error && (
                <p data-testid="repo-scanned" className="mt-3 text-[13px] text-muted-foreground">Checked {scan.repo} @ {scan.branch} just now.</p>
              )}
            </div>
          </section>

          <div className="min-w-0 space-y-6">
            <section className="min-w-0 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-extrabold">Your .env values</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">Copy these into your own <code>.env</code> file. Never commit it.</p>
              <div className="mt-4 rounded-xl bg-slate-900 p-4 text-slate-100">
                <pre data-testid="env-block" className="m-0 overflow-x-auto whitespace-pre text-xs leading-6">{shownEnv}</pre>
                <div className="mt-3 flex gap-2">
                  <CopyButton text={envText} testid="copy-env" />
                  <button type="button" data-testid="toggle-password" onClick={() => setShowPw((v) => !v)} className="h-8 rounded-lg bg-slate-700 px-3 text-xs font-semibold text-white hover:bg-slate-600">
                    {showPw ? "Hide password" : "Show password"}
                  </button>
                </div>
              </div>
              <p className="mt-3 text-[13px] text-muted-foreground">
                Sign-in page: <code className="break-all">{siteUrl}/testing/framework-setup/login?a={env.ASSIGNMENT_TOKEN}</code>
              </p>
            </section>

            <section className="min-w-0 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
              <h2 className="text-lg font-extrabold">How it works</h2>
              <ol className="m-0 mt-4 list-none space-y-3 p-0 text-sm font-medium">
                {[
                  "Create the project and a .env file with the values above",
                  `Read them in ${tool}.config`,
                  "Run your tests against the sign-in link",
                  "Add .env to .gitignore and commit .env.example (keys only)",
                  "Push to GitHub, add repository secrets, run tests in Actions",
                  "Paste your repo URL and check it",
                ].map((t, i) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900">{i + 1}</span>
                    {t}
                  </li>
                ))}
              </ol>
              <details className="mt-5">
                <summary className="cursor-pointer text-sm font-bold text-purple-700 dark:text-purple-300">Show a {TOOL_LABEL[tool]} example</summary>
                <pre data-testid="tool-snippet" className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs leading-5 text-slate-100">{SNIPPETS[tool]}</pre>
              </details>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
