import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { withTool, type Tool } from "@/lib/tools";
import { TONES, type Progress, type Step, type Tone } from "./roadmap-data";

// The numbered steps of a track or tool, with done / in progress / to do states.
// Design: Penpot "26 - Testing Learning Path", page "Roadmap – tracks", boards B and D.
export function StepList({
  steps,
  tone,
  progress,
  tool,
  stepTestId,
  activeLabel = "In progress",
}: {
  steps: Step[];
  tone: Tone;
  progress: Progress | null;
  tool?: Tool; // automation steps open with this tool chosen
  stepTestId: (n: number) => string;
  activeLabel?: string;
}) {
  const t = TONES[tone];
  return (
    <ol className="m-0 grid list-none gap-3 p-0">
      {steps.map((st) => {
        const ps = progress?.get(st.progressKey);
        const state = ps?.state ?? "todo";
        const base = st.href && state === "active" && tool ? `${st.href}/assignment` : st.href;
        const href = base && tool ? withTool(base, tool) : base;
        const body = (
          <>
            {state === "done" ? (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white" aria-label="Done">
                <Check className="h-5 w-5" />
              </span>
            ) : (
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-extrabold ${t.chip}`}>{st.n}</span>
            )}
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Step {st.n}
                {state === "active" && <> · {activeLabel}</>}
                {st.isNew && <span className={`rounded-full px-2 py-0.5 text-[11px] normal-case tracking-normal ${TONES.green.chip}`}>New</span>}
              </span>
              <span className="mt-0.5 block text-lg font-bold">{st.title}</span>
              <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">{st.blurb}</span>
              {state === "active" && ps && ps.total > 1 && (
                <span className="mt-2 flex items-center gap-2">
                  <span className={`h-1.5 w-28 overflow-hidden rounded-full ${t.soft}`} aria-hidden="true">
                    <span className={`block h-full rounded-full ${t.bar}`} style={{ width: `${(ps.done / ps.total) * 100}%` }} />
                  </span>
                  <span className={`text-xs font-bold ${t.text}`}>
                    {ps.done}/{ps.total} checks
                  </span>
                </span>
              )}
            </span>
            {state === "done" ? (
              <span className="inline-flex shrink-0 items-center gap-1 self-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Check className="h-3 w-3" /> Done
              </span>
            ) : st.href ? (
              <span className={`hidden shrink-0 items-center gap-1 self-center text-sm font-semibold sm:inline-flex ${t.text}`}>
                {state === "active" ? "Continue" : "Start step"} <ArrowRight className="h-4 w-4" />
              </span>
            ) : (
              <span className="shrink-0 self-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">Coming soon</span>
            )}
          </>
        );
        const cls = `flex items-start gap-4 rounded-2xl p-4 sm:p-5 ${
          state === "done"
            ? "border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
            : state === "active"
              ? `border-[1.5px] ${t.border} bg-slate-50 dark:bg-slate-900/40`
              : "border bg-slate-50 dark:bg-slate-900/40"
        }`;
        return (
          <li key={st.title} data-testid={stepTestId(st.n)} data-state={progress ? state : undefined}>
            {href ? (
              <Link href={href} className={`${cls} transition hover:shadow-md`}>{body}</Link>
            ) : (
              <div className={cls} aria-disabled="true">{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

// "n of N done" with a bar, above a step list.
export function StepsHeader({ title, done, total, unit, tone, testid }: { title: string; done: number; total: number; unit: string; tone: Tone; testid?: string }) {
  const t = TONES[tone];
  return (
    <div data-testid={testid} className="mb-5">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
        <p className={`text-sm font-extrabold ${t.text}`}>
          {done} of {total} {unit}
        </p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
        <div className={`h-full rounded-full ${t.bar}`} style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
      </div>
    </div>
  );
}
