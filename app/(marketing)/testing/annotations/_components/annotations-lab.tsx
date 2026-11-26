"use client";

import * as React from "react";
import { Copy, Download, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAssignmentReporter } from "../../ui-automation/_components/assignment-reporter";
import { AssignmentNote } from "../../ui-automation/_components/assignment-banner";
import { detectEngine } from "../../page-objects/_components/demo-shop";

// Design: Penpot "26 - Testing Learning Path", page "Stage 5 – Annotations", board D.
// Each panel needs a different annotation in the learner's tests:
//   Coupon      → test.fail   (known bug: SAVE10 takes 20% off instead of 10%)
//   Export      → test.slow   (the file is ready after 40 s, longer than the default 30 s timeout)
//   Dark export → test.fixme  (not built yet)
//   Copy link   → test.skip(browserName === 'webkit', …) (not supported on WebKit)

const SUBTOTAL = 80;
export const EXPORT_MS = 40_000;
const money = (n: number) => `$${n.toFixed(2)}`;

function Panel({ title, tag, tone, children, testid }: { title: string; tag: string; tone: string; children: React.ReactNode; testid: string }) {
  return (
    <section data-testid={testid} className="min-w-0 rounded-2xl border bg-card p-6 shadow-sm sm:p-7">
      <h2 className="text-lg font-extrabold">{title}</h2>
      <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{tag}</span>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function AnnotationsLab() {
  const { report } = useAssignmentReporter();
  // Every action counts as a lab visit (the server decides whether it was automated).
  const visit = React.useCallback(() => report("ann-lab"), [report]);

  // Coupon (known bug)
  const [code, setCode] = React.useState("");
  const [applied, setApplied] = React.useState<string | null>(null);
  const [couponError, setCouponError] = React.useState<string | null>(null);
  const discount = applied === "SAVE10" ? SUBTOTAL * 0.2 : 0; // the bug: should be 10%
  const apply = () => {
    visit();
    const c = code.trim().toUpperCase();
    if (c === "SAVE10") {
      setApplied(c);
      setCouponError(null);
    } else {
      setApplied(null);
      setCouponError(c ? "That code isn't valid." : "Enter a coupon code.");
    }
  };

  // Export (slow)
  const [exportState, setExportState] = React.useState<"idle" | "running" | "ready">("idle");
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    if (exportState !== "running") return;
    const started = Date.now();
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - started) / EXPORT_MS);
      setProgress(p);
      if (p >= 1) {
        clearInterval(id);
        setExportState("ready");
      }
    }, 250);
    return () => clearInterval(id);
  }, [exportState]);
  const startExport = () => {
    visit();
    setProgress(0);
    setExportState("running");
  };

  // Copy link (not on WebKit)
  const [engine, setEngine] = React.useState<string | null>(null);
  React.useEffect(() => setEngine(detectEngine()), []);
  const [copied, setCopied] = React.useState(false);
  const shareLink = "https://thedappled.com/r/weekly-sales";
  const copy = async () => {
    visit();
    try {
      await navigator.clipboard.writeText(shareLink);
    } catch {}
    setCopied(true);
  };
  const webkit = engine === "webkit";

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Reports dashboard</h1>
      <p className="mt-2 text-muted-foreground">The annotations lab: each panel needs a different annotation in your tests.</p>
      <AssignmentNote />

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Panel testid="panel-coupon" title="Coupon" tag="Known bug → test.fail" tone="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
          <form
            className="flex flex-wrap gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              apply();
            }}
          >
            <label htmlFor="coupon" className="sr-only">Coupon code</label>
            <input
              id="coupon"
              data-testid="coupon-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Coupon code"
              className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            />
            <Button type="submit" data-testid="coupon-apply" className="h-10 bg-blue-600 px-5 text-white hover:bg-blue-700">Apply</Button>
          </form>
          {couponError && <p data-testid="coupon-error" role="alert" className="mt-2 text-sm font-semibold text-red-600">{couponError}</p>}
          <dl className="mt-5 space-y-1.5 font-mono text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd data-testid="order-subtotal">{money(SUBTOTAL)}</dd></div>
            <div className="flex justify-between"><dt>Discount{applied ? ` (${applied}: 10% off)` : ""}</dt><dd data-testid="order-discount">−{money(discount)}</dd></div>
            <div className="flex justify-between border-t pt-1.5 font-bold"><dt>Total</dt><dd data-testid="order-total">{money(SUBTOTAL - discount)}</dd></div>
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">SAVE10 should take 10% off. Write the test the way it should work.</p>
        </Panel>

        <Panel testid="panel-export" title="Export report" tag="Slow → test.slow" tone="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          <Button data-testid="export-button" onClick={startExport} disabled={exportState === "running"} className="h-10 bg-blue-600 px-5 text-white hover:bg-blue-700">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
            <div className="h-full rounded-full bg-blue-600 transition-[width] duration-200" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <p data-testid="export-status" role="status" className="mt-3 text-sm font-medium">
            {exportState === "idle" ? "No export yet." : exportState === "running" ? "Preparing export… about 40 seconds" : "Export ready"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">The file takes about 40 seconds, longer than Playwright’s default 30-second test timeout.</p>
        </Panel>

        <Panel testid="panel-dark-export" title="Dark-mode export (beta)" tag="Not built → test.fixme" tone="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <div className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
            <Moon className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden="true" />
            <p className="mt-2 font-bold text-muted-foreground">Coming soon</p>
            <Button data-testid="dark-export-button" disabled variant="outline" className="mt-3">Export dark PDF</Button>
            <p className="mt-2 text-xs text-muted-foreground">The button does nothing yet.</p>
          </div>
        </Panel>

        <Panel testid="panel-copy-link" title="Copy share link" tag="Browser-specific → test.skip(condition)" tone="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <Button data-testid="copy-link" onClick={copy} disabled={webkit} className="h-10 bg-slate-900 px-5 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
            <Copy className="mr-2 h-4 w-4" /> Copy link
          </Button>
          <p data-testid="copy-status" role="status" className="mt-4 text-sm">
            {webkit ? "Copying links isn’t supported in this browser yet." : copied ? "Link copied" : "Copies the report link to the clipboard."}
          </p>
          {copied && !webkit && <p data-testid="copied-link" className="mt-1 break-all font-mono text-xs text-muted-foreground">{shareLink}</p>}
          <p className="mt-3 text-xs text-muted-foreground">Not supported on WebKit (Safari’s engine): the button is disabled there.</p>
        </Panel>
      </div>
    </div>
  );
}
