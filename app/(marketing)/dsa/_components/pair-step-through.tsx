"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

// "Step through it" for the Complexity lesson: the brute-force duplicate check on a small list,
// one comparison per step, with a running comparison counter and a log.
// Design: Penpot "27 - DSA Learning Path", page "Foundations 1 – Complexity & Big-O", board "Visual — has_duplicate step-through".

type Cmp = { i: number; j: number; match: boolean };

// Every comparison the nested loops make, stopping at the first match (like `return 1`).
function comparisons(a: number[]): Cmp[] {
  const out: Cmp[] = [];
  for (let i = 0; i < a.length; i++) {
    for (let j = i + 1; j < a.length; j++) {
      const match = a[i] === a[j];
      out.push({ i, j, match });
      if (match) return out;
    }
  }
  return out;
}

export function PairStepThrough({ values }: { values: number[] }) {
  const steps = React.useMemo(() => comparisons(values), [values]);
  const n = values.length;
  const worst = (n * (n - 1)) / 2;
  const [k, setK] = React.useState(1); // comparisons shown so far (1-based)
  const cur = steps[k - 1];
  const last = k === steps.length;
  const found = last && cur.match;

  return (
    <figure data-testid="pair-step-through" className="m-0 mt-6 overflow-hidden rounded-2xl border bg-card">
      <div className="flex flex-wrap items-center gap-3 bg-slate-100 px-4 py-2.5 dark:bg-slate-800">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
        </span>
        <span className="font-mono text-xs font-semibold text-muted-foreground">has_duplicate([{values.join(", ")}])</span>
        <span className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setK((v) => Math.max(1, v - 1))}
            disabled={k === 1}
            className="inline-flex h-7 items-center gap-1 rounded-md border bg-background px-2.5 text-xs font-semibold disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Prev
          </button>
          <span data-testid="step-label" className="text-xs font-bold" aria-live="polite">
            Step {k} of {steps.length}
          </span>
          <button
            type="button"
            onClick={() => setK((v) => Math.min(steps.length, v + 1))}
            disabled={last}
            className="inline-flex h-7 items-center gap-1 rounded-md bg-blue-600 px-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => setK(1)} aria-label="Reset" className="inline-flex h-7 w-8 items-center justify-center rounded-md border bg-background">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </span>
      </div>

      <div className="grid gap-6 p-5 sm:grid-cols-[auto_1fr] sm:items-start">
        <div className="flex gap-2 sm:gap-3">
          {values.map((v, idx) => {
            const active = idx === cur.i || idx === cur.j;
            const cls = active
              ? found
                ? "bg-emerald-500 text-white"
                : "bg-blue-600 text-white"
              : "border border-blue-200 bg-blue-50 text-foreground dark:border-blue-900 dark:bg-blue-950/50";
            return (
              <div key={idx} className="flex flex-col items-center">
                <span className="font-mono text-[11px] text-slate-400">[{idx}]</span>
                <span className={`mt-1 flex h-12 w-12 items-center justify-center rounded-xl font-mono text-lg font-bold sm:h-16 sm:w-16 sm:text-2xl ${cls}`}>{v}</span>
                <span className="mt-1 h-4 font-mono text-sm font-bold text-blue-600 dark:text-blue-400">{idx === cur.i ? "i" : idx === cur.j ? "j" : ""}</span>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border bg-slate-50 p-4 dark:bg-slate-900/40">
            <p className="text-xs font-bold text-muted-foreground">Comparisons</p>
            <p data-testid="comparison-count" className="text-3xl font-extrabold text-blue-700 dark:text-blue-300">{k}</p>
            <p className="text-[11px] text-muted-foreground">so far</p>
          </div>
          <div className="rounded-xl border bg-slate-50 p-4 dark:bg-slate-900/40">
            <p className="text-xs font-bold text-muted-foreground">Worst case, n = {n}</p>
            <p className="text-3xl font-extrabold">{worst}</p>
            <p className="text-[11px] text-muted-foreground">n(n − 1) ÷ 2 pairs</p>
          </div>
        </div>
      </div>

      <div className="px-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Comparison log</p>
        <ol className="m-0 mt-2 list-none space-y-0.5 p-0">
          {steps.slice(0, k).map((s, idx) => {
            const isLast = idx === k - 1;
            return (
              <li
                key={idx}
                className={`grid grid-cols-[2rem_1fr_auto] items-center gap-2 rounded-md px-2 py-1 font-mono text-[13px] ${s.match ? "bg-emerald-50 dark:bg-emerald-950/40" : isLast ? "bg-blue-50 dark:bg-blue-950/40" : ""}`}
              >
                <span className="font-bold text-slate-400">{idx + 1}.</span>
                <span>
                  a[{s.i}] = {values[s.i]} vs a[{s.j}] = {values[s.j]}
                </span>
                <span className={`font-sans text-xs ${s.match ? "font-bold text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}`}>
                  {s.match ? "match → duplicate" : "different"}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <figcaption className="m-4 rounded-xl bg-slate-900 px-4 py-3 text-white">
        <p className="text-sm font-bold" aria-live="polite">
          {found ? `Found a duplicate after ${k} comparisons.` : last ? `No duplicate: all ${k} pairs checked.` : `Comparing a[${cur.i}] and a[${cur.j}]… press Next.`}
        </p>
        <p className="text-xs text-slate-400">With no duplicate it checks all n(n − 1) ÷ 2 pairs, so the work grows like n²: O(n²).</p>
      </figcaption>
    </figure>
  );
}
