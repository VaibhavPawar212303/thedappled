import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { FRAMEWORK_SETUP, getAssignmentForUser } from "@/lib/assignments";
import { FrameworkCard } from "./_components/framework-card";

export const metadata: Metadata = {
  title: "Framework Setup – .env config and GitHub secrets for Playwright & Cypress",
  description:
    "Set up a Playwright or Cypress project the way teams do: base URL and credentials in .env, tests that read them, and the project saved on GitHub with repository secrets.",
  alternates: { canonical: "/testing/framework-setup" },
};

export const dynamic = "force-dynamic";

const STEPS = [
  { h: "1. Configure", d: "Create the project, add a .env file and read BASE_URL in your playwright.config or cypress.config." },
  { h: "2. Call it in tests", d: "Sign in to the demo page with DEMO_EMAIL and DEMO_PASSWORD from .env — never hard-code them." },
  { h: "3. Save on GitHub", d: "Ignore .env, commit .env.example, and store the values as GitHub Actions secrets used by your workflow." },
];

export default async function FrameworkSetupPage() {
  const { userId } = await auth();
  const assignment = userId ? await getAssignmentForUser(userId, FRAMEWORK_SETUP).catch(() => null) : null;

  return (
    <div className="bg-background text-foreground">
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900/40">
        <div className="pointer-events-none absolute -right-16 top-24 h-72 w-72 rounded-full bg-purple-200/60 blur-2xl dark:bg-purple-900/20" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/testing" className="hover:text-foreground">Testing</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="font-semibold text-foreground">Framework setup</span>
          </nav>
          <span className="mt-5 inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950 dark:text-purple-300">Stage 5 · Intermediate</span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Framework setup</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Set up a Playwright or Cypress project the way teams do: config and credentials in .env, saved on GitHub.
          </p>
          <p className="mt-6 text-sm font-medium text-muted-foreground">What you will practise: .env files · dotenv · config · secrets · GitHub Actions</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-12 md:px-8">
        <FrameworkCard signedIn={Boolean(userId)} assignment={assignment} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <div className="rounded-2xl border bg-slate-50 p-8 dark:bg-slate-900/40">
          <h2 className="text-xl font-extrabold">How the assignment works</h2>
          <div className="mt-5 grid gap-6 md:grid-cols-3">
            {STEPS.map((t) => (
              <div key={t.h}>
                <h3 className="text-[15px] font-bold text-purple-700 dark:text-purple-300">{t.h}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
