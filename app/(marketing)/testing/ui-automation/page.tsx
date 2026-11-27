import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, Check, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAssignmentForUser, stageNumber, UI_AUTOMATION } from "@/lib/assignments";
import { chosenTool } from "@/lib/tool-choice";
import { otherTool } from "@/lib/tools";
import { AssignmentCard } from "./_components/assignment-card";

export const metadata: Metadata = {
  title: "UI Automation Practice – Sign in & Sign up demos",
  description:
    "Practice Playwright and Cypress on two demo forms: a sign-in page and a sign-up page with validation, error and success states.",
  alternates: { canonical: "/testing/ui-automation" },
};

const CARDS = [
  {
    title: "Sign in demo",
    blurb: "A login form with validation, error messages and a success state.",
    points: ["Valid & invalid credentials", "Empty-field validation", "Show / hide password", "Remember me checkbox"],
    href: "/testing/ui-automation/login",
    cta: "Open sign in page",
    Icon: LogIn,
    chip: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300",
    dot: "bg-blue-100 dark:bg-blue-950",
    button: "bg-blue-600 hover:bg-blue-700",
    testid: "card-signin",
  },
  {
    title: "Sign up demo",
    blurb: "A registration form with password rules and field-level errors.",
    points: ["Required & format checks", "Password strength rules", "Confirm password match", "Terms checkbox & success"],
    href: "/testing/ui-automation/signup",
    cta: "Open sign up page",
    Icon: UserPlus,
    chip: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300",
    dot: "bg-emerald-100 dark:bg-emerald-950",
    button: "bg-emerald-600 hover:bg-emerald-700",
    testid: "card-signup",
  },
];

const TIPS = [
  { h: "Stable selectors", d: "Every field has a data-testid — prefer it over CSS classes." },
  { h: "Deterministic data", d: "Use demo@thedappled.com / Test@1234 for a successful sign in." },
  { h: "Nothing is stored", d: "Demo forms never send data anywhere, so you can run them in a loop." },
];

export const dynamic = "force-dynamic";

export default async function UiAutomationPage({ searchParams }: { searchParams: Promise<{ tool?: string }> }) {
  const tool = await chosenTool((await searchParams).tool);
  const { userId } = await auth();
  const [assignment, other] = userId
    ? await Promise.all([
        getAssignmentForUser(userId, UI_AUTOMATION, tool).catch(() => null),
        getAssignmentForUser(userId, UI_AUTOMATION, otherTool(tool)).catch(() => null),
      ])
    : [null, null];

  return (
    <div className="bg-background text-foreground">
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900/40">
        <div className="pointer-events-none absolute -right-16 top-24 h-72 w-72 rounded-full bg-emerald-200/50 blur-2xl dark:bg-emerald-900/20" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/testing" className="hover:text-foreground">Testing</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="font-semibold text-foreground">UI automation</span>
          </nav>
          <span className="mt-5 inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
            Stage {stageNumber(UI_AUTOMATION, tool)} · Intermediate
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">UI automation</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Practice Playwright and Cypress on real forms. Two demo pages are built for you — no setup, no backend, same results every time.
          </p>
          <p className="mt-6 text-sm font-medium text-muted-foreground">
            What you will practise: locators · waits · assertions · form validation · page objects
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-12 md:px-8">
        <AssignmentCard signedIn={Boolean(userId)} assignment={assignment} tool={tool} other={other} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <h2 className="text-2xl font-extrabold">Practice pages</h2>
        <p className="mt-1 text-muted-foreground">Free to use any time. Nothing is stored.</p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {CARDS.map(({ title, blurb, points, href, cta, Icon, chip, dot, button, testid }) => (
            <article key={title} data-testid={testid} className="flex flex-col rounded-2xl border bg-card p-8 shadow-sm transition hover:shadow-md">
              <div className="flex items-start justify-between">
                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${chip}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-muted-foreground dark:bg-slate-800">Demo page</span>
              </div>
              <h2 className="mt-6 text-2xl font-extrabold">{title}</h2>
              <p className="mt-2 text-muted-foreground">{blurb}</p>
              <ul className="m-0 mt-5 flex-1 list-none space-y-2.5 p-0">
                {points.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-[15px] font-medium">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full ${dot}`}>
                      <Check className="h-3 w-3" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <code className="text-xs text-muted-foreground">{href}</code>
                <Button asChild className={`text-white ${button}`}>
                  <Link href={href}>
                    {cta} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border bg-slate-50 p-8 dark:bg-slate-900/40">
          <h2 className="text-xl font-extrabold">Automation tips</h2>
          <div className="mt-5 grid gap-6 md:grid-cols-3">
            {TIPS.map((t) => (
              <div key={t.h}>
                <h3 className="text-[15px] font-bold text-emerald-700 dark:text-emerald-400">{t.h}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
