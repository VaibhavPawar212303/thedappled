"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignInButton } from "@clerk/nextjs";
import { ArrowRight, Check, Info, X } from "lucide-react";
import type { DsaQuestion } from "@/lib/dsa-lessons";

type Saved = { passed: boolean; done: number; totalSteps: number };

// End-of-lesson check for a DSA step. Answers are marked in the browser straight away; for signed-in
// learners they are also sent to the server, which re-grades them and saves the step on 5 of 5.
// Right answers lock (with the explanation); wrong ones turn red without revealing the right option.
export function DsaQuiz({
  step,
  questions,
  signedIn,
  next,
}: {
  step: string;
  questions: DsaQuestion[];
  signedIn: boolean;
  next?: { label: string; href: string };
}) {
  const router = useRouter();
  const total = questions.length;
  const [picked, setPicked] = React.useState<(number | null)[]>(() => questions.map(() => null));
  const [result, setResult] = React.useState<(boolean | null)[]>(() => questions.map(() => null));
  const [attempts, setAttempts] = React.useState(0);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState<Saved | null>(null);
  const [saveError, setSaveError] = React.useState(false);

  const answered = picked.filter((p) => p !== null).length;
  const correct = result.filter((r) => r === true).length;
  const finished = correct === total;

  const pick = (qi: number, oi: number) => {
    setPicked((p) => p.map((v, i) => (i === qi ? oi : v)));
    setResult((r) => r.map((v, i) => (i === qi ? null : v)));
  };

  const check = async () => {
    setResult(questions.map((q, i) => picked[i] === q.answer));
    setAttempts((n) => n + 1);
    if (!signedIn) return;
    setSaving(true);
    setSaveError(false);
    try {
      const r = await fetch("/api/dsa/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step, answers: picked }),
      });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setSaved({ passed: Boolean(d.passed), done: d.done, totalSteps: d.totalSteps });
      if (d.passed) router.refresh(); // update the "Completed" badge and sidebar progress
    } catch {
      setSaveError(true);
    }
    setSaving(false);
  };

  return (
    <div data-testid="dsa-quiz" className="mt-6 rounded-2xl border bg-card p-6 sm:p-8">
      <ol className="m-0 list-none space-y-8 p-0">
        {questions.map((item, qi) => {
          const sel = picked[qi];
          const mark = result[qi];
          const locked = mark === true;
          const wrong = mark === false;
          return (
            <li key={item.q} data-testid={`quiz-q${qi + 1}`}>
              <fieldset disabled={locked || finished}>
                <legend className="font-bold">
                  <span className="mr-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Question {qi + 1} of {total}</span>
                  <span className="mt-1 block text-lg">{item.q}</span>
                </legend>
                <div className="mt-3 space-y-2">
                  {item.options.map((opt, oi) => {
                    const isSel = sel === oi;
                    const state =
                      isSel && locked
                        ? "border-emerald-500 bg-emerald-50 font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                        : isSel && wrong
                          ? "border-red-400 bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200"
                          : isSel
                            ? "border-blue-600 bg-blue-50 font-semibold text-blue-800 dark:bg-blue-950/50 dark:text-blue-200"
                            : locked || finished
                              ? "border-border opacity-70"
                              : "border-border hover:bg-slate-50 dark:hover:bg-slate-800/50";
                    return (
                      <label key={opt} className={`flex cursor-pointer items-center gap-3 rounded-[10px] border px-4 py-2.5 text-[15px] transition ${state}`}>
                        <input type="radio" name={`q${qi}`} value={oi} checked={isSel} onChange={() => pick(qi, oi)} className="h-4 w-4 accent-blue-600" />
                        <span className={`flex-1 ${opt.startsWith("O(") ? "font-mono" : ""}`}>{opt}</span>
                        {isSel && locked && <Check className="h-4 w-4 text-emerald-600" aria-label="Correct answer" />}
                        {isSel && wrong && <X className="h-4 w-4 text-red-600" aria-label="Your answer" />}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              {locked && (
                <p data-testid={`quiz-q${qi + 1}-result`} data-correct="true" className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">
                  <span className="font-bold">Correct. </span>
                  <span className="text-muted-foreground">{item.why}</span>
                </p>
              )}
              {wrong && (
                <p data-testid={`quiz-q${qi + 1}-result`} data-correct="false" className="mt-2 text-sm text-red-700 dark:text-red-400">
                  <span className="font-bold">{sel === null ? "Not answered. " : "Not quite. "}</span>
                  <span className="text-muted-foreground">Pick another answer and check again.</span>
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-8">
        {!finished ? (
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              data-testid="quiz-check"
              onClick={check}
              disabled={answered === 0 || saving}
              className="h-11 rounded-[10px] bg-slate-900 px-6 text-[15px] font-bold text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Check answers
            </button>
            <p data-testid={attempts > 0 ? "quiz-score" : undefined} className="text-sm text-muted-foreground">
              {attempts > 0
                ? `${correct} of ${total} correct · change the red ones and check again`
                : `${answered} of ${total} answered${signedIn ? "" : " · sign in to save your progress"}`}
            </p>
            {saveError && <p className="w-full text-sm font-semibold text-red-700 dark:text-red-300">Couldn&apos;t save your result. Check your connection and try again.</p>}
          </div>
        ) : (
          <div data-testid="quiz-result" role="status">
            <p data-testid="quiz-score" className="text-lg font-extrabold">
              {correct} of {total} correct
            </p>
            <ResultPanel signedIn={signedIn} saving={saving} saved={saved} saveError={saveError} total={total} next={next} onRetry={check} />
          </div>
        )}
      </div>
    </div>
  );
}

function ResultPanel({
  signedIn,
  saving,
  saved,
  saveError,
  total,
  next,
  onRetry,
}: {
  signedIn: boolean;
  saving: boolean;
  saved: Saved | null;
  saveError: boolean;
  total: number;
  next?: { label: string; href: string };
  onRetry: () => void;
}) {
  const box = "mt-3 flex flex-wrap items-center gap-4 rounded-xl border px-5 py-4";

  if (!signedIn) {
    return (
      <div data-testid="quiz-signed-out" className={`${box} border-blue-300 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40`}>
        <Info className="h-6 w-6 shrink-0 text-blue-600" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-blue-700 dark:text-blue-300">Sign in to save your progress.</p>
          <p className="text-sm text-blue-900 dark:text-blue-200">The quiz works without an account, but only signed-in learners keep their progress.</p>
        </div>
        <SignInButton mode="modal">
          <button type="button" className="h-10 shrink-0 rounded-[10px] bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700">Sign in</button>
        </SignInButton>
      </div>
    );
  }

  if (saving) return <p className="mt-3 text-sm text-muted-foreground">Saving your result…</p>;

  if (saveError || !saved?.passed) {
    return (
      <div className={`${box} border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40`}>
        <p className="min-w-0 flex-1 text-sm font-semibold text-red-700 dark:text-red-300">Couldn&apos;t save your result. Check your connection and try again.</p>
        <button type="button" onClick={onRetry} className="h-10 shrink-0 rounded-[10px] border bg-white px-5 text-sm font-bold text-red-700 hover:bg-red-50 dark:bg-transparent">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div data-testid="quiz-saved" className={`${box} border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40`}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
        <Check className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-extrabold text-emerald-700 dark:text-emerald-300">
          {total} of {total} — step complete, progress saved.
        </p>
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          {saved.done} of {saved.totalSteps} Foundations steps done.
        </p>
      </div>
      {next && (
        <Link href={next.href} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[10px] bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-700">
          {next.label} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
