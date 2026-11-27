"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAssignmentReporter } from "../../ui-automation/_components/assignment-reporter";

// Design: Penpot "26 - Testing Learning Path", page "Stage 7 – Advanced fixtures", board D.
// Each panel needs a kind of fixture in the learner's tests:
//   Account → a worker-scoped fixture: one account per worker (sign-ups live in this browser session)
//   Store   → an option fixture: ?currency=USD|EUR|GBP|INR changes every price
//   Console → an automatic fixture: the page logs to the browser console on every load, to attach to each test

const RATES: Record<string, { symbol: string; rate: number }> = {
  USD: { symbol: "$", rate: 1 },
  EUR: { symbol: "€", rate: 0.92 },
  GBP: { symbol: "£", rate: 0.79 },
  INR: { symbol: "₹", rate: 83 },
};
const BOOKS = [
  { id: "clean-code", title: "Clean Code", usd: 34.8 },
  { id: "refactoring", title: "Refactoring", usd: 45.1 },
  { id: "testing-js", title: "Testing JavaScript", usd: 30.3 },
];
const ACCOUNTS_KEY = "fixtures-lab-accounts";
const SIGNED_IN_KEY = "fixtures-lab-signed-in";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readSession<T>(key: string, fallback: T): T {
  try {
    const v = sessionStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeSession(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function Panel({ title, tag, tone, testid, children, className = "" }: { title: string; tag: string; tone: string; testid: string; children: React.ReactNode; className?: string }) {
  return (
    <section data-testid={testid} className={`min-w-0 rounded-2xl border bg-card p-6 shadow-sm sm:p-7 ${className}`}>
      <h2 className="text-lg font-extrabold">{title}</h2>
      <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{tag}</span>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function FixturesLab() {
  const params = useSearchParams();
  const { token, report } = useAssignmentReporter();
  const raw = (params.get("currency") ?? "").toUpperCase();
  const currency = RATES[raw] ? raw : "USD";
  const { symbol, rate } = RATES[currency];

  const [email, setEmail] = React.useState("");
  const [signedIn, setSignedIn] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => setSignedIn(readSession<string | null>(SIGNED_IN_KEY, null)), []);

  // The console the auto fixture should capture, written on every load.
  React.useEffect(() => {
    console.info(`[info] store loaded: ${BOOKS.length} books`);
    if (!RATES[raw]) console.warn("[warn] currency not set, using USD");
    console.error("[error] recommendations service timed out");
  }, [raw]);

  // Each page load by the learner's tests counts as a lab visit (the server decides whether it was automated).
  React.useEffect(() => {
    if (!token) return;
    const id = setTimeout(() => report("fx-lab"), 400);
    return () => clearTimeout(id);
  }, [token, report]);

  const signUp = (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim().toLowerCase();
    if (!EMAIL_RE.test(v)) {
      setError("Enter an email address, like worker-0@lab.test.");
      return;
    }
    const accounts = readSession<string[]>(ACCOUNTS_KEY, []);
    if (!accounts.includes(v)) writeSession(ACCOUNTS_KEY, [...accounts, v]);
    writeSession(SIGNED_IN_KEY, v);
    setSignedIn(v);
    setError(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Book store</h1>
      <p className="mt-2 text-muted-foreground">The fixtures lab: accounts per worker, prices per currency, a console to capture.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Panel testid="panel-account" title="Account" tag="Worker fixture → one account per worker" tone="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          <form className="flex flex-wrap gap-3" onSubmit={signUp}>
            <label htmlFor="signup-email" className="sr-only">Email</label>
            <input
              id="signup-email"
              data-testid="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="worker-0@lab.test"
              className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            />
            <Button type="submit" data-testid="signup-submit" className="h-10 bg-blue-600 px-5 text-white hover:bg-blue-700">Sign up</Button>
          </form>
          {error && <p data-testid="signup-error" role="alert" className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
          <p className="mt-5 text-sm">
            {signedIn ? (
              <>Signed in as <strong data-testid="signed-in-as" className="font-mono">{signedIn}</strong></>
            ) : (
              <span data-testid="signed-out" className="text-muted-foreground">Not signed in.</span>
            )}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Accounts live for this browser session only.</p>
        </Panel>

        <Panel testid="panel-store" title="Store" tag="Option fixture → ?currency=EUR" tone="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <p className="text-sm text-muted-foreground">
            Prices in <strong data-testid="store-currency" className="font-mono text-foreground">{currency}</strong>
          </p>
          <ul className="m-0 mt-3 list-none space-y-2 p-0">
            {BOOKS.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 rounded-xl border bg-background px-4 py-2.5">
                <span className="text-sm font-semibold">{b.title}</span>
                <span data-testid={`price-${b.id}`} className="font-mono text-sm font-bold tabular-nums">
                  {symbol}
                  {(b.usd * rate).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel testid="panel-console" title="Console" tag="Auto fixture → attach these logs to every test" tone="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" className="md:col-span-2">
          <pre className="m-0 overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-xs leading-6 text-slate-100">
            <span className="block">[info] store loaded: {BOOKS.length} books</span>
            {!RATES[raw] && <span className="block text-amber-300">[warn] currency not set, using USD</span>}
            <span className="block text-red-300">[error] recommendations service timed out</span>
          </pre>
          <p className="mt-3 text-xs text-muted-foreground">The page writes these to the browser console on every load. Listen with page.on(&apos;console&apos;) in a fixture.</p>
        </Panel>
      </div>
    </div>
  );
}
