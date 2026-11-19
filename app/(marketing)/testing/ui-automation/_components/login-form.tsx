"use client";

import * as React from "react";
import { inputClass } from "./practice-layout";

const DEMO_EMAIL = "demo@thedappled.com";
const DEMO_PASSWORD = "Test@1234";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Errors = { email?: string; password?: string };

export function LoginForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(false);
  const [show, setShow] = React.useState(false);
  const [errors, setErrors] = React.useState<Errors>({});
  const [result, setResult] = React.useState<"idle" | "error" | "success">("idle");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!email.trim()) next.email = "Email is required.";
    else if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    setErrors(next);
    if (Object.keys(next).length) {
      setResult("idle");
      return;
    }
    setResult(email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD ? "success" : "error");
  };

  return (
    <form onSubmit={onSubmit} noValidate data-testid="login-form">
      <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
        Practice page
      </span>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Sign in</h1>
      <p className="mt-2 text-muted-foreground">Welcome back — enter your details to continue.</p>

      <div className="mt-6">
        <label htmlFor="login-email" className="text-sm font-semibold">Email</label>
        <input
          id="login-email"
          data-testid="login-email"
          type="email"
          autoComplete="off"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "login-email-error" : undefined}
          className={inputClass}
        />
        {errors.email && (
          <p id="login-email-error" data-testid="login-error-email" role="alert" className="mt-1.5 text-[13px] text-red-600">
            {errors.email}
          </p>
        )}
      </div>

      <div className="mt-5">
        <label htmlFor="login-password" className="text-sm font-semibold">Password</label>
        <div className="relative">
          <input
            id="login-password"
            data-testid="login-password"
            type={show ? "text" : "password"}
            autoComplete="off"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "login-password-error" : undefined}
            className={`${inputClass} pr-16`}
          />
          <button
            type="button"
            data-testid="login-toggle-password"
            aria-pressed={show}
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-[calc(50%+4px)] -translate-y-1/2 rounded px-1 text-[13px] font-semibold text-blue-600 hover:underline"
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
        {errors.password && (
          <p id="login-password-error" data-testid="login-error-password" role="alert" className="mt-1.5 text-[13px] text-red-600">
            {errors.password}
          </p>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 text-sm">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            data-testid="login-remember"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 accent-emerald-600"
          />
          Remember me
        </label>
        <button type="button" data-testid="login-forgot" className="font-semibold text-blue-600 hover:underline">
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        data-testid="login-submit"
        className="mt-6 h-12 w-full rounded-[10px] bg-blue-600 text-[15px] font-semibold text-white transition hover:bg-blue-700"
      >
        Sign in
      </button>

      {result === "error" && (
        <div data-testid="login-error" role="alert" className="mt-5 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          ✕ Invalid email or password.
        </div>
      )}
      {result === "success" && (
        <div data-testid="login-success" role="status" className="mt-5 rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          ✓ Welcome back, Demo User!{remember ? " (We’ll remember you.)" : ""}
        </div>
      )}
    </form>
  );
}
