"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMinutes } from "@/lib/leaderboard-utils";
import type { Board, BoardRow } from "@/lib/leaderboard";
import type { AssignmentSlug } from "@/lib/assignments";

type Tab = "all" | "completed" | "progress";

// Per-stage copy, links and accent colour (green for UI automation and Page objects, purple for Framework setup).
const STAGES = {
  "ui-automation": {
    label: "UI automation",
    href: "/testing/ui-automation",
    sub: "See how learners are doing on the UI automation assignment.",
    startText: "Complete the UI automation assignment to take the first position.",
    checks: 6,
    blob: "bg-emerald-200/50 dark:bg-emerald-900/20",
    live: "text-emerald-700 dark:text-emerald-400",
    icon: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    solid: "bg-emerald-600 text-white hover:bg-emerald-700",
    border: "border-emerald-500",
    bar: "bg-emerald-500",
    strong: "text-emerald-700 dark:text-emerald-400",
    banner: "bg-emerald-700",
    bannerLabel: "text-emerald-200",
    bannerText: "text-emerald-100",
    bannerBtn: "bg-white text-emerald-700 hover:bg-emerald-50",
    row: "bg-emerald-50 dark:bg-emerald-950/30",
    pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    tab: "border-emerald-500",
  },
  "framework-setup": {
    label: "Framework setup",
    href: "/testing/framework-setup",
    sub: "See how learners are doing on the Framework setup assignment.",
    startText: "Complete the Framework setup assignment to take the first position.",
    checks: 5,
    blob: "bg-purple-200/60 dark:bg-purple-900/20",
    live: "text-purple-700 dark:text-purple-300",
    icon: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    solid: "bg-purple-600 text-white hover:bg-purple-700",
    border: "border-purple-500",
    bar: "bg-purple-500",
    strong: "text-purple-700 dark:text-purple-300",
    banner: "bg-purple-700",
    bannerLabel: "text-purple-200",
    bannerText: "text-purple-100",
    bannerBtn: "bg-white text-purple-700 hover:bg-purple-50",
    row: "bg-purple-50 dark:bg-purple-950/30",
    pill: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    tab: "border-purple-500",
  },
  "page-objects": {
    label: "Page objects",
    href: "/testing/page-objects",
    sub: "See how learners are doing on the Page objects & fixtures assignment.",
    startText: "Complete the Page objects assignment to take the first position.",
    checks: 6,
    blob: "bg-emerald-200/50 dark:bg-emerald-900/20",
    live: "text-emerald-700 dark:text-emerald-400",
    icon: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    solid: "bg-emerald-600 text-white hover:bg-emerald-700",
    border: "border-emerald-500",
    bar: "bg-emerald-500",
    strong: "text-emerald-700 dark:text-emerald-400",
    banner: "bg-emerald-700",
    bannerLabel: "text-emerald-200",
    bannerText: "text-emerald-100",
    bannerBtn: "bg-white text-emerald-700 hover:bg-emerald-50",
    row: "bg-emerald-50 dark:bg-emerald-950/30",
    pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    tab: "border-emerald-500",
  },
} as const;
const PAGE = 10;

const MEDAL = ["bg-amber-500", "bg-slate-400", "bg-orange-700"];
const AVATAR = [
  "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200",
  "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200",
];

function initials(name: string) {
  const parts = name.replace(/\./g, "").split(" ").filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)).toUpperCase();
}

function Avatar({ name, i, size = "h-9 w-9 text-xs" }: { name: string; i: number; size?: string }) {
  return (
    <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-full font-bold ${size} ${AVATAR[i % AVATAR.length]}`}>
      {initials(name)}
    </span>
  );
}

function Rank({ n }: { n: number }) {
  return n <= 3 ? (
    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold text-white ${MEDAL[n - 1]}`}>{n}</span>
  ) : (
    <span className="w-7 text-center text-sm font-bold text-muted-foreground">{n}</span>
  );
}

export function LeaderboardView({ stage, board, signedIn, hasAssignment }: { stage: AssignmentSlug; board: Board; signedIn: boolean; hasAssignment: boolean }) {
  const st = STAGES[stage];
  const router = useRouter();
  const [tab, setTab] = React.useState<Tab>("all");
  const [shown, setShown] = React.useState(PAGE);

  React.useEffect(() => {
    setTab("all");
    setShown(PAGE);
  }, [stage]);

  // Keep the board live: refresh the server data every 30s while the tab is visible.
  React.useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 30000);
    return () => clearInterval(id);
  }, [router]);

  const rows = board.rows;
  const filtered = rows.filter((r) => (tab === "all" ? true : tab === "completed" ? r.completed : !r.completed));
  const visible = filtered.slice(0, shown);
  const podium = rows.filter((r) => r.completed).slice(0, 3);
  const you = rows.find((r) => r.isYou);
  const total = rows[0]?.total ?? st.checks;

  const stats: [string, string, string][] = [
    [String(board.learners), "Learners", ""],
    [String(board.completed), "Completed", st.strong],
    [String(board.inProgress), "In progress", "text-amber-700 dark:text-amber-400"],
    [formatMinutes(board.fastestMinutes), "Fastest finish", "text-blue-600 dark:text-blue-400"],
  ];

  const tabs: [Tab, string][] = [
    ["all", `All learners (${rows.length})`],
    ["completed", `Completed (${board.completed})`],
    ["progress", `In progress (${board.inProgress})`],
  ];

  return (
    <div className="bg-background text-foreground">
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900/40">
        <div className={`pointer-events-none absolute -right-10 top-16 h-56 w-56 rounded-full blur-2xl ${st.blob}`} />
        <div className="relative mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-12">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link href="/testing" className="hover:text-foreground">Testing</Link>
            <span aria-hidden="true">/</span>
            <Link href={st.href} className="hover:text-foreground">{st.label}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="font-semibold text-foreground">Leaderboard</span>
          </nav>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight md:text-5xl">Leaderboard</h1>
          <p className="mt-3 text-lg text-muted-foreground">{st.sub}</p>
          <p className={`mt-4 text-[13px] font-semibold ${st.live}`}>● Live · updates as learners complete checks</p>
          <div role="navigation" aria-label="Choose a stage" className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Stage</span>
            {(Object.keys(STAGES) as AssignmentSlug[]).map((id) => (
              <Link
                key={id}
                href={id === "ui-automation" ? "/testing/leaderboard" : `/testing/leaderboard?stage=${id}`}
                data-testid={`stage-${id}`}
                aria-current={id === stage ? "page" : undefined}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${id === stage ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900" : "bg-card text-muted-foreground hover:text-foreground"}`}
              >
                {STAGES[id].label}
              </Link>
            ))}
          </div>
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

        {rows.length === 0 ? (
          <section data-testid="board-empty" className="mt-8 rounded-3xl border bg-card px-6 py-16 text-center shadow-sm">
            <span className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${st.icon}`}>
              <Trophy className="h-9 w-9" />
            </span>
            <h2 className="mt-6 text-2xl font-extrabold">No one is on the board yet</h2>
            <p className="mt-2 text-muted-foreground">{st.startText}</p>
            <Button asChild size="lg" className={`mt-6 ${st.solid}`}>
              <Link href={st.href}>Start the assignment</Link>
            </Button>
          </section>
        ) : (
          <>
            {podium.length > 0 && (
              <section aria-label="Top finishers" className="mt-10">
                <h2 className="text-xl font-extrabold">Top {podium.length}</h2>
                <ol data-testid="board-podium" className="m-0 mt-4 grid list-none gap-4 p-0 md:grid-cols-3 md:items-end">
                  {[podium[1], podium[0], podium[2]].map((r, k) => {
                    if (!r) return <li key={`empty-${k}`} className="hidden md:block" />;
                    const first = r.rank === 1;
                    return (
                      <li key={r.rank} className={`order-${first ? "first" : "none"} md:order-none rounded-2xl border bg-card p-6 shadow-sm ${first ? `${st.border} md:pb-10` : ""}`}>
                        <div className="flex items-center gap-3">
                          <Rank n={r.rank} />
                          <Avatar name={r.name} i={r.rank} size="h-12 w-12 text-sm" />
                          <div className="min-w-0">
                            <p className="truncate text-lg font-extrabold">{r.name}{r.isYou ? " (you)" : ""}</p>
                            <p className="text-[13px] text-muted-foreground">Completed all {r.total} checks</p>
                          </div>
                        </div>
                        <div className={`mt-5 h-2 rounded-full ${st.bar}`} aria-hidden="true" />
                        <p className={`mt-4 text-3xl font-extrabold ${st.strong}`}>{formatMinutes(r.minutes)}</p>
                        <p className="text-[13px] text-muted-foreground">time to finish</p>
                      </li>
                    );
                  })}
                </ol>
              </section>
            )}
          </>
        )}

        {signedIn && rows.length > 0 && (
          <section data-testid="board-you" className={`mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-5 text-white ${st.banner}`}>
            {you ? (
              <>
                <div className="flex flex-wrap items-center gap-x-8 gap-y-1">
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wide ${st.bannerLabel}`}>Your position</p>
                    <p className="text-2xl font-extrabold">#{you.rank} of {board.learners}</p>
                  </div>
                  <p className={`text-[15px] font-medium ${st.bannerText}`}>
                    {you.completed
                      ? `Finished in ${formatMinutes(you.minutes)} — nice work!`
                      : `${you.done} of ${you.total} checks done · keep going to climb the board`}
                  </p>
                </div>
                <Button asChild className={st.bannerBtn}>
                  <Link href={`${st.href}/assignment`}>{you.completed ? "View results" : "Continue assignment"}</Link>
                </Button>
              </>
            ) : (
              <>
                <p className="text-[15px] font-semibold">
                  {hasAssignment ? "You’re on the board once your first check passes." : "You’re not on the board yet — start the assignment to join."}
                </p>
                <Button asChild className={st.bannerBtn}>
                  <Link href={st.href}>{hasAssignment ? "Open assignment" : "Start the assignment"} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </>
            )}
          </section>
        )}

        {rows.length > 0 && (
          <section className="mt-10">
            <div role="tablist" aria-label="Filter learners" className="flex gap-6 border-b">
              {tabs.map(([id, label]) => (
                <button
                  key={id}
                  role="tab"
                  id={`board-tab-${id}`}
                  aria-selected={tab === id}
                  data-testid={`board-tab-${id}`}
                  onClick={() => { setTab(id); setShown(PAGE); }}
                  className={`-mb-px border-b-[3px] pb-3 text-[15px] font-bold transition ${tab === id ? `${st.tab} text-foreground` : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border bg-card shadow-sm">
              <table data-testid="board-table" className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground dark:bg-slate-900/50">
                    <th scope="col" className="w-16 px-4 py-3 font-bold">#</th>
                    <th scope="col" className="px-4 py-3 font-bold">Learner</th>
                    <th scope="col" className="px-4 py-3 font-bold">Progress</th>
                    <th scope="col" className="px-4 py-3 font-bold">Status</th>
                    <th scope="col" className="px-4 py-3 text-right font-bold">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r: BoardRow) => (
                    <tr key={r.rank} data-testid="board-row" data-rank={r.rank} data-you={r.isYou} className={`border-t ${r.isYou ? st.row : ""}`}>
                      <td className="px-4 py-3"><Rank n={r.rank} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={r.name} i={r.rank - 1} />
                          <span className={`text-[15px] ${r.isYou ? "font-extrabold" : "font-semibold"}`}>{r.name}{r.isYou ? " (you)" : ""}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
                            <div className={`h-full rounded-full ${r.completed ? st.bar : "bg-blue-500"}`} style={{ width: `${(r.done / r.total) * 100}%` }} />
                          </div>
                          <span className="text-[13px] font-semibold text-muted-foreground">{r.done}/{r.total}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${r.completed ? st.pill : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"}`}>
                          {r.completed ? "Completed" : "In progress"}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-right text-[15px] ${r.completed ? "font-bold" : "text-muted-foreground"}`}>{formatMinutes(r.minutes)}</td>
                    </tr>
                  ))}
                  {visible.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No learners here yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {filtered.length > shown && (
              <div className="mt-6 text-center">
                <Button data-testid="board-more" variant="outline" onClick={() => setShown((n) => n + PAGE)}>Show more</Button>
              </div>
            )}
            <p className="mt-6 text-center text-[13px] text-muted-foreground">
              Names come from each learner’s profile. Ranked by time to finish, then by checks completed (out of {total}).
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
