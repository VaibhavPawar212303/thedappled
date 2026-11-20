import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SignedOut, SignUpButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import type { AssignmentStatus } from "@/lib/assignments";
import { StartAssignmentButton } from "../../ui-automation/_components/start-assignment-button";

export function FrameworkCard({ signedIn, assignment }: { signedIn: boolean; assignment: AssignmentStatus | null }) {
  const done = assignment?.done ?? 0;
  const total = assignment?.total ?? 5;
  const completed = Boolean(assignment?.completedAt);
  const pct = Math.round((done / total) * 100);

  return (
    <section data-testid="assignment-card" className="relative overflow-hidden rounded-3xl border border-purple-500 bg-card shadow-sm">
      <div className="h-2 bg-purple-600" />
      <div className="grid gap-8 p-8 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950 dark:text-purple-300">Assignment</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight">Build the framework, keep secrets out of git</h2>
          <p className="mt-3 text-muted-foreground">
            Put your base URL and demo login in <code>.env</code>, read them in your tests, then push the project to GitHub
            with the values stored as repository secrets.
          </p>
          <ul className="m-0 mt-6 list-none space-y-2.5 p-0 text-[15px] font-medium">
            {["Tests sign in using values from .env", ".env is git-ignored; .env.example is committed", "GitHub Actions run uses repository secrets"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  <Check className="h-3 w-3" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border bg-slate-50 p-6 dark:bg-slate-900/40">
          <p className="text-3xl font-extrabold">{total} checks</p>
          <p className="text-sm text-muted-foreground">2 test runs · 3 GitHub checks</p>
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
                  <button className="mt-4 w-full text-center text-[13px] font-semibold text-blue-600 hover:underline">Already have an account? Log in</button>
                </SignInButton>
              </SignedOut>
            </>
          )}

          {signedIn && !assignment && (
            <>
              <p className="mt-4 text-sm font-medium text-muted-foreground">Not started — 0 of {total} done</p>
              <div className="mt-4"><StartAssignmentButton slug="framework-setup" className="bg-purple-600 hover:bg-purple-700" /></div>
              <p className="mt-3 text-center text-[13px] text-muted-foreground">Takes about 45–60 minutes</p>
            </>
          )}

          {signedIn && assignment && (
            <>
              <p data-testid="assignment-progress-text" className="mt-4 text-sm font-medium text-muted-foreground">
                {completed ? "Completed ✓" : `In progress — ${done} of ${total} done`}
              </p>
              <Button asChild size="lg" className="mt-4 h-12 w-full bg-purple-600 text-white hover:bg-purple-700">
                <Link href="/testing/framework-setup/assignment" data-testid="assignment-continue">
                  {completed ? "View results" : "Continue assignment"} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}

          <Link href="/testing/leaderboard?stage=framework-setup" data-testid="card-leaderboard" className="mt-4 block text-center text-[13px] font-bold text-blue-600 hover:underline">
            View leaderboard →
          </Link>
        </div>
      </div>
    </section>
  );
}
