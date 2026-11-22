"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignInButton } from "@clerk/nextjs";
import { ArrowRight, Check, Info, X } from "lucide-react";
import type { ManualLessonSlug, QuizQuestion } from "@/lib/manual-quizzes";

export type { QuizQuestion };

type Saved = { passed: boolean; done: number; totalSteps: number };

// Self-check at the end of a Manual testing lesson. Answers are marked in the browser straight away;
// for signed-in learners they are also sent to the server, which re-grades them and — on 5 of 5 —
// saves the step as complete (progress + leaderboard).
export function LessonQuiz({
  lesson,
  questions,
  signedIn,
  next,
}: {
  lesson: ManualLessonSlug;
  questions: QuizQuestion[];
  signedIn: boolean;
  next?: { label: string; href: string };
}) {
  const router = useRouter();
  const [picked, setPicked] = React.useState<(number | null)[]>(() => questions.map(() => null));
  const [checked, setChecked] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState<Saved | null>(null);
  const [saveError, setSaveError] = React.useState(false);
  const answered = picked.filter((p) => p !== null).length;
  const score = picked.filter((p, i) => p === questions[i].answer).length;
  const total = questions.length;

  const reset = () => {
    setPicked(questions.map(() => null));
    setChecked(false);
    setSaved(null);
    setSaveError(false);
  };

  const check = async () => {
    setChecked(true);
    if (!signedIn) return;
    setSaving(true);
    setSaveError(false);
    try {
      const r = await fetch("/api/manual-testing/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson, answers: picked }),
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
    <section id="quiz" data-testid="lesson-quiz" className="scroll-mt-24 rounded-2xl border-[1.5px] border-blue-600 bg-card p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Check your understanding</p>
          <h2 className="mt-1 text-2xl font-extrabold">{total} quick questions</h2>
        </div>
        <p className="text-sm font-bold text-blue-700 dark:text-blue-300">Pick one answer for each · 5 of 5 completes the step</p>
      </div>

      <ol className="m-0 mt-6 list-none space-y-8 p-0">
        {questions.map((item, qi) => {
          const sel = picked[qi];
          const correct = sel === item.answer;
          return (
            <li key={item.q} data-testid={`quiz-q${qi + 1}`}>
              <fieldset disabled={checked}>
                <legend className="font-bold">
                  {qi + 1}. {item.q}
                </legend>
                <div className="mt-3 space-y-2">
                  {item.options.map((opt, oi) => {
                    const isSel = sel === oi;
                    const isAnswer = oi === item.answer;
                    const state = !checked
                      ? isSel
                        ? "border-blue-600 bg-blue-50 font-semibold text-blue-800 dark:bg-blue-950/50 dark:text-blue-200"
                        : "border-border hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      : isAnswer
                        ? "border-emerald-500 bg-emerald-50 font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                        : isSel
                          ? "border-red-400 bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200"
                          : "border-border opacity-70";
                    return (
                      <label key={opt} className={`flex cursor-pointer items-center gap-3 rounded-[10px] border px-4 py-3 text-[15px] transition ${state}`}>
                        <input
                          type="radio"
                          name={`q${qi}`}
                          value={oi}
                          checked={isSel}
                          onChange={() => setPicked((p) => p.map((v, i) => (i === qi ? oi : v)))}
                          className="h-4 w-4 accent-blue-600"
                        />
                        <span className="flex-1">{opt}</span>
                        {checked && isAnswer && <Check className="h-4 w-4 text-emerald-600" aria-label="Correct answer" />}
                        {checked && isSel && !isAnswer && <X className="h-4 w-4 text-red-600" aria-label="Your answer" />}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              {checked && (
                <p data-testid={`quiz-q${qi + 1}-result`} data-correct={correct} className={`mt-2 text-sm ${correct ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
                  <span className="font-bold">{sel === null ? "Not answered. " : correct ? "Correct. " : "Not quite. "}</span>
                  <span className="text-muted-foreground">{item.why}</span>
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-8">
        {!checked ? (
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              data-testid="quiz-check"
              onClick={check}
              disabled={answered === 0}
              className="h-11 rounded-[10px] bg-blue-600 px-6 text-[15px] font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              Check answers
            </button>
            <p className="text-sm text-muted-foreground">
              {answered} of {total} answered{signedIn ? "" : " · sign in to save your progress"}
            </p>
          </div>
        ) : (
          <div data-testid="quiz-result" role="status">
            <p data-testid="quiz-score" className="text-lg font-extrabold">
              {score} of {total} correct
            </p>
            <ResultPanel
              signedIn={signedIn}
              saving={saving}
              saved={saved}
              saveError={saveError}
              score={score}
              total={total}
              next={next}
              onRetry={reset}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function ResultPanel({
  signedIn,
  saving,
  saved,
  saveError,
  score,
  total,
  next,
  onRetry,
}: {
  signedIn: boolean;
  saving: boolean;
  saved: Saved | null;
  saveError: boolean;
  score: number;
  total: number;
  next?: { label: string; href: string };
  onRetry: () => void;
}) {
  const retry = (cls: string) => (
    <button type="button" data-testid="quiz-reset" onClick={onRetry} className={`h-10 shrink-0 rounded-[10px] border px-5 text-sm font-bold ${cls}`}>
      Try again
    </button>
  );
  const box = "mt-3 flex flex-wrap items-center gap-4 rounded-xl border px-5 py-4";

  if (!signedIn) {
    return (
      <div data-testid="quiz-signed-out" className={`${box} border-blue-300 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40`}>
        <Info className="h-6 w-6 shrink-0 text-blue-600" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-blue-700 dark:text-blue-300">Sign in to save your progress.</p>
          <p className="text-sm text-blue-900 dark:text-blue-200">The quiz still works without an account, but only signed-in learners appear on the leaderboard.</p>
        </div>
        <SignInButton mode="modal">
          <button type="button" className="h-10 shrink-0 rounded-[10px] bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700">Sign in</button>
        </SignInButton>
        {retry("bg-white text-slate-700 hover:bg-slate-50 dark:bg-transparent dark:text-slate-200")}
      </div>
    );
  }

  if (saving) return <p className="mt-3 text-sm text-muted-foreground">Saving your result…</p>;

  if (saveError) {
    return (
      <div className={`${box} border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40`}>
        <p className="min-w-0 flex-1 text-sm font-semibold text-red-700 dark:text-red-300">Couldn&apos;t save your result. Check your connection and try again.</p>
        {retry("bg-white text-red-700 hover:bg-red-50 dark:bg-transparent")}
      </div>
    );
  }

  if (saved?.passed) {
    return (
      <div data-testid="quiz-saved" className={`${box} border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40`}>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
          <Check className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-emerald-700 dark:text-emerald-300">
            {score} of {total} — step complete, progress saved.
          </p>
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            {saved.done} of {saved.totalSteps} Manual testing steps done · you&apos;re on the leaderboard.
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

  return (
    <div data-testid="quiz-not-passed" className={`${box} border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40`}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-600 font-extrabold text-white">!</span>
      <div className="min-w-0 flex-1">
        <p className="font-extrabold text-amber-700 dark:text-amber-300">
          {score} of {total} — score {total} of {total} to complete this step.
        </p>
        <p className="text-sm text-amber-800 dark:text-amber-300/80">Read the notes under each question, then try again. Nothing is lost.</p>
      </div>
      {retry("border-amber-600 bg-white text-amber-700 hover:bg-amber-50 dark:bg-transparent dark:text-amber-300")}
    </div>
  );
}
