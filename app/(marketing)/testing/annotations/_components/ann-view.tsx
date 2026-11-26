"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ANNOTATION_STEPS, type AssignmentStatus } from "@/lib/assignments";
import { REASON_TEXT } from "@/lib/verification";
import { ToolBadge } from "../../_components/card-tool";

// Design: Penpot "26 - Testing Learning Path", page "Stage 5 – Annotations", board C.

type Env = { BASE_URL: string; ASSIGNMENT_TOKEN: string };
type Check = { ok: boolean; message: string };
type RepoScan = { repo: string; branch: string; checks: Record<string, Check> };
type ReportUpload = { checks: Record<string, Check>; tests: number; at: number };

const GROUPS = ["Run the lab", "From your test report", "Configure it on GitHub"] as const;

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

const EXAMPLE = `// tests/lab.spec.ts
import { test, expect } from '@playwright/test';

test.describe('annotations lab', { tag: '@lab' }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(\`/testing/annotations/lab?a=\${process.env.ASSIGNMENT_TOKEN}\`);
  });

  test('SAVE10 takes 10% off', {
    tag: '@smoke',
    annotation: { type: 'issue', description: 'SAVE10 gives 20% off' },
  }, async ({ page }) => {
    test.fail(); // known bug
    await page.getByTestId('coupon-input').fill('SAVE10');
    await page.getByTestId('coupon-apply').click();
    await expect(page.getByTestId('order-total')).toHaveText('$72.00');
  });

  test('export CSV', { tag: '@regression' }, async ({ page }) => {
    test.slow(); // 90 s instead of 30 s
    await page.getByTestId('export-button').click();
    await expect(page.getByTestId('export-status'))
      .toHaveText('Export ready', { timeout: 45_000 });
  });

  test.fixme('dark-mode export', async () => {});

  test('copy link', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Clipboard is not supported on WebKit');
    test.info().annotations.push({ type: 'browser', description: browserName });
    await page.getByTestId('copy-link').click();
    await expect(page.getByTestId('copy-status')).toHaveText('Link copied');
  });
});

// playwright.config.ts
export default defineConfig({
  forbidOnly: !!process.env.CI,
  use: { baseURL: process.env.BASE_URL },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
});

# run, then upload results.json
npx playwright test --reporter=json > results.json

# .github/workflows/tests.yml
      - run: npx playwright test --grep @smoke
        env:
          BASE_URL: \${{ secrets.BASE_URL }}
          ASSIGNMENT_TOKEN: \${{ secrets.ASSIGNMENT_TOKEN }}`;

function ago(iso: string, now: number) {
  const m = Math.round((now - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
}

export function AnnView({ initial, env, rank }: { initial: AssignmentStatus; env: Env; rank?: { rank: number; total: number } | null }) {
  const [status, setStatus] = React.useState(initial);
  const [repoUrl, setRepoUrl] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [repoError, setRepoError] = React.useState<string | null>(null);
  const [scan, setScan] = React.useState<RepoScan | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [upload, setUpload] = React.useState<ReportUpload | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const [now, setNow] = React.useState(() => Date.now());
  const fileRef = React.useRef<HTMLInputElement>(null);
  const completed = Boolean(status.completedAt);

  // Live progress from the learner's lab runs.
  React.useEffect(() => {
    if (completed) return;
    const id = setInterval(async () => {
      setNow(Date.now());
      try {
        const r = await fetch("/api/assignments/annotations", { cache: "no-store" });
        if (!r.ok) return;
        const { assignment } = await r.json();
        if (assignment) setStatus(assignment);
      } catch {}
    }, 3000);
    return () => clearInterval(id);
  }, [completed]);

  const checkRepo = async () => {
    setBusy(true);
    setRepoError(null);
    try {
      const r = await fetch("/api/assignments/annotations/repo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ repoUrl }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) setRepoError(d.error ?? "Could not check the repository.");
      else {
        setScan(d);
        if (d.assignment) setStatus(d.assignment);
      }
    } catch {
      setRepoError("Could not reach the server. Try again.");
    }
    setBusy(false);
  };

  const sendReport = async (file: File) => {
    setUploadError(null);
    if (file.size > 4 * 1024 * 1024) {
      setUploadError("The report is larger than 4 MB. Run with --reporter=json only (no traces or attachments).");
      return;
    }
    setUploading(true);
    try {
      const r = await fetch("/api/assignments/annotations/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: await file.text() });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setUploadError(d.error ?? "Could not check the report.");
        setUpload(d.checks ? { checks: d.checks, tests: d.tests ?? 0, at: Date.now() } : null);
      } else {
        setUpload({ checks: d.checks, tests: d.tests, at: Date.now() });
        if (d.assignment) setStatus(d.assignment);
      }
    } catch {
      setUploadError("Could not reach the server. Try again.");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const labPath = `/testing/annotations/lab?a=${env.ASSIGNMENT_TOKEN}`;
  const envText = `BASE_URL=${env.BASE_URL}\nASSIGNMENT_TOKEN=${env.ASSIGNMENT_TOKEN}`;
  const byId = new Map(status.steps.map((s) => [s.id, s]));
  const pct = Math.round((status.done / status.total) * 100);
  const minutes = status.completedAt ? Math.max(1, Math.round((new Date(status.completedAt).getTime() - new Date(status.startedAt).getTime()) / 60000)) : 0;
  const labStep = byId.get("ann-lab");

  const rankChip = (
    <Link href="/testing/leaderboard?stage=annotations&tool=playwright" data-testid="assignment-rank" className="inline-flex items-center gap-3 rounded-xl border bg-card px-4 py-2.5 text-sm shadow-sm hover:shadow-md">
      {rank && (
        <span>
          <span className="text-muted-foreground">Rank </span>
          <span className="font-extrabold">#{rank.rank} of {rank.total}</span>
        </span>
      )}
      <span className="font-bold text-purple-600 dark:text-purple-400">View leaderboard →</span>
    </Link>
  );

  return (
    <div className="bg-slate-50 dark:bg-slate-900/40">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/testing" className="hover:text-foreground">Testing</Link>
          <span aria-hidden="true">/</span>
          <Link href="/testing/annotations" className="hover:text-foreground">Playwright annotations</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-semibold text-foreground">Assignment</span>
        </nav>

        {completed ? (
          <div data-testid="assignment-complete" role="status" className="flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-purple-700 p-8 text-white md:p-10">
            <div className="flex items-center gap-5">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/15 text-4xl">✓</span>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Annotations assignment complete!</h1>
                <p className="mt-2 text-purple-100">Every annotation proved itself in a real run, and CI runs your @smoke tests.</p>
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
              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Assignment: Playwright annotations</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <ToolBadge tool="playwright" label="Playwright track" />
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">● In progress</span>
                <span className="text-muted-foreground">Lab runs update live · report and GitHub checks run when you submit</span>
              </div>
            </div>
            {rankChip}
          </div>
        )}
        {completed && <div className="mt-4 flex justify-end">{rankChip}</div>}

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.15fr_1fr]">
          <section className="min-w-0 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-extrabold">{completed ? "Your results" : "Requirements"}</h2>
              <span data-testid="assignment-count" className="text-base font-extrabold text-purple-700 dark:text-purple-400">
                {status.done} of {status.total} verified
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
              <div className="h-full rounded-full bg-purple-600 transition-all" style={{ width: `${pct}%` }} />
            </div>

            {GROUPS.map((g) => (
              <div key={g} className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{g}</h3>
                <ul className="m-0 mt-3 list-none space-y-3 p-0">
                  {ANNOTATION_STEPS.filter((s) => s.group === g).map((s) => {
                    const st = byId.get(s.id);
                    const done = Boolean(st?.done);
                    const rejected = !done ? st?.rejected : null;
                    const why = !done ? (scan?.checks[s.id] ?? upload?.checks[s.id])?.message ?? null : null;
                    const bad = Boolean(rejected || why);
                    return (
                      <li key={s.id} data-testid={`step-${s.id}`} data-done={done} className="flex items-start gap-3 text-[15px]">
                        <span
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-extrabold ${done ? "border-emerald-600 bg-emerald-600 text-white" : bad ? "border-red-500 bg-red-100 text-red-700 dark:bg-red-950" : "border-slate-300 dark:border-slate-600"}`}
                        >
                          {done ? <Check className="h-3.5 w-3.5" /> : bad ? "✕" : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block font-medium ${done || bad ? "" : "text-muted-foreground"}`}>{s.label}</span>
                          {rejected && <span className="mt-0.5 block text-[13px] font-semibold text-amber-700 dark:text-amber-400">{REASON_TEXT[rejected].short}</span>}
                          {why && <span data-testid={`why-${s.id}`} className="mt-0.5 block break-words text-[13px] font-semibold text-red-700 dark:text-red-400">{why}</span>}
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
                  aria-label="GitHub repository URL"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/you/dappled-tests"
                  className="h-12 min-w-0 flex-1 rounded-[10px] border border-input bg-background px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                />
                <Button data-testid="repo-check" onClick={checkRepo} disabled={busy || !repoUrl.trim()} className="h-12 bg-purple-600 px-6 text-white hover:bg-purple-700">
                  {busy ? "Checking…" : scan ? "Check again" : "Check my repo"}
                </Button>
              </div>
              <p className="mt-2 text-[13px] text-muted-foreground">Public repos only. We read files through the GitHub API; nothing is cloned. We keep your repo name and the result.</p>
              {repoError && <p data-testid="repo-error" role="alert" className="mt-3 text-sm font-semibold text-red-600">{repoError}</p>}
              {scan && !repoError && <p data-testid="repo-scanned" className="mt-3 text-[13px] text-muted-foreground">Checked {scan.repo} @ {scan.branch} just now.</p>}
            </div>
          </section>

          <div className="min-w-0 space-y-6">
            <section className="min-w-0 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-extrabold">Your lab link</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">Add these to <code>.env</code> and your repository secrets.</p>
              <div className="mt-4 rounded-xl bg-slate-900 p-4 text-slate-100">
                <pre data-testid="env-block" className="m-0 overflow-x-auto whitespace-pre text-xs leading-6">{envText}</pre>
                <div className="mt-3"><CopyButton text={envText} testid="copy-env" /></div>
              </div>
              <div data-testid="lab-url" className="mt-4 rounded-xl border-[1.5px] border-purple-600 bg-purple-50 p-4 dark:bg-purple-950/40">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-purple-700 dark:text-purple-300">Your lab URL</span>
                  <span className="flex gap-2">
                    <CopyButton text={`${env.BASE_URL}${labPath}`} testid="copy-lab-url" className="border border-purple-600 bg-white text-purple-700 hover:bg-purple-100 dark:bg-transparent dark:text-purple-300 dark:hover:bg-purple-900/40" />
                    <Link href={labPath} target="_blank" rel="noopener" data-testid="open-lab" className="inline-flex h-8 items-center gap-1 rounded-lg bg-purple-600 px-3 text-xs font-semibold text-white hover:bg-purple-700">
                      Open <ExternalLink className="h-3 w-3" />
                    </Link>
                  </span>
                </div>
                <Link href={labPath} target="_blank" rel="noopener" className="mt-2 block break-all font-mono text-[13px] font-bold text-purple-900 hover:underline dark:text-purple-200">
                  {labPath}
                </Link>
              </div>
              <p data-testid="lab-last-run" className="mt-3 text-[13px] text-muted-foreground">
                {labStep?.done && labStep.at ? `First automated lab run: ${ago(labStep.at, now)}` : labStep?.rejected ? "Your last lab visit didn’t count: run it with your Playwright script." : "No lab run yet."}
              </p>
            </section>

            <section className="min-w-0 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-extrabold">Upload your test report</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">Run the whole suite on all projects, then upload results.json.</p>
              <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-xs text-slate-100">npx playwright test --reporter=json &gt; results.json</pre>
              <label
                data-testid="report-drop"
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) void sendReport(f);
                }}
                className={`mt-4 flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed p-6 text-center transition ${dragging ? "border-purple-600 bg-purple-100 dark:bg-purple-900/40" : "border-purple-300 bg-purple-50 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/30 dark:hover:bg-purple-950/60"}`}
              >
                <Upload className="h-5 w-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                <span className="mt-2 text-sm font-bold text-purple-700 dark:text-purple-300">{uploading ? "Checking your report…" : "Drop results.json here or choose a file"}</span>
                <span className="mt-1 text-xs text-muted-foreground">Checked against your lab runs from the last 2 hours. Only the results are kept, not the file.</span>
                <input
                  ref={fileRef}
                  data-testid="report-file"
                  type="file"
                  accept="application/json,.json"
                  className="sr-only"
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void sendReport(f);
                  }}
                />
              </label>
              {uploadError && <p data-testid="report-error" role="alert" className="mt-3 text-sm font-semibold text-red-600">{uploadError}</p>}
              {upload && !uploadError && (
                <p data-testid="report-checked" className="mt-3 text-[13px] text-muted-foreground">
                  Last upload: {upload.tests} test run{upload.tests === 1 ? "" : "s"} · {Object.values(upload.checks).filter((c) => c.ok).length} of 6 report checks passed.
                </p>
              )}
            </section>

            <section className="min-w-0 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
              <h2 className="text-lg font-extrabold">How it works</h2>
              <ol className="m-0 mt-4 list-none space-y-3 p-0 text-sm font-medium">
                {[
                  "Open the lab link and write one test per lab panel",
                  "Add the annotation each panel needs",
                  "Run all projects with --reporter=json and upload the file",
                  "Push, add forbidOnly and a @smoke CI run, then check the repo",
                ].map((t, i) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900">{i + 1}</span>
                    {t}
                  </li>
                ))}
              </ol>
              <details className="mt-5">
                <summary className="cursor-pointer text-sm font-bold text-purple-700 dark:text-purple-400">Show a Playwright example</summary>
                <pre data-testid="tool-snippet" className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-xs leading-5 text-slate-100">{EXAMPLE}</pre>
              </details>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
