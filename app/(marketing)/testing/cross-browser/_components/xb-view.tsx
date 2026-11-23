"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CROSS_BROWSER_STEPS, type AssignmentStatus } from "@/lib/assignments";
import { ENGINES, ENGINE_LABEL, engineStep } from "@/lib/browser-engine";
import { REASON_TEXT } from "@/lib/verification";

// Design: Penpot "26 - Testing Learning Path", page "Stage 4 – Cross-browser", board C.

type Env = { BASE_URL: string; ASSIGNMENT_TOKEN: string; SHOP_EMAIL: string; SHOP_PASSWORD: string };
type RepoCheck = { ok: boolean; message: string };
type Scan = { repo: string; branch: string; checks: Record<"repo-browsers" | "repo-ci-matrix", RepoCheck> };

function CopyButton({ text, testid, className = "bg-slate-700 text-white hover:bg-slate-600" }: { text: string; testid?: string; className?: string }) {
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
      className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold ${className}`}
    >
      <Copy className="h-3 w-3" /> {copied ? "Copied" : "Copy"}
    </button>
  );
}

const SNIPPET = `// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  use: { baseURL: process.env.BASE_URL },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
});

// pages/LoginPage.ts — point open() at your stage 4 shop
await this.page.goto(\`/testing/cross-browser/shop?a=\${process.env.ASSIGNMENT_TOKEN}\`);

# run all three locally
npx playwright install
npx playwright test

# .github/workflows/tests.yml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        project: [chromium, firefox, webkit]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx playwright install --with-deps \${{ matrix.project }}
      - run: npx playwright test --project=\${{ matrix.project }}
        env:
          BASE_URL: \${{ secrets.BASE_URL }}
          ASSIGNMENT_TOKEN: \${{ secrets.ASSIGNMENT_TOKEN }}
          SHOP_EMAIL: \${{ secrets.SHOP_EMAIL }}
          SHOP_PASSWORD: \${{ secrets.SHOP_PASSWORD }}`;

function ago(iso: string, now: number) {
  const m = Math.round((now - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
}

export function XbView({ initial, env, rank }: { initial: AssignmentStatus; env: Env; rank?: { rank: number; total: number } | null }) {
  const [status, setStatus] = React.useState(initial);
  const [showPw, setShowPw] = React.useState(false);
  const [repoUrl, setRepoUrl] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [scan, setScan] = React.useState<Scan | null>(null);
  const [now, setNow] = React.useState(() => Date.now());
  const completed = Boolean(status.completedAt);

  // Live progress from the learner's browser runs.
  React.useEffect(() => {
    if (completed) return;
    const id = setInterval(async () => {
      setNow(Date.now());
      try {
        const r = await fetch("/api/assignments/cross-browser", { cache: "no-store" });
        if (!r.ok) return;
        const { assignment } = await r.json();
        if (assignment) setStatus(assignment);
      } catch {}
    }, 3000);
    return () => clearInterval(id);
  }, [completed]);

  const check = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/assignments/cross-browser/repo", {
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

  const shopPath = `/testing/cross-browser/shop?a=${env.ASSIGNMENT_TOKEN}`;
  const envText = `BASE_URL=${env.BASE_URL}\nASSIGNMENT_TOKEN=${env.ASSIGNMENT_TOKEN}\nSHOP_EMAIL=${env.SHOP_EMAIL}\nSHOP_PASSWORD=${env.SHOP_PASSWORD}`;
  const shownEnv = showPw ? envText : envText.replace(env.SHOP_PASSWORD, "••••••••••••");
  const byId = new Map(status.steps.map((s) => [s.id, s]));
  const pct = Math.round((status.done / status.total) * 100);
  const minutes = status.completedAt
    ? Math.max(1, Math.round((new Date(status.completedAt).getTime() - new Date(status.startedAt).getTime()) / 60000))
    : 0;
  const groups = ["Run on every browser", "Configure it on GitHub"] as const;

  const rankChip = (
    <Link href="/testing/leaderboard?stage=cross-browser" data-testid="assignment-rank" className="inline-flex items-center gap-3 rounded-xl border bg-card px-4 py-2.5 text-sm shadow-sm hover:shadow-md">
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
          <Link href="/testing/cross-browser" className="hover:text-foreground">Cross-browser testing</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-semibold text-foreground">Assignment</span>
        </nav>

        {completed ? (
          <div data-testid="assignment-complete" role="status" className="flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-blue-700 p-8 text-white md:p-10">
            <div className="flex items-center gap-5">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/15 text-4xl">✓</span>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Assignment complete!</h1>
                <p className="mt-2 text-blue-100">Your suite passes on Chromium, Firefox and WebKit — locally and in CI.</p>
                <p className="mt-2 text-sm text-blue-100/80">Took {minutes} minute{minutes === 1 ? "" : "s"}</p>
              </div>
            </div>
            <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
              <Link href="/testing#roadmap">Back to roadmap</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Assignment: cross-browser testing</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">● In progress</span>
                <span className="text-muted-foreground">Browser runs update live · GitHub checks run when you submit your repo</span>
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
              <span data-testid="assignment-count" className="text-base font-extrabold text-blue-700 dark:text-blue-400">
                {status.done} of {status.total} verified
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
              <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${pct}%` }} />
            </div>

            {groups.map((g) => (
              <div key={g} className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{g}</h3>
                <ul className="m-0 mt-3 list-none space-y-3 p-0">
                  {CROSS_BROWSER_STEPS.filter((s) => s.group === g).map((s) => {
                    const st = byId.get(s.id);
                    const done = Boolean(st?.done);
                    const rejected = !done ? st?.rejected : null;
                    const repoMsg = !done && scan ? scan.checks[s.id as keyof Scan["checks"]]?.message : null;
                    return (
                      <li key={s.id} data-testid={`step-${s.id}`} data-done={done} className="flex items-start gap-3 text-[15px]">
                        <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-extrabold ${done ? "border-emerald-600 bg-emerald-600 text-white" : rejected || repoMsg ? "border-red-500 bg-red-100 text-red-700 dark:bg-red-950" : "border-slate-300 dark:border-slate-600"}`}>
                          {done ? <Check className="h-3.5 w-3.5" /> : rejected || repoMsg ? "✕" : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block font-medium ${done || rejected || repoMsg ? "" : "text-muted-foreground"}`}>{s.label}</span>
                          {rejected && <span className="mt-0.5 block text-[13px] font-semibold text-amber-700 dark:text-amber-400">{REASON_TEXT[rejected].short}</span>}
                          {repoMsg && <span data-testid={`why-${s.id}`} className="mt-0.5 block break-words text-[13px] font-semibold text-red-700 dark:text-red-400">{repoMsg}</span>}
                        </span>
                        {done && <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Verified</span>}
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
                  placeholder="https://github.com/you/dappled-tests"
                  className="h-12 min-w-0 flex-1 rounded-[10px] border border-input bg-background px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
                <Button data-testid="repo-check" onClick={check} disabled={busy || !repoUrl.trim()} className="h-12 bg-blue-600 px-6 text-white hover:bg-blue-700">
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
              <h2 className="text-xl font-extrabold">Your shop link</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">Same demo shop as stage 3, with its own sign-in. Update your <code>.env</code> and repository secrets.</p>
              <div className="mt-4 rounded-xl bg-slate-900 p-4 text-slate-100">
                <pre data-testid="env-block" className="m-0 overflow-x-auto whitespace-pre text-xs leading-6">{shownEnv}</pre>
                <div className="mt-3 flex gap-2">
                  <CopyButton text={envText} testid="copy-env" />
                  <button type="button" data-testid="toggle-password" onClick={() => setShowPw((v) => !v)} className="h-8 rounded-lg bg-slate-700 px-3 text-xs font-semibold text-white hover:bg-slate-600">
                    {showPw ? "Hide password" : "Show password"}
                  </button>
                </div>
              </div>
              <div data-testid="shop-url" className="mt-4 rounded-xl border-[1.5px] border-blue-600 bg-blue-50 p-4 dark:bg-blue-950/40">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">Your shop URL</span>
                  <span className="flex gap-2">
                    <CopyButton
                      text={`${env.BASE_URL}${shopPath}`}
                      testid="copy-shop-url"
                      className="border border-blue-600 bg-white text-blue-700 hover:bg-blue-100 dark:bg-transparent dark:text-blue-300 dark:hover:bg-blue-900/40"
                    />
                    <Link
                      href={shopPath}
                      target="_blank"
                      rel="noopener"
                      data-testid="open-shop"
                      className="inline-flex h-8 items-center gap-1 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Open <ExternalLink className="h-3 w-3" />
                    </Link>
                  </span>
                </div>
                <Link href={shopPath} target="_blank" rel="noopener" data-testid="shop-link" className="mt-2 block break-all font-mono text-[13px] font-bold text-blue-900 hover:underline dark:text-blue-200">
                  {shopPath}
                </Link>
              </div>

              <h3 className="mt-6 text-xs font-bold uppercase tracking-wide text-muted-foreground">Latest run per browser</h3>
              <ul className="m-0 mt-3 grid list-none grid-cols-3 gap-3 p-0">
                {ENGINES.map((e) => {
                  const st = byId.get(engineStep(e));
                  const done = Boolean(st?.done);
                  return (
                    <li
                      key={e}
                      data-testid={`engine-${e}`}
                      data-done={done}
                      className={`rounded-xl p-3 text-center ${done ? "border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30" : "border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40"}`}
                    >
                      <span className="block text-sm font-bold">{ENGINE_LABEL[e]}</span>
                      <span className={`mt-1 block text-xl ${done ? "text-emerald-600" : "text-slate-400"}`} aria-hidden="true">{done ? "✓" : "—"}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">{done && st?.at ? ago(st.at, now) : st?.rejected ? "Not counted" : "No run yet"}</span>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="min-w-0 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
              <h2 className="text-lg font-extrabold">How it works</h2>
              <ol className="m-0 mt-4 list-none space-y-3 p-0 text-sm font-medium">
                {[
                  "Install the browsers: npx playwright install",
                  "Add a project per browser in the config",
                  "Point your checkout spec at the shop link above and run it on all three",
                  "Add a browser matrix to the CI workflow, push, paste the repo URL",
                ].map((t, i) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900">{i + 1}</span>
                    {t}
                  </li>
                ))}
              </ol>
              <details className="mt-5">
                <summary className="cursor-pointer text-sm font-bold text-blue-700 dark:text-blue-400">Show a Playwright example</summary>
                <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-xs leading-5 text-slate-100">{SNIPPET}</pre>
                <p className="mt-3 text-[13px] text-muted-foreground">
                  Cypress: set <code>experimentalWebKitSupport: true</code>, install <code>playwright-webkit</code>, and run <code>cypress run --browser chrome</code>, <code>firefox</code> and <code>webkit</code>.
                </p>
              </details>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
