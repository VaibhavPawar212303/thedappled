import Link from "next/link";
import { Check } from "lucide-react";

type Crumb = { label: string; href?: string };

export function PracticeLayout({
  crumbs,
  checklist,
  selectors,
  note,
  children,
}: {
  crumbs: Crumb[];
  checklist: string[];
  selectors: string[];
  note?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/40">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {crumbs.map((c, i) => (
            <span key={c.label} className="flex items-center gap-2">
              {c.href ? (
                <Link href={c.href} className="hover:text-foreground">{c.label}</Link>
              ) : (
                <span aria-current="page" className="font-semibold text-foreground">{c.label}</span>
              )}
              {i < crumbs.length - 1 && <span aria-hidden="true">/</span>}
            </span>
          ))}
        </nav>

        <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_1fr]">
          <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">{children}</div>

          <aside className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-extrabold">Things to test</h2>
            <ul className="m-0 mt-5 list-none space-y-3 p-0">
              {checklist.map((t) => (
                <li key={t} className="flex items-start gap-3 text-[15px] font-medium">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <Check className="h-3 w-3" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>

            <h3 className="mt-8 text-base font-extrabold">Selectors</h3>
            <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-[13px] leading-7 text-sky-300">
              {selectors.map((s) => `data-testid="${s}"`).join("\n")}
            </pre>
            {note && <div className="mt-6 text-sm text-muted-foreground">{note}</div>}
          </aside>
        </div>
      </div>
    </div>
  );
}

export const inputClass =
  "mt-2 h-12 w-full rounded-[10px] border border-input bg-background px-4 text-[15px] outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-emerald-500 aria-[invalid=true]:border-red-500 aria-[invalid=true]:bg-red-50 dark:aria-[invalid=true]:bg-red-950/30";
