"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { ArrowRight, Check, Info, X } from "lucide-react";
import type { DsaQuestion } from "@/lib/dsa-lessons";
import { readPending, savePending, sendQuiz } from "./dsa-pending";

type Saved = { passed: boolean; done: number; totalSteps: number };

// End-of-lesson check for a DSA step, one question at a time (a slider). Pick an answer and Submit:
// a wrong answer turns red and the learner picks again; a right one shows why and Next moves on.
// When all are right the answers go to the server, which re-grades them and saves the step.
// Signed out, a finished quiz is kept in this browser and saved as soon as the learner signs in.
// Design: Penpot "27 - DSA Learning Path", page "Quiz – one question at a time".
export function DsaQuiz({
  step,
  questions,
  signedIn: signedInOnServer,
  next,
}: {
  step: string;
  questions: DsaQuestion[];
  signedIn: boolean;
  next?: { label: string; href: string };
}) {
  const router = useRouter();
  // The server's answer at render time, or Clerk's live state (true as soon as the sign-in modal closes).
  const { isSignedIn } = useAuth();
  const signedIn = signedInOnServer || Boolean(isSignedIn);
  const total = questions.length;

  const [idx, setIdx] = React.useState(0); // the question on screen
  const [picked, setPicked] = React.useState<(number | null)[]>(() => questions.map(() => null));
  const [right, setRight] = React.useState<boolean[]>(() => questions.map(() => false));
  const [wrongPick, setWrongPick] = React.useState<number | null>(null); // last submitted wrong option
  const [finished, setFinished] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState<Saved | null>(null);
  const [saveError, setSaveError] = React.useState(false);

  const q = questions[idx];
  const sel = picked[idx];
  const isRight = right[idx];
  const isWrong = wrongPick !== null && sel === wrongPick;
  const doneCount = right.filter(Boolean).length;
  const isLast = idx === total - 1;

  const submit = React.useCallback(
    async (answers: (number | null)[]) => {
      setSaving(true);
      setSaveError(false);
      try {
        const d = await sendQuiz(step, answers);
        if (!d) throw new Error();
        setSaved({ passed: Boolean(d.passed), done: d.done, totalSteps: d.totalSteps });
        if (d.passed) router.refresh(); // update the "Completed" badge and sidebar progress
      } catch {
        setSaveError(true);
      }
      setSaving(false);
    },
    [step, router],
  );

  const pick = (oi: number) => setPicked((p) => p.map((v, i) => (i === idx ? oi : v)));

  const check = () => {
    if (sel === null) return;
    if (sel === q.answer) {
      setRight((r) => r.map((v, i) => (i === idx ? true : v)));
      setWrongPick(null);
    } else {
      setWrongPick(sel);
    }
  };

  const goNext = () => {
    if (!isLast) {
      setIdx(idx + 1);
      setWrongPick(null);
      return;
    }
    setFinished(true);
    if (signedIn) void submit(picked);
    else savePending(step, picked);
  };

  // After signing in: save this lesson's quiz if it was finished while signed out (still on screen, or
  // stored from before a sign-in that reloaded the page or happened elsewhere).
  const autoSaved = React.useRef(false);
  React.useEffect(() => {
    if (!signedIn || autoSaved.current) return;
    const stored = readPending(step);
    const pending = stored && stored.length === total ? stored : finished && !saved ? picked : null;
    if (!pending) return;
    autoSaved.current = true;
    setPicked(pending);
    setRight(questions.map((qq, i) => pending[i] === qq.answer));
    setFinished(true);
    void submit(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn]);

  return (
    <div data-testid="dsa-quiz" className="mt-6 rounded-2xl border bg-card p-6 sm:p-8">
      <QuizHeader total={total} idx={idx} right={right} finished={finished} />

      {finished ? (
        <div data-testid="quiz-result" role="status" className="mt-8">
          <FinishedHead total={total} />
          <ResultPanel signedIn={signedIn} saving={saving} saved={saved} saveError={saveError} total={total} next={next} onRetry={() => submit(picked)} />
        </div>
      ) : (
        <>
          <fieldset key={idx} data-testid={`quiz-q${idx + 1}`} disabled={isRight} className="mt-6">
            <legend className="text-xl font-extrabold">{q.q}</legend>
            <div className="mt-4 space-y-2">
              {q.options.map((opt, oi) => (
                <QuizOption
                  key={opt}
                  name={`q${idx}`}
                  label={opt}
                  mono={opt.startsWith("O(")}
                  selected={sel === oi}
                  right={isRight}
                  wrong={isWrong}
                  onPick={() => pick(oi)}
                  value={oi}
                />
              ))}
            </div>
            {isWrong && <Feedback ok={false} title="Not quite." text="Choose another answer and submit again." />}
            {isRight && <Feedback ok title="Correct." text={q.why} />}
          </fieldset>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            {isRight ? (
              <NextButton last={isLast} onClick={goNext} />
            ) : (
              <>
                <SubmitButton onClick={check} disabled={sel === null || isWrong} />
                <p className="text-sm text-muted-foreground">
                  {isWrong ? "Pick a different answer to submit again" : `${doneCount} of ${total} done${signedIn ? "" : " · sign in to save your progress"}`}
                </p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Shared pieces of the slider quiz (also used by the Manual testing quiz).

export function QuizHeader({ total, idx, right, finished }: { total: number; idx: number; right: boolean[]; finished: boolean }) {
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Check your understanding</p>
        {!finished && (
          <p data-testid="quiz-position" className="text-sm font-bold text-muted-foreground">
            Question {idx + 1} of {total}
          </p>
        )}
      </div>
      <div className="mt-3 flex gap-2" aria-hidden="true">
        {right.map((r, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${r ? "bg-emerald-500" : i === idx && !finished ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"}`} />
        ))}
      </div>
    </>
  );
}

export function QuizOption({
  name,
  label,
  value,
  mono,
  selected,
  right,
  wrong,
  onPick,
}: {
  name: string;
  label: string;
  value: number;
  mono?: boolean;
  selected: boolean;
  right: boolean;
  wrong: boolean;
  onPick: () => void;
}) {
  const state =
    selected && right
      ? "border-emerald-500 bg-emerald-50 font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
      : selected && wrong
        ? "border-red-400 bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200"
        : selected
          ? "border-blue-600 bg-blue-50 font-semibold text-blue-800 dark:bg-blue-950/50 dark:text-blue-200"
          : right
            ? "border-border opacity-60"
            : "border-border hover:bg-slate-50 dark:hover:bg-slate-800/50";
  return (
    <label className={`flex cursor-pointer items-center gap-3 rounded-[10px] border px-4 py-3 text-[15px] transition ${state}`}>
      <input type="radio" name={name} value={value} checked={selected} onChange={onPick} className="h-4 w-4 accent-blue-600" />
      <span className={`flex-1 ${mono ? "font-mono" : ""}`}>{label}</span>
      {selected && right && <Check className="h-4 w-4 text-emerald-600" aria-label="Correct answer" />}
      {selected && wrong && <X className="h-4 w-4 text-red-600" aria-label="Wrong answer" />}
    </label>
  );
}

export function Feedback({ ok, title, text, children }: { ok: boolean; title: string; text: string; children?: React.ReactNode }) {
  return (
    <div
      data-testid="quiz-feedback"
      data-correct={ok ? "true" : "false"}
      role="status"
      className={`mt-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-1 rounded-[10px] border px-4 py-3 ${
        ok ? "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40" : "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className={`font-extrabold ${ok ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}`}>{title}</p>
        <p className={`text-sm ${ok ? "text-emerald-800 dark:text-emerald-200" : "text-red-800 dark:text-red-200"}`}>{text}</p>
      </div>
      {children}
    </div>
  );
}

export function SubmitButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      data-testid="quiz-check"
      onClick={onClick}
      disabled={disabled}
      className="h-11 rounded-[10px] bg-slate-900 px-6 text-[15px] font-bold text-white transition hover:bg-slate-800 disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
    >
      Submit
    </button>
  );
}

export function NextButton({ last, onClick }: { last: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      data-testid="quiz-next"
      onClick={onClick}
      className="inline-flex h-11 items-center gap-1.5 rounded-[10px] bg-blue-600 px-6 text-[15px] font-bold text-white transition hover:bg-blue-700"
    >
      {last ? "See your result" : "Next question"} <ArrowRight className="h-4 w-4" />
    </button>
  );
}

export function FinishedHead({ total }: { total: number }) {
  return (
    <div className="text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white">
        <Check className="h-8 w-8" />
      </span>
      <p data-testid="quiz-score" className="mt-4 text-2xl font-extrabold">
        {total} of {total} correct
      </p>
      <p className="mt-1 text-[15px] text-muted-foreground">You answered every question.</p>
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
          <p className="text-sm text-blue-900 dark:text-blue-200">Your result is kept in this browser and saved to your roadmap as soon as you sign in.</p>
        </div>
        <SignInButton mode="modal">
          <button type="button" className="h-10 shrink-0 rounded-[10px] bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700">Sign in</button>
        </SignInButton>
      </div>
    );
  }

  // Not saved yet and no error: a save is about to start (e.g. right after signing in).
  if (saving || (!saved && !saveError)) return <p className="mt-3 text-sm text-muted-foreground">Saving your result…</p>;

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
