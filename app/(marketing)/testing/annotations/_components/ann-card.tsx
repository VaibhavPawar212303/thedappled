import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SignedOut, SignUpButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import type { AssignmentStatus } from "@/lib/assignments";
import { ToolBadge } from "../../_components/card-tool";
import { StartAssignmentButton } from "../../ui-automation/_components/start-assignment-button";

// Design: Penpot "26 - Testing Learning Path", page "Stage 5 – Annotations", board B (assignment card).
const POINTS = [
  "Each built-in annotation proves itself in a real run",
  "Tags and custom annotations show up in your report",
  "CI runs a @smoke subset and blocks a stray test.only",
];

export function AnnCard({ signedIn, assignment }: { signedIn: boolean; assignment: AssignmentStatus | null }) {
  const done = assignment?.done ?? 0;
  const total = assignment?.total ?? 10;
  const completed = Boolean(assignment?.completedAt);
  const pct = Math.round((done / total) * 100);

  return (
    <section data-testid="assignment-card" className="relative overflow-hidden rounded-3xl border border-purple-600 bg-card shadow-sm">
      <div className="h-2 bg-purple-600" />
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950 dark:text-purple-300">Assignment</span>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">Playwright only</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight">Annotate a real test suite</h2>
          <p className="mt-3 text-muted-foreground">
            The annotations lab has a known bug, a slow export, an unfinished feature and a button WebKit can’t use. Annotate each test, upload your JSON
            report, and push the suite.
          </p>
          <ul className="m-0 mt-6 list-none space-y-2.5 p-0 text-[15px] font-medium">
            {POINTS.map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  <Check className="h-3 w-3" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border bg-slate-50 p-6 dark:bg-slate-900/40">
          <ToolBadge tool="playwright" />
          <p className="mt-3 text-3xl font-extrabold">{total} checks</p>
          <p className="text-sm text-muted-foreground">1 lab run · 6 from your report · 3 GitHub checks</p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
            <div className="h-full rounded-full bg-purple-600 transition-all" style={{ width: `${pct}%` }} />
          </div>

          {!signedIn && (
            <>
              <p className="mt-4 text-sm font-medium text-muted-foreground">Create a free account to take it.</p>
              <SignedOut>
                <SignUpButton mode="modal">
                  <Button data-testid="assignment-signup" size="lg" className="mt-4 h-12 w-full bg-purple-600 text-white hover:bg-purple-700">Create free account</Button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="mt-4 w-full text-center text-[13px] font-semibold text-purple-600 hover:underline dark:text-purple-400">Already have an account? Log in</button>
                </SignInButton>
              </SignedOut>
            </>
          )}

          {signedIn && !assignment && (
            <>
              <p className="mt-4 text-sm font-medium text-muted-foreground">Not started — 0 of {total} done</p>
              <div className="mt-4">
                <StartAssignmentButton slug="annotations" tool="playwright" label="Start assignment" className="bg-purple-600 hover:bg-purple-700" />
              </div>
              <p className="mt-3 text-center text-[13px] text-muted-foreground">Takes about 45–60 minutes</p>
            </>
          )}

          {signedIn && assignment && (
            <>
              <p data-testid="assignment-progress-text" className="mt-4 text-sm font-medium text-muted-foreground">
                {completed ? "Completed ✓" : `In progress — ${done} of ${total} done`}
              </p>
              <Button asChild size="lg" className="mt-4 h-12 w-full bg-purple-600 text-white hover:bg-purple-700">
                <Link href="/testing/annotations/assignment" data-testid="assignment-continue">
                  {completed ? "View results" : "Continue assignment"} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}

          <Link href="/testing/leaderboard?stage=annotations&tool=playwright" data-testid="card-leaderboard" className="mt-4 block text-center text-[13px] font-bold text-purple-600 hover:underline dark:text-purple-400">
            View Playwright leaderboard →
          </Link>
        </div>
      </div>
    </section>
  );
}
