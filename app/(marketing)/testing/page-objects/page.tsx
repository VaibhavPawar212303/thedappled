import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getAssignmentForUser, PAGE_OBJECTS } from "@/lib/assignments";
import { PomCard } from "./_components/pom-card";

export const metadata: Metadata = {
  title: "Page Objects & Fixtures – structure Playwright & Cypress tests",
  description:
    "Structure your Playwright or Cypress tests the way teams do: locators in page classes, setup in fixtures, and specs that read like plain steps. Practise on a 3-screen demo shop.",
  alternates: { canonical: "/testing/page-objects" },
};

export const dynamic = "force-dynamic";

const STEPS = [
  { h: "1. Model the pages", d: "Write LoginPage, ProductsPage and CartPage classes in a pages/ folder. Locators and actions live there — nowhere else." },
  { h: "2. Wire up fixtures", d: "Extend the test runner so every test gets ready-made page objects (and a signed-in page) without repeating setup." },
  { h: "3. Run it and push", d: "Run the checkout spec against the demo shop, push the project to GitHub and paste the repo URL so we can check the structure." },
];

export default async function PageObjectsPage() {
  const { userId } = await auth();
  const assignment = userId ? await getAssignmentForUser(userId, PAGE_OBJECTS).catch(() => null) : null;

  return (
    <div className="bg-background text-foreground">
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900/40">
        <div className="pointer-events-none absolute -right-16 top-24 h-72 w-72 rounded-full bg-emerald-200/60 blur-2xl dark:bg-emerald-900/20" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/testing" className="hover:text-foreground">Testing</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="font-semibold text-foreground">Page objects &amp; fixtures</span>
          </nav>
          <span className="mt-5 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Stage 3 · Intermediate</span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Page objects &amp; fixtures</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Structure your Playwright or Cypress tests the way teams do: locators live in page classes, setup lives in fixtures, and specs read like plain steps.
          </p>
          <p className="mt-6 text-sm font-medium text-muted-foreground">What you will practise: Page Object Model · fixtures · test.extend / custom commands · reuse · readable specs</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-12 md:px-8">
        <PomCard signedIn={Boolean(userId)} assignment={assignment} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <div className="rounded-2xl border bg-slate-50 p-8 dark:bg-slate-900/40">
          <h2 className="text-xl font-extrabold">How the assignment works</h2>
          <div className="mt-5 grid gap-6 md:grid-cols-3">
            {STEPS.map((t) => (
              <div key={t.h}>
                <h3 className="text-[15px] font-bold text-emerald-700 dark:text-emerald-300">{t.h}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
