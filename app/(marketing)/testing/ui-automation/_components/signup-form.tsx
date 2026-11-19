"use client";

import * as React from "react";
import { inputClass } from "./practice-layout";
import { useAssignmentReporter } from "./assignment-reporter";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Errors = Partial<Record<"name" | "email" | "password" | "confirm" | "terms", string>>;

function strength(pw: string) {
  const checks = [pw.length >= 8, /\d/.test(pw), /[^A-Za-z0-9]/.test(pw), /[a-z]/.test(pw) && /[A-Z]/.test(pw)];
  return { score: checks.filter(Boolean).length, ok: checks[0] && checks[1] && checks[2] };
}

const LABELS = ["Too short", "Weak", "Fair", "Good", "Strong"];
const BAR = ["bg-red-500", "bg-red-500", "bg-amber-500", "bg-emerald-500", "bg-emerald-600"];

export function SignupForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [terms, setTerms] = React.useState(false);
  const [errors, setErrors] = React.useState<Errors>({});
  const [created, setCreated] = React.useState<string | null>(null);
  const { report } = useAssignmentReporter();

  const { score, ok } = strength(password);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "Full name is required.";
    if (!email.trim()) next.email = "Email is required.";
    else if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    else if (!ok) next.password = "Use 8+ characters, a number and a symbol.";
    if (!confirm) next.confirm = "Please confirm your password.";
    else if (confirm !== password) next.confirm = "Passwords do not match.";
    if (!terms) next.terms = "You must accept the Terms of Service.";
    setErrors(next);
    setCreated(Object.keys(next).length ? null : name.trim());
    if (Object.keys(next).length === 5) report("signup-empty");
    if (next.confirm === "Passwords do not match.") report("signup-mismatch");
    if (Object.keys(next).length === 0) report("signup-success");
  };

  const field = (
    id: "name" | "email" | "password" | "confirm",
    label: string,
    type: string,
    value: string,
    set: (v: string) => void,
    placeholder: string,
  ) => (
    <div className="mt-5">
      <label htmlFor={`signup-${id}`} className="text-sm font-semibold">{label}</label>
      <input
        id={`signup-${id}`}
        data-testid={`signup-${id}`}
        type={type}
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => set(e.target.value)}
        aria-invalid={Boolean(errors[id])}
        aria-describedby={errors[id] ? `signup-${id}-error` : undefined}
        className={inputClass}
      />
      {errors[id] && (
        <p id={`signup-${id}-error`} data-testid={`signup-error-${id}`} role="alert" className="mt-1.5 text-[13px] text-red-600">
          {errors[id]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate data-testid="signup-form">
      <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
        Practice page
      </span>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Create account</h1>
      <p className="mt-2 text-muted-foreground">Join in seconds — nothing is stored.</p>

      <div className="-mt-1">{field("name", "Full name", "text", name, setName, "Demo User")}</div>
      {field("email", "Email", "email", email, setEmail, "you@example.com")}
      {field("password", "Password", "password", password, setPassword, "At least 8 characters")}

      <div className="mt-3" data-testid="signup-strength" data-score={score} aria-live="polite">
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${password && i < Math.max(score, 1) ? BAR[score] : "bg-slate-200 dark:bg-slate-700"}`} />
          ))}
        </div>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          {password ? `${LABELS[score]} — use 8+ characters, a number and a symbol.` : "Use 8+ characters, a number and a symbol."}
        </p>
      </div>

      {field("confirm", "Confirm password", "password", confirm, setConfirm, "Repeat your password")}

      <div className="mt-5">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            data-testid="signup-terms"
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            aria-invalid={Boolean(errors.terms)}
            className="h-4 w-4 accent-emerald-600"
          />
          I agree to the Terms of Service
        </label>
        {errors.terms && (
          <p data-testid="signup-error-terms" role="alert" className="mt-1.5 text-[13px] text-red-600">{errors.terms}</p>
        )}
      </div>

      <button
        type="submit"
        data-testid="signup-submit"
        className="mt-6 h-12 w-full rounded-[10px] bg-emerald-600 text-[15px] font-semibold text-white transition hover:bg-emerald-700"
      >
        Create account
      </button>

      {created && (
        <div data-testid="signup-success" role="status" className="mt-5 rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          ✓ Account created (demo). Welcome, {created}!
        </div>
      )}
    </form>
  );
}
