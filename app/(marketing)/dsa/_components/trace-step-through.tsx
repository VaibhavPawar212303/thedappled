"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

// A trace table filled in one row at a time (Prev / Next). Rows after the current one stay empty,
// so the learner can guess the next row before revealing it. `hot` highlights one column; `doneNote`
// replaces the caption shown once every row is revealed.
// Design: Penpot "27 - DSA Learning Path", pages "Foundations 4 – Tracing code" and "Foundations 5 – Neighbours & swaps".
export function TraceStepThrough({
  title,
  head,
  rows,
  hot,
  doneNote = "Done. Count the rows that say yes: that is how many times the loop body ran.",
}: {
  title: string;
  head: string[];
  rows: string[][];
  hot?: number;
  doneNote?: string;
}) {
  const [k, setK] = React.useState(1); // rows shown so far
  const last = k === rows.length;
  const note = head.length - 1; // the last column is a plain-English note

  return (
    <figure data-testid="trace-step-through" className="m-0 mt-6 overflow-hidden rounded-2xl border bg-card">
      <div className="flex flex-wrap items-center gap-3 bg-slate-100 px-4 py-2.5 dark:bg-slate-800">
        <span className="text-sm font-bold">{title}</span>
        <span className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setK((v) => Math.max(1, v - 1))}
            disabled={k === 1}
            className="inline-flex h-7 items-center gap-1 rounded-md border bg-background px-2.5 text-xs font-semibold disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Prev
          </button>
          <span data-testid="trace-label" className="text-xs font-bold" aria-live="polite">
            Row {k} of {rows.length}
          </span>
          <button
            type="button"
            onClick={() => setK((v) => Math.min(rows.length, v + 1))}
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
      <div className="overflow-x-auto p-2">
        <table className="w-full border-collapse text-left text-[15px]">
          <thead>
            <tr>
              {head.map((h, i) => (
                <th key={h} scope="col" className={`whitespace-nowrap px-3 py-2.5 text-xs font-bold uppercase tracking-wide ${i === hot ? "text-blue-700 dark:text-blue-300" : "text-muted-foreground"}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => {
              const shown = ri < k;
              const current = ri === k - 1;
              return (
                <tr key={ri} data-current={current || undefined} className={`border-t ${current ? "bg-blue-100 dark:bg-blue-950/60" : ""}`}>
                  {r.map((c, ci) => (
                    <td
                      key={ci}
                      className={`h-11 whitespace-nowrap px-3 ${ci === note ? "" : "font-mono"} ${ci === 0 || ci === hot ? "font-bold" : ""} ${ci === hot ? "text-blue-700 dark:text-blue-300" : ci === 0 ? "text-slate-900 dark:text-slate-100" : "text-slate-700 dark:text-slate-300"}`}
                    >
                      {shown ? c : ""}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <figcaption className="border-t px-5 py-3 text-[13px] text-muted-foreground">
        {last ? doneNote :"Guess the next row first, then press Next to check."}
      </figcaption>
    </figure>
  );
}
