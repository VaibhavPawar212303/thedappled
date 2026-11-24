import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SignedOut, SignUpButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import type { AssignmentStatus } from "@/lib/assignments";
import { TOOL_LABEL, withTool, type Tool } from "@/lib/tools";
import { CardToolPicker, completedTools, OtherToolStatus, ToolBadge } from "../../_components/card-tool";
import { StartAssignmentButton } from "../../ui-automation/_components/start-assignment-button";

const POINTS = [
  "The same spec passes on Chromium, Firefox and WebKit",
  "Config defines one project per browser (Cypress: --browser runs)",
  "GitHub Actions runs the suite on all three browsers",
];

export function XbCard({
  signedIn,
  assignment,
  tool,
  other,
}: {
  signedIn: boolean;
  assignment: AssignmentStatus | null;
  tool: Tool;
  other: AssignmentStatus | null; // the same stage on the other tool
}) {
  const done = assignment?.done ?? 0;
  const total = assignment?.total ?? 5;
  const completed = Boolean(assignment?.completedAt);
  const pct = Math.round((done / total) * 100);

  return (
    <section data-testid="assignment-card" className="relative overflow-hidden rounded-3xl border border-blue-600 bg-card shadow-sm">
      <div className="h-2 bg-blue-600" />
      <div className="grid gap-8 p-8 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">Assignment</span>
          <CardToolPicker path="/testing/cross-browser" tool={tool} completed={completedTools(tool, assignment, other)} />
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight">One spec, three browsers</h2>
          <p className="mt-3 text-muted-foreground">
            Run your stage 3 checkout spec against the demo shop on Chromium, Firefox and WebKit. Each engine is detected and
            ticked off separately.
          </p>
          <ul className="m-0 mt-6 list-none space-y-2.5 p-0 text-[15px] font-medium">
            {POINTS.map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <Check className="h-3 w-3" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border bg-slate-50 p-6 dark:bg-slate-900/40">
          <ToolBadge tool={tool} />
          <p className="mt-3 text-3xl font-extrabold">{total} checks</p>
          <p className="text-sm text-muted-foreground">3 browser runs · 2 GitHub checks</p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
            <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${pct}%` }} />
          </div>

          {!signedIn && (
            <>
              <p className="mt-4 text-sm font-medium text-muted-foreground">Create a free account to take it.</p>
              <SignedOut>
                <SignUpButton mode="modal">
                  <Button data-testid="assignment-signup" size="lg" className="mt-4 h-12 w-full bg-blue-600 text-white hover:bg-blue-700">Create free account</Button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="mt-4 w-full text-center text-[13px] font-semibold text-blue-600 hover:underline">Already have an account? Log in</button>
                </SignInButton>
              </SignedOut>
            </>
          )}

          {signedIn && !assignment && (
            <>
              <p className="mt-4 text-sm font-medium text-muted-foreground">Not started — 0 of {total} done</p>
              <div className="mt-4"><StartAssignmentButton slug="cross-browser" tool={tool} className="bg-blue-600 hover:bg-blue-700" /></div>
              <p className="mt-3 text-center text-[13px] text-muted-foreground">Takes about 45–60 minutes</p>
            </>
          )}

          {signedIn && assignment && (
            <>
              <p data-testid="assignment-progress-text" className="mt-4 text-sm font-medium text-muted-foreground">
                {completed ? "Completed ✓" : `In progress — ${done} of ${total} done`}
              </p>
              <Button asChild size="lg" className="mt-4 h-12 w-full bg-blue-600 text-white hover:bg-blue-700">
                <Link href={withTool("/testing/cross-browser/assignment", tool)} data-testid="assignment-continue">
                  {completed ? "View results" : `Continue ${TOOL_LABEL[tool]} assignment`} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}

          <Link href={withTool("/testing/leaderboard?stage=cross-browser", tool)} data-testid="card-leaderboard" className="mt-4 block text-center text-[13px] font-bold text-blue-600 hover:underline">
            View {TOOL_LABEL[tool]} leaderboard →
          </Link>
          {signedIn && <OtherToolStatus tool={tool} other={other} />}
        </div>
      </div>
    </section>
  );
}
