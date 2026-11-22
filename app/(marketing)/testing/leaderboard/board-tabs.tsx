import Link from "next/link";
import type { AssignmentSlug } from "@/lib/assignments";

export type BoardId = "all" | AssignmentSlug;

// Board order on the leaderboard: the combined board first, then the tracks in learning order.
export const BOARDS: { id: BoardId; label: string }[] = [
  { id: "all", label: "All tracks" },
  { id: "manual-testing", label: "Manual testing" },
  { id: "ui-automation", label: "UI automation" },
  { id: "framework-setup", label: "Framework setup" },
  { id: "page-objects", label: "Page objects" },
];

export const boardHref = (id: BoardId) => (id === "all" ? "/testing/leaderboard" : `/testing/leaderboard?stage=${id}`);

export function BoardTabs({ current }: { current: BoardId }) {
  return (
    <div role="navigation" aria-label="Choose a board" className="mt-6 flex flex-wrap items-center gap-3">
      <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Board</span>
      {BOARDS.map((b) => (
        <Link
          key={b.id}
          href={boardHref(b.id)}
          data-testid={`stage-${b.id}`}
          aria-current={b.id === current ? "page" : undefined}
          className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
            b.id === current
              ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
              : "bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          {b.label}
        </Link>
      ))}
    </div>
  );
}
