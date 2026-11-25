import * as React from "react";

// Small building blocks shared by the beginner DSA lessons.
// Design: Penpot "27 - DSA Learning Path", pages "Foundations 1-4".

export function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-[17px] leading-relaxed text-slate-700 dark:text-slate-300">{children}</p>;
}

export function KeyIdea({ title = "Key idea", children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-xl border border-blue-200 border-l-[6px] border-l-blue-600 bg-blue-50 p-5 dark:border-blue-900 dark:border-l-blue-500 dark:bg-blue-950/40">
      <p className="font-bold text-blue-700 dark:text-blue-300">{title}</p>
      <p className="mt-1 text-blue-900 dark:text-blue-200">{children}</p>
    </div>
  );
}

export function Tip({ title = "Remember", children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/40">
      <p className="font-bold text-amber-800 dark:text-amber-300">{title}</p>
      <p className="mt-1 text-amber-900 dark:text-amber-200">{children}</p>
    </div>
  );
}

// Row of small concept cards. `big` is an optional large label (e.g. "n", "log n").
export function Cards({ items }: { items: { t: string; d: React.ReactNode; big?: React.ReactNode }[] }) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-3">
      {items.map((c) => (
        <div key={c.t} className="rounded-2xl border bg-slate-50 p-5 dark:bg-slate-900/40">
          {c.big && <p className="mb-2 font-mono text-2xl font-extrabold text-blue-700 dark:text-blue-300">{c.big}</p>}
          <p className="font-bold">{c.t}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.d}</p>
        </div>
      ))}
    </div>
  );
}

// The algorithm in numbered plain-English steps, shown before the C code.
export function PlainSteps({ title, steps }: { title?: string; steps: string[] }) {
  return (
    <div data-testid="plain-steps" className="mt-6 rounded-xl border bg-slate-50 p-5 dark:bg-slate-900/40">
      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">In plain English</p>
      {title && <p className="mt-1 font-bold">{title}</p>}
      <ol className="m-0 mt-3 list-none space-y-2.5 p-0">
        {steps.map((s, i) => (
          <li key={s} className="flex items-start gap-3 text-[15px] text-slate-700 dark:text-slate-300">
            <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">{i + 1}</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
