import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { TONES, type Tone } from "./roadmap-data";

// A big selectable card: a track on /testing, a tool on /testing/automation and /testing/mobile.
// Design: Penpot "26 - Testing Learning Path", page "Roadmap – tracks", boards A, C and E.
export function TrackCard({
  href,
  tone,
  Icon,
  title,
  meta,
  pills = [],
  blurb,
  chips = [],
  progress,
  cta,
  soon = false,
  testid,
}: {
  href?: string; // no href = not available yet
  tone: Tone;
  Icon: LucideIcon;
  title: string;
  meta: string;
  pills?: { label: string; tone?: Tone | "slate" }[];
  blurb: string;
  chips?: string[];
  progress?: { done: number; total: number; unit: string } | null;
  cta: string;
  soon?: boolean;
  testid: string;
}) {
  const t = TONES[tone];
  const inner = (
    <>
      <div className={`h-2 ${t.bar}`} />
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${t.chip}`}>
              <Icon className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h3 className="text-2xl font-extrabold tracking-tight">{title}</h3>
              <p className="text-sm text-muted-foreground">{meta}</p>
            </div>
          </div>
          {pills.length > 0 && (
            <span className="flex shrink-0 flex-wrap justify-end gap-2">
              {pills.map((p) => (
                <span
                  key={p.label}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${p.tone === "slate" ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" : TONES[p.tone ?? tone].chip}`}
                >
                  {p.label}
                </span>
              ))}
            </span>
          )}
        </div>
        <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">{blurb}</p>
        {chips.length > 0 && (
          <ul className="m-0 mt-5 flex list-none flex-wrap gap-2 p-0">
            {chips.map((c) => (
              <li key={c} className="rounded-full border bg-slate-50 px-3 py-1 text-xs font-semibold dark:bg-slate-900/40">{c}</li>
            ))}
          </ul>
        )}
        {progress && (
          <div className="mt-6" data-testid={`${testid}-progress`}>
            <p className={`text-sm font-extrabold ${t.text}`}>
              {progress.done} of {progress.total} {progress.unit}
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
              <div className={`h-full rounded-full ${t.bar}`} style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} />
            </div>
          </div>
        )}
        <div className="mt-auto pt-7">
          <span
            className={`flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold ${
              soon ? "border bg-slate-50 text-muted-foreground dark:bg-slate-900/40" : t.button
            }`}
          >
            {cta} {!soon && <ArrowRight className="h-4 w-4" />}
          </span>
        </div>
      </div>
    </>
  );
  const cls = "flex h-full flex-col overflow-hidden rounded-3xl border bg-card shadow-sm";
  return href ? (
    <Link href={href} data-testid={testid} className={`${cls} transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}>
      {inner}
    </Link>
  ) : (
    <article data-testid={testid} className={cls}>
      {inner}
    </article>
  );
}
