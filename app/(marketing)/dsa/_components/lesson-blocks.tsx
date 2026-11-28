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

// Row of small concept cards. `big` is an optional large label (e.g. "n", "log n"); `img` is an
// optional illustration shown on top of the card (an SVG in /public, 360 × 220).
type CardItem = { t: string; d: React.ReactNode; big?: React.ReactNode; img?: { src: string; alt: string } };

export function Cards({ items, cols }: { items: CardItem[]; cols?: 2 | 3 }) {
  const two = cols ? cols === 2 : items.some((c) => c.img);
  return (
    <div className={`mt-6 grid gap-4 ${two ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
      {items.map((c) => (
        <div key={c.t} className="overflow-hidden rounded-2xl border bg-slate-50 dark:bg-slate-900/40">
          {c.img && <Illustration src={c.img.src} alt={c.img.alt} className="border-b" />}
          <div className="p-5">
            {c.big && <p className="mb-2 font-mono text-2xl font-extrabold text-blue-700 dark:text-blue-300">{c.big}</p>}
            <p className="font-bold">{c.t}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.d}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// An isometric illustration (SVG, 360 × 220) on a light panel, so its colours read the same in dark mode.
export function Illustration({ src, alt, className = "", maxW = "max-w-[360px]" }: { src: string; alt: string; className?: string; maxW?: string }) {
  return (
    <div className={`bg-slate-50 dark:bg-slate-100 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG, nothing to optimise */}
      <img src={src} alt={alt} width={360} height={220} loading="lazy" className={`mx-auto block h-auto w-full ${maxW}`} />
    </div>
  );
}

// A small table, e.g. "n → steps". The first column is the row label; `hot` highlights one column.
// `plain` uses the normal text font instead of the code font (for tables of words, not numbers).
export function DataTable({ caption, head, rows, hot, plain = false }: { caption?: string; head: string[]; rows: React.ReactNode[][]; hot?: number; plain?: boolean }) {
  const font = plain ? "" : "font-mono";
  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border">
      <table className="w-full border-collapse text-left text-[15px]">
        {caption && <caption className="border-b bg-slate-50 px-4 py-2.5 text-left text-sm font-bold text-slate-700 dark:bg-slate-900/40 dark:text-slate-300">{caption}</caption>}
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-900/40">
            {head.map((h, i) => (
              <th key={h} scope="col" className={`whitespace-nowrap border-b px-4 py-2.5 text-xs font-bold uppercase tracking-wide ${i === hot ? "text-blue-700 dark:text-blue-300" : "text-muted-foreground"}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} className="border-b last:border-b-0">
              {r.map((c, ci) =>
                ci === 0 ? (
                  <th key={ci} scope="row" className={`px-4 py-2.5 font-bold text-slate-900 dark:text-slate-100 ${plain ? "" : "whitespace-nowrap"} ${font}`}>
                    {c}
                  </th>
                ) : (
                  <td key={ci} className={`px-4 py-2.5 ${plain ? "" : "whitespace-nowrap"} ${font} ${ci === hot ? "font-bold text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-300"}`}>
                    {c}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// A wide illustration for a section (e.g. above the plain-English steps). `wide` allows up to 560px.
export function Figure({ src, alt, caption, wide = false }: { src: string; alt: string; caption?: string; wide?: boolean }) {
  return (
    <figure className="mt-6 overflow-hidden rounded-2xl border">
      <Illustration src={src} alt={alt} className="py-2" maxW={wide ? "max-w-[560px]" : "max-w-[480px]"} />
      {caption && <figcaption className="border-t px-5 py-3 text-sm text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}

// The algorithm in numbered plain-English steps, shown before the C code.
export function PlainSteps({ title, steps }: { title?: string; steps: string[] }) {
  return (
    <div data-testid="plain-steps" className="mt-6 rounded-xl border bg-slate-50 p-5 dark:bg-slate-900/40">
      {title && <p className="font-bold">{title}</p>}
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
