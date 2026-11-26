"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Star, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AllTracksBoard, AllTracksRow } from "@/lib/leaderboard";
import { TOOL_LABEL, withTool, type Tool } from "@/lib/tools";
import { BoardTabs } from "./board-tabs";

// Design: Penpot "26 - Testing Learning Path", Leaderboard page, board "Leaderboard - All tracks (new)".

const PAGE = 10;
const MEDAL = ["bg-amber-500", "bg-slate-400", "bg-orange-700"];
const AVATAR = [
  "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200",
  "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200",
];

const CONTINUE: Record<string, string> = {
  "manual-testing": "/testing#roadmap",
  "ui-automation": "/testing/ui-automation/assignment",
  "framework-setup": "/testing/framework-setup/assignment",
  "page-objects": "/testing/page-objects/assignment",
  "cross-browser": "/testing/cross-browser/assignment",
  annotations: "/testing/annotations/assignment",
  "annotations-advanced": "/testing/annotations-advanced/assignment",
};

function initials(name: string) {
  const parts = name.replace(/\./g, "").split(" ").filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)).toUpperCase();
}

function Rank({ n }: { n: number }) {
  return n <= 3 ? (
    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold text-white ${MEDAL[n - 1]}`}>{n}</span>
  ) : (
    <span className="w-7 text-center text-sm font-bold text-muted-foreground">{n}</span>
  );
}

const chip = "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold";

function ManualChip({ r }: { r: AllTracksRow }) {
  if (!r.manual.started) return <span className={`${chip} bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400`}>Manual · not started</span>;
  if (r.manual.complete)
    return (
      <span className={`${chip} bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300`}>
        Manual <Check className="h-3 w-3" />
      </span>
    );
  return <span className={`${chip} bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300`}>Manual {r.manual.done}/{r.manual.total}</span>;
}

function AutomationChip({ r }: { r: AllTracksRow }) {
  if (!r.automation.started) return <span className={`${chip} bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400`}>Automation · not started</span>;
  const strong = r.automation.stagesDone > 0;
  return (
    <span className={`${chip} ${strong ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
      Automation {r.automation.stagesDone}/{r.automation.stages}
    </span>
  );
}

function CurrentStage({ r }: { r: AllTracksRow }) {
  if (r.allDone)
    return (
      <span className={`${chip} bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300`}>
        <Star className="h-3 w-3" /> All tracks done
      </span>
    );
  if (!r.current) return <span className="text-sm text-muted-foreground">—</span>;
  return (
    <span className="text-sm">
      {r.current.label} <span className="text-muted-foreground">· {r.current.complete ? "done" : `${r.current.done}/${r.current.total}`}</span>
    </span>
  );
}

export function AllTracksView({ board, signedIn, tool }: { board: AllTracksBoard; signedIn: boolean; tool: Tool }) {
  const router = useRouter();
  const [shown, setShown] = React.useState(PAGE);

  // Keep the board live: refresh the server data every 30s while the tab is visible.
  React.useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 30000);
    return () => clearInterval(id);
  }, [router]);

  const rows = board.rows;
  const visible = rows.slice(0, shown);
  const you = rows.find((r) => r.isYou);

  const stats: [string, string, string][] = [
    [String(board.learners), "Learners", ""],
    [String(board.finishedAll), "Finished every track", "text-indigo-700 dark:text-indigo-300"],
    [String(board.checksVerified), "Checks verified", "text-amber-700 dark:text-amber-400"],
    [`${board.mostChecks} / ${board.max}`, "Most checks", "text-blue-600 dark:text-blue-400"],
  ];

  return (
    <div className="bg-background text-foreground">
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900/40">
        <div className="pointer-events-none absolute -right-10 top-16 h-56 w-56 rounded-full bg-indigo-200/60 blur-2xl dark:bg-indigo-900/20" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-12">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link href="/testing" className="hover:text-foreground">Testing</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="font-semibold text-foreground">Leaderboard</span>
          </nav>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight md:text-5xl">
            Leaderboard<span data-testid="board-tool" className="text-muted-foreground"> · {TOOL_LABEL[tool]}</span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">See how {TOOL_LABEL[tool]} learners are doing across every track — Manual testing plus the {TOOL_LABEL[tool]} stages.</p>
          <p className="mt-4 text-[13px] font-semibold text-indigo-700 dark:text-indigo-300">● Live · updates as learners complete checks</p>
          <BoardTabs current="all" tool={tool} />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4" data-testid="board-stats">
          {stats.map(([n, l, c]) => (
            <div key={l} className="rounded-2xl border bg-card p-5 shadow-sm">
              <dd className={`text-3xl font-extrabold ${c}`}>{n}</dd>
              <dt className="mt-1 text-sm text-muted-foreground">{l}</dt>
            </div>
          ))}
        </dl>

        {signedIn && (
          <section data-testid="board-you" className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-indigo-700 px-6 py-5 text-white">
            {you ? (
              <>
                <div className="flex flex-wrap items-center gap-x-8 gap-y-1">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-indigo-200">Your position</p>
                    <p className="text-2xl font-extrabold">#{you.rank} of {board.learners}</p>
                  </div>
                  <p className="text-[15px] font-medium text-indigo-100">
                    {you.total} of {you.max} checks
                    {you.allDone ? " · every track done — nice work!" : you.current ? ` · current stage: ${you.current.label} (${you.current.done}/${you.current.total})` : ""}
                  </p>
                </div>
                <Button asChild className="bg-white text-indigo-700 hover:bg-indigo-50">
                  <Link
                    href={
                      !you.current ? "/testing#roadmap" : you.current.slug === "manual-testing" ? CONTINUE[you.current.slug] : withTool(CONTINUE[you.current.slug], tool)
                    }
                  >
                    {you.allDone ? "Back to the roadmap" : "Continue"} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <p className="text-[15px] font-semibold">You&apos;re not on the board yet — pass a lesson quiz or start an assignment to join.</p>
                <Button asChild className="bg-white text-indigo-700 hover:bg-indigo-50">
                  <Link href="/testing#roadmap">
                    Open the roadmap <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </section>
        )}

        {rows.length === 0 ? (
          <section data-testid="board-empty" className="mt-8 rounded-3xl border bg-card px-6 py-16 text-center shadow-sm">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <Trophy className="h-9 w-9" />
            </span>
            <h2 className="mt-6 text-2xl font-extrabold">No one is on the board yet</h2>
            <p className="mt-2 text-muted-foreground">Pass a Manual testing quiz or an automation check to take the first position.</p>
            <Button asChild size="lg" className="mt-6 bg-indigo-700 text-white hover:bg-indigo-800">
              <Link href="/testing#roadmap">Open the roadmap</Link>
            </Button>
          </section>
        ) : (
          <section className="mt-10">
            <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
              <table data-testid="board-table" className="w-full min-w-[860px] border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground dark:bg-slate-900/50">
                    <th scope="col" className="w-16 px-4 py-3 font-bold">#</th>
                    <th scope="col" className="px-4 py-3 font-bold">Learner</th>
                    <th scope="col" className="px-4 py-3 font-bold">Total checks</th>
                    <th scope="col" className="px-4 py-3 font-bold">Tracks</th>
                    <th scope="col" className="px-4 py-3 font-bold">Current stage</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => (
                    <tr key={r.rank} data-testid="board-row" data-rank={r.rank} data-you={r.isYou} className={`border-t ${r.isYou ? "bg-indigo-50 dark:bg-indigo-950/30" : ""}`}>
                      <td className="px-4 py-3"><Rank n={r.rank} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span aria-hidden="true" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${AVATAR[(r.rank - 1) % AVATAR.length]}`}>
                            {initials(r.name)}
                          </span>
                          <span className={`text-[15px] ${r.isYou ? "font-extrabold" : "font-semibold"}`}>{r.name}{r.isYou ? " (you)" : ""}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
                            <div className={`h-full rounded-full ${r.allDone ? "bg-indigo-600" : "bg-blue-500"}`} style={{ width: `${(r.total / r.max) * 100}%` }} />
                          </div>
                          <span className="text-[13px] font-semibold text-muted-foreground">{r.total}/{r.max}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <ManualChip r={r} />
                          <AutomationChip r={r} />
                        </div>
                      </td>
                      <td className="px-4 py-3"><CurrentStage r={r} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rows.length > shown && (
              <div className="mt-6 text-center">
                <Button data-testid="board-more" variant="outline" onClick={() => setShown((n) => n + PAGE)}>Show more</Button>
              </div>
            )}
            <p className="mt-6 text-center text-[13px] text-muted-foreground">
              Ranked by total checks verified across all tracks, then by who got there first.
              <br />
              Manual testing: 4 steps (5 of 5 on each quiz) · UI automation 6 · Framework setup 5 · Page objects 6.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
