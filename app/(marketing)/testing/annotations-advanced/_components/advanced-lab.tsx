"use client";

import * as React from "react";
import { useAssignmentReporter } from "../../ui-automation/_components/assignment-reporter";
import { detectEngine } from "../../page-objects/_components/demo-shop";

// Design: Penpot "26 - Testing Learning Path", page "Stage 6 – Advanced annotations", board D.
// Each area needs a group-level annotation in the learner's tests:
//   Charts   → test.skip(({ browserName }) => browserName !== 'chromium', …) inside the describe block
//   Settings → test.fixme(isMobile, …) in the group's beforeEach hook
//   Reports  → tags (@fast / @slow, also in titles), several annotations, a hidden one, --grep "@fast|@slow"

const BARS = [42, 68, 55, 81, 63, 94];
const MONTHS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SETTINGS = [
  { id: "email", label: "Email alerts" },
  { id: "digest", label: "Weekly digest" },
  { id: "dark", label: "Dark mode" },
];
const REPORTS = [
  { id: "daily", name: "Daily summary", tag: "@fast" },
  { id: "weekly", name: "Weekly report", tag: "@slow" },
  { id: "year", name: "Full year report", tag: "@slow" },
];

// Playwright's mobile devices (isMobile) send a phone user agent and a touch screen.
const detectMobile = () => /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.matchMedia("(pointer: coarse)").matches;

function Panel({ title, tag, tone, testid, children, className = "" }: { title: string; tag: string; tone: string; testid: string; children: React.ReactNode; className?: string }) {
  return (
    <section data-testid={testid} className={`min-w-0 rounded-2xl border bg-card p-6 shadow-sm sm:p-7 ${className}`}>
      <h2 className="text-lg font-extrabold">{title}</h2>
      <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{tag}</span>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function AdvancedLab() {
  const { token, report } = useAssignmentReporter();
  const [env, setEnv] = React.useState<{ engine: string; mobile: boolean } | null>(null);
  const [on, setOn] = React.useState<Record<string, boolean>>({ email: false, digest: true, dark: false });

  React.useEffect(() => setEnv({ engine: detectEngine(), mobile: detectMobile() }), []);
  // Each page load by the learner's tests counts as a lab visit (the server decides whether it was automated).
  React.useEffect(() => {
    if (!token) return;
    const id = setTimeout(() => report("adv-lab"), 400);
    return () => clearTimeout(id);
  }, [token, report]);

  const chromium = env?.engine === "chromium";

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Analytics workspace</h1>
      <p className="mt-2 text-muted-foreground">The advanced lab: each area needs a group-level annotation in your tests.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Panel testid="panel-charts" title="Charts" tag="Chromium only → skip the group" tone="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {env === null ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : chromium ? (
            <figure data-testid="chart" aria-label="Revenue, last 6 months">
              <div className="flex h-40 items-end gap-3">
                {BARS.map((h, i) => (
                  <div key={MONTHS[i]} className="flex flex-1 flex-col items-center gap-1">
                    <div data-testid="chart-bar" className={`w-full rounded-t-md ${i % 2 ? "bg-blue-300" : "bg-blue-600"}`} style={{ height: `${Math.round(h * 1.25)}px` }} title={`${MONTHS[i]}: ${h}k`} />
                    <span className="text-[11px] text-muted-foreground">{MONTHS[i]}</span>
                  </div>
                ))}
              </div>
              <figcaption className="mt-3 text-sm font-semibold">Revenue, last 6 months</figcaption>
            </figure>
          ) : (
            <p data-testid="charts-unsupported" role="status" className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center text-sm font-semibold text-muted-foreground dark:border-slate-700">
              Charts need Chromium.
            </p>
          )}
        </Panel>

        <Panel testid="panel-settings" title="Settings" tag="Not on mobile yet → fixme in beforeEach" tone="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          {env === null ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : env.mobile ? (
            <p data-testid="settings-mobile" role="status" className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center text-sm font-semibold text-muted-foreground dark:border-slate-700">
              Settings aren’t available on mobile yet.
            </p>
          ) : (
            <ul className="m-0 list-none space-y-4 p-0">
              {SETTINGS.map((st) => (
                <li key={st.id} className="flex items-center justify-between gap-4">
                  <span id={`label-${st.id}`} className="text-sm font-medium">{st.label}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on[st.id]}
                    aria-labelledby={`label-${st.id}`}
                    data-testid={`setting-${st.id}`}
                    onClick={() => setOn((o) => ({ ...o, [st.id]: !o[st.id] }))}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${on[st.id] ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-600"}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on[st.id] ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel testid="panel-reports" title="Reports" tag={'Tag them: @fast, @slow → --grep "@fast|@slow"'} tone="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" className="md:col-span-2">
          <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-3">
            {REPORTS.map((r) => (
              <li key={r.id} data-testid={`report-${r.id}`} className="flex items-center justify-between gap-3 rounded-xl border bg-background px-4 py-3">
                <span className="text-sm font-semibold">{r.name}</span>
                <span className="font-mono text-xs text-muted-foreground">{r.tag}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">Write one test per report. Tag them in the details or in the title, and give one test two annotations and a hidden one.</p>
        </Panel>
      </div>
    </div>
  );
}
