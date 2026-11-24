import type { AssignmentStatus } from "@/lib/assignments";
import { otherTool, TOOL_LABEL, withTool, type Tool } from "@/lib/tools";
import { SwitchToolLink, ToolSwitch } from "./tool-switch";

// Pieces shared by the four automation stage cards. Each tool is its own assignment, so the card
// shows the chosen tool's progress and a one-line status for the other tool.

export function completedTools(tool: Tool, mine: AssignmentStatus | null, other: AssignmentStatus | null): Tool[] {
  return [mine?.completedAt ? tool : null, other?.completedAt ? otherTool(tool) : null].filter((t): t is Tool => t !== null);
}

export function CardToolPicker({ path, tool, completed }: { path: string; tool: Tool; completed: Tool[] }) {
  return (
    <div className="mt-5">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Choose your tool</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
        <ToolSwitch current={tool} hrefs={{ playwright: withTool(path, "playwright"), cypress: withTool(path, "cypress") }} completed={completed} />
        <span className="text-[13px] text-muted-foreground">Each tool is a separate assignment with its own leaderboard.</span>
      </div>
    </div>
  );
}

export function ToolBadge({ tool, label }: { tool: Tool; label?: string }) {
  return (
    <span data-testid="tool-badge" data-tool={tool} className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900">
      {label ?? TOOL_LABEL[tool]}
    </span>
  );
}

// Assignment page header: which track this is, and a way to the other tool's assignment for this stage.
export function TrackLine({ slug, tool }: { slug: string; tool: Tool }) {
  const t = otherTool(tool);
  return (
    <>
      <ToolBadge tool={tool} label={`${TOOL_LABEL[tool]} track`} />
      <SwitchToolLink
        href={`/testing/${slug}/assignment?tool=${t}`}
        tool={t}
        className="text-sm font-bold text-blue-600 hover:underline"
      >
        Switch to {TOOL_LABEL[t]} →
      </SwitchToolLink>
    </>
  );
}

export function OtherToolStatus({ tool, other }: { tool: Tool; other: AssignmentStatus | null }) {
  const t = otherTool(tool);
  const text = !other ? "Not started" : other.completedAt ? "Completed ✓" : `In progress — ${other.done} of ${other.total}`;
  return (
    <div data-testid="other-tool-status" className="mt-5 border-t pt-4 text-[13px]">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Other tool</p>
      <p className="mt-1">
        {TOOL_LABEL[t]} · <span className={other?.completedAt ? "font-bold text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}>{text}</span>
      </p>
    </div>
  );
}
