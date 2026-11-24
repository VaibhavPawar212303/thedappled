import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SignedOut, SignUpButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import type { AssignmentStatus } from "@/lib/assignments";
import { TOOL_LABEL, withTool, type Tool } from "@/lib/tools";
import { CardToolPicker, completedTools, OtherToolStatus, ToolBadge } from "../../_components/card-tool";
import { StartAssignmentButton } from "../../ui-automation/_components/start-assignment-button";

const POINTS = [
  "Checkout flow passes through LoginPage, ProductsPage, CartPage",
  "A fixture (test.extend or custom commands) provides the page objects",
  "Spec files have no raw locators — only page-object calls",
];

export function PomCard({
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
  const total = assignment?.total ?? 6;
  const completed = Boolean(assignment?.completedAt);
  const pct = Math.round((done / total) * 100);

  return (
    <section data-testid="assignment-card" className="relative overflow-hidden rounded-3xl border border-emerald-500 bg-card shadow-sm">
      <div className="h-2 bg-emerald-600" />
      <div className="grid gap-8 p-8 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Assignment</span>
          <CardToolPicker path="/testing/page-objects" tool={tool} completed={completedTools(tool, assignment, other)} />
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight">Page objects for the demo shop</h2>
          <p className="mt-3 text-muted-foreground">
            Automate the 3-screen demo shop (sign in → products → cart) using one class per page and a fixture that hands those
            classes to your tests. Then push it to GitHub.
          </p>
          <ul className="m-0 mt-6 list-none space-y-2.5 p-0 text-[15px] font-medium">
            {POINTS.map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
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
          <p className="text-sm text-muted-foreground">3 test runs · 3 GitHub checks</p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
            <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${pct}%` }} />
          </div>

          {!signedIn && (
            <>
              <p className="mt-4 text-sm font-medium text-muted-foreground">Create a free account to take it.</p>
              <SignedOut>
                <SignUpButton mode="modal">
                  <Button data-testid="assignment-signup" size="lg" className="mt-4 h-12 w-full bg-emerald-600 text-white hover:bg-emerald-700">Create free account</Button>
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
              <div className="mt-4"><StartAssignmentButton slug="page-objects" tool={tool} /></div>
              <p className="mt-3 text-center text-[13px] text-muted-foreground">Takes about 60–90 minutes</p>
            </>
          )}

          {signedIn && assignment && (
            <>
              <p data-testid="assignment-progress-text" className="mt-4 text-sm font-medium text-muted-foreground">
                {completed ? "Completed ✓" : `In progress — ${done} of ${total} done`}
              </p>
              <Button asChild size="lg" className="mt-4 h-12 w-full bg-emerald-600 text-white hover:bg-emerald-700">
                <Link href={withTool("/testing/page-objects/assignment", tool)} data-testid="assignment-continue">
                  {completed ? "View results" : `Continue ${TOOL_LABEL[tool]} assignment`} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}

          <Link href={withTool("/testing/leaderboard?stage=page-objects", tool)} data-testid="card-leaderboard" className="mt-4 block text-center text-[13px] font-bold text-blue-600 hover:underline">
            View {TOOL_LABEL[tool]} leaderboard →
          </Link>
          {signedIn && <OtherToolStatus tool={tool} other={other} />}
        </div>
      </div>
    </section>
  );
}
