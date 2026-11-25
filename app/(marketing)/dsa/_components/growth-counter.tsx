"use client";

import * as React from "react";

// "How many steps for n items?" — pick n and compare O(1), O(log n), O(n) and O(n²) as bars.
// Design: Penpot "27 - DSA Learning Path", page "Foundations 2 – Reading loops", board "Visual — step counter".

const SIZES = [4, 8, 16, 32];

function rows(n: number) {
  return [
    { o: "O(1)", label: "no loop", steps: 1 },
    { o: "O(log n)", label: "halving", steps: Math.round(Math.log2(n)) },
    { o: "O(n)", label: "one loop", steps: n },
    { o: "O(n²)", label: "loop in a loop", steps: n * n },
  ];
}

export function GrowthCounter() {
  const [n, setN] = React.useState(8);
  const list = rows(n);
  const max = SIZES[SIZES.length - 1] ** 2; // bars share one scale, so doubling n is visible
  return (
    <figure data-testid="growth-counter" className="m-0 mt-6 overflow-hidden rounded-2xl border bg-card">
      <div className="flex flex-wrap items-center gap-3 bg-slate-100 px-5 py-3 dark:bg-slate-800">
        <p className="text-sm font-bold">How many steps for n items?</p>
        <div className="ml-auto flex gap-2" role="group" aria-label="Choose n">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setN(s)}
              aria-pressed={n === s}
              className={`h-8 rounded-lg px-3 text-xs font-bold transition ${n === s ? "bg-blue-600 text-white" : "border bg-background hover:bg-slate-50 dark:hover:bg-slate-900"}`}
            >
              n = {s}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4 p-5">
        {list.map((r) => (
          <div key={r.o} className="grid grid-cols-[6.5rem_1fr_5.5rem] items-center gap-3">
            <div>
              <p className="font-mono font-bold text-blue-700 dark:text-blue-300">{r.o}</p>
              <p className="text-xs text-muted-foreground">{r.label}</p>
            </div>
            <div className="h-6 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800" aria-hidden="true">
              <div
                className={`h-full rounded-md transition-all duration-500 ${r.o === "O(n²)" ? "bg-amber-500" : "bg-blue-600"}`}
                style={{ width: `${Math.max(1.5, (r.steps / max) * 100)}%` }}
              />
            </div>
            <p data-testid={`steps-${r.o}`} className="text-right text-sm font-bold">
              {r.steps.toLocaleString("en-US")} step{r.steps === 1 ? "" : "s"}
            </p>
          </div>
        ))}
      </div>
      <figcaption className="px-5 pb-5 text-[13px] text-muted-foreground">
        Pick n, then double it: O(1) doesn&apos;t move, O(log n) adds one step, O(n) doubles, and O(n²) becomes four times bigger.
      </figcaption>
    </figure>
  );
}
