import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SignedOut, SignUpButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import type { AssignmentStatus } from "@/lib/assignments";
import { StartAssignmentButton } from "./start-assignment-button";

export function AssignmentCard({ signedIn, assignment }: { signedIn: boolean; assignment: AssignmentStatus | null }) {
  const done = assignment?.done ?? 0;
  const total = assignment?.total ?? 6;
  const completed = Boolean(assignment?.completedAt);
  const pct = Math.round((done / total) * 100);

  return (
    <section
      data-testid="assignment-card"
      className="relative overflow-hidden rounded-3xl border border-emerald-500 bg-card shadow-sm"
    >
      <div className="h-2 bg-emerald-500" />
      <div className="grid gap-8 p-8 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            Assignment
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight">Automate sign in and sign up</h2>
          <p className="mt-3 text-muted-foreground">
            Write a Playwright or Cypress script that passes 6 checks on the demo pages. Your progress is recorded
            automatically while your script runs.
          </p>
          <ul className="m-0 mt-6 list-none space-y-2.5 p-0 text-[15px] font-medium">
            {["Sign in: empty form, wrong password, valid login", "Sign up: empty form, password mismatch, valid sign up"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <Check className="h-3 w-3" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border bg-slate-50 p-6 dark:bg-slate-900/40">
          <p className="text-3xl font-extrabold">{total} checks</p>
          <p className="text-sm text-muted-foreground">to complete the assignment</p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
          </div>

          {!signedIn && (
            <>
              <p className="mt-4 text-sm font-medium text-muted-foreground">Create a free account to take it.</p>
              <SignedOut>
                <SignUpButton mode="modal">
                  <Button data-testid="assignment-signup" size="lg" className="mt-4 h-12 w-full bg-emerald-600 text-white hover:bg-emerald-700">
                    Create free account
                  </Button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="mt-4 w-full text-center text-[13px] font-semibold text-blue-600 hover:underline">
                    Already have an account? Log in
                  </button>
                </SignInButton>
              </SignedOut>
            </>
          )}

          {signedIn && !assignment && (
            <>
              <p className="mt-4 text-sm font-medium text-muted-foreground">Not started — 0 of {total} done</p>
              <div className="mt-4">
                <StartAssignmentButton />
              </div>
              <p className="mt-3 text-center text-[13px] text-muted-foreground">Takes about 30–45 minutes</p>
            </>
          )}

          {signedIn && assignment && (
            <>
              <p data-testid="assignment-progress-text" className="mt-4 text-sm font-medium text-muted-foreground">
                {completed ? "Completed ✓" : `In progress — ${done} of ${total} done`}
              </p>
              <Button asChild size="lg" className="mt-4 h-12 w-full bg-emerald-600 text-white hover:bg-emerald-700">
                <Link href="/testing/ui-automation/assignment" data-testid="assignment-continue">
                  {completed ? "View results" : "Continue assignment"} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}

          <Link href="/testing/leaderboard?stage=ui-automation" data-testid="card-leaderboard" className="mt-4 block text-center text-[13px] font-bold text-blue-600 hover:underline">
            View leaderboard →
          </Link>
        </div>
      </div>
    </section>
  );
}
