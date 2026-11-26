import Link from "next/link";
import type { AssignmentSlug } from "@/lib/assignments";
import { withTool, type Tool } from "@/lib/tools";
import { ToolSwitch } from "../_components/tool-switch";

export type BoardId = "all" | AssignmentSlug;

// Board order on the leaderboard: the combined board first, then the tracks in learning order.
export const BOARDS: { id: BoardId; label: string }[] = [
  { id: "all", label: "All tracks" },
  { id: "manual-testing", label: "Manual testing" },
  { id: "ui-automation", label: "UI automation" },
  { id: "framework-setup", label: "Framework setup" },
  { id: "page-objects", label: "Page objects" },
  { id: "cross-browser", label: "Cross-browser" },
  { id: "annotations", label: "Annotations" },
];

// Every board link keeps the chosen tool, so switching boards stays on Playwright or Cypress.
export const boardHref = (id: BoardId, tool: Tool) => withTool(id === "all" ? "/testing/leaderboard" : `/testing/leaderboard?stage=${id}`, tool);

export function BoardTabs({ current, tool }: { current: BoardId; tool: Tool }) {
  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Tool</span>
        <ToolSwitch current={tool} hrefs={{ playwright: boardHref(current, "playwright"), cypress: boardHref(current, "cypress") }} size="sm" />
        <span data-testid="tool-note" className="text-[13px] text-muted-foreground">
          {current === "manual-testing" ? "Manual testing has one board for both tools." : current === "annotations" ? "Annotations is a Playwright-only stage." : "Playwright and Cypress are ranked separately."}
        </span>
      </div>
      <div role="navigation" aria-label="Choose a board" className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Board</span>
        {BOARDS.map((b) => (
          <Link
            key={b.id}
            href={boardHref(b.id, tool)}
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
    </>
  );
}
