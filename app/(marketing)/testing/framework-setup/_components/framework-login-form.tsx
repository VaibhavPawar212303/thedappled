"use client";

import * as React from "react";
import { inputClass } from "../../ui-automation/_components/practice-layout";
import { useAssignmentReporter } from "../../ui-automation/_components/assignment-reporter";
import { AssignmentNote } from "../../ui-automation/_components/assignment-banner";

type Result = "idle" | "error" | "success" | "no-token";

// The sign-in page for the framework-setup stage. The learner's own demo email and password are
// checked on the server (they live in the learner's .env file), so a test that hard-codes the
// old public demo login cannot pass.
export function FrameworkLoginForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [result, setResult] = React.useState<Result>("idle");
  const [busy, setBusy] = React.useState(false);
  const { token, report } = useAssignmentReporter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setResult("no-token");
      return;
    }
    setBusy(true);
    let ok = false;
    try {
      const r = await fetch("/api/assignments/framework-setup/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });
      ok = r.ok && Boolean((await r.json()).ok);
    } catch {}
    setBusy(false);
    setResult(ok ? "success" : "error");
    report(ok ? "env-login" : "env-login-wrong");
  };

  return (
    <form onSubmit={onSubmit} noValidate data-testid="env-login-form">
      <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
        Your personal login
      </span>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Sign in</h1>
      <p className="mt-2 text-muted-foreground">Use the DEMO_EMAIL and DEMO_PASSWORD from your .env file.</p>

      <div className="mt-6">
        <label htmlFor="env-email" className="text-sm font-semibold">Email</label>
        <input id="env-email" data-testid="env-email" type="email" autoComplete="off" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
      </div>
      <div className="mt-5">
        <label htmlFor="env-password" className="text-sm font-semibold">Password</label>
        <input id="env-password" data-testid="env-password" type="password" autoComplete="off" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
      </div>

      <button type="submit" data-testid="env-submit" disabled={busy} className="mt-6 h-12 w-full rounded-[10px] bg-purple-600 text-[15px] font-semibold text-white transition hover:bg-purple-700 disabled:opacity-70">
        {busy ? "Signing in…" : "Sign in"}
      </button>

      {result === "error" && (
        <div data-testid="env-error" role="alert" className="mt-5 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          ✕ Invalid email or password.
        </div>
      )}
      {result === "success" && (
        <div data-testid="env-success" role="status" className="mt-5 rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          ✓ Welcome back, Demo User!
        </div>
      )}
      {result === "no-token" && (
        <div data-testid="env-no-token" role="alert" className="mt-5 rounded-[10px] border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          This page needs your assignment link (it ends in <code>?a=…</code>). Open it from your assignment page.
        </div>
      )}
      <AssignmentNote />
    </form>
  );
}
