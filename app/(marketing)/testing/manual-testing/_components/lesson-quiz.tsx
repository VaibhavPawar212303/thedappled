"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { ArrowRight, Check, Info, Lightbulb } from "lucide-react";
import type { ManualLessonSlug, QuizQuestion } from "@/lib/manual-quizzes";
import { Feedback, FinishedHead, NextButton, QuizHeader, QuizOption, SubmitButton } from "@/app/(marketing)/dsa/_components/dsa-quiz";
import { readPending, savePending, sendQuiz, type Pending } from "./manual-pending";

export type { QuizQuestion };

type Saved = { passed: boolean; counted: boolean; done: number; totalSteps: number };

// Self-check at the end of a Manual testing lesson, one question at a time (a slider). Pick an answer
// and Submit: a wrong answer turns red (with an optional hint) and the learner picks again; a right one
// shows why and Next moves on. When all are right the answers go to the server, which re-grades them
// and — on 5 of 5 — saves the step (progress + leaderboard). Passing with any hint completes the step
// but gives no leaderboard points. Signed out, a finished quiz is kept in this browser and saved as
// soon as the learner signs in.
// Design: Penpot "26 - Testing Learning Path", page "Manual testing", boards "Manual quiz slider — …".
export function LessonQuiz({
  lesson,
  questions,
  signedIn: signedInOnServer,
  next,
}: {
  lesson: ManualLessonSlug;
  questions: QuizQuestion[];
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
  const [missed, setMissed] = React.useState<boolean[]>(() => questions.map(() => false)); // wrong at least once
  const [hintOpen, setHintOpen] = React.useState<boolean[]>(() => questions.map(() => false));
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
  const hintsUsed = hintOpen.filter(Boolean).length;

  const submit = React.useCallback(
    async (p: Pending) => {
      setSaving(true);
      setSaveError(false);
      try {
        const d = await sendQuiz(lesson, p);
        if (!d) throw new Error();
        setSaved({ passed: Boolean(d.passed), counted: Boolean(d.counted), done: d.done, totalSteps: d.totalSteps });
        if (d.passed) router.refresh(); // update the "Completed" badge and sidebar progress
      } catch {
        setSaveError(true);
      }
      setSaving(false);
    },
    [lesson, router],
  );

  const pick = (oi: number) => setPicked((p) => p.map((v, i) => (i === idx ? oi : v)));

  const check = () => {
    if (sel === null) return;
    if (sel === q.answer) {
      setRight((r) => r.map((v, i) => (i === idx ? true : v)));
      setWrongPick(null);
    } else {
      setWrongPick(sel);
      setMissed((m) => m.map((v, i) => (i === idx ? true : v)));
    }
  };

  const goNext = () => {
    if (!isLast) {
      setIdx(idx + 1);
      setWrongPick(null);
      return;
    }
    setFinished(true);
    const p = { answers: picked, hints: hintsUsed };
    if (signedIn) void submit(p);
    else savePending(lesson, p);
  };

  // After signing in: save this lesson's quiz if it was finished while signed out (still on screen, or
  // stored from before a sign-in that reloaded the page or happened elsewhere).
  const autoSaved = React.useRef(false);
  React.useEffect(() => {
    if (!signedIn || autoSaved.current) return;
    const stored = readPending(lesson);
    const pending: Pending | null =
      stored && stored.answers.length === total ? stored : finished && !saved ? { answers: picked, hints: hintsUsed } : null;
    if (!pending) return;
    autoSaved.current = true;
    setPicked(pending.answers);
    setRight(questions.map((qq, i) => pending.answers[i] === qq.answer));
    setFinished(true);
    void submit(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn]);

  return (
    <section id="quiz" data-testid="lesson-quiz" className="scroll-mt-24 rounded-2xl border-[1.5px] border-blue-600 bg-card p-6 sm:p-8">
      <QuizHeader total={total} idx={idx} right={right} finished={finished} />

      {finished ? (
        <div data-testid="quiz-result" role="status" className="mt-8">
          <FinishedHead total={total} />
          <ResultPanel
            signedIn={signedIn}
            saving={saving}
            saved={saved}
            saveError={saveError}
            hintsUsed={hintsUsed}
            total={total}
            next={next}
            onRetry={() => submit({ answers: picked, hints: hintsUsed })}
          />
        </div>
      ) : (
        <>
          <fieldset key={idx} data-testid={`quiz-q${idx + 1}`} disabled={isRight} className="mt-6">
            <legend className="flex w-full flex-wrap items-center justify-between gap-2 text-xl font-extrabold">
              <span>{q.q}</span>
              {hintOpen[idx] && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">Hint used</span>
              )}
            </legend>
            <div className="mt-4 space-y-2">
              {q.options.map((opt, oi) => (
                <QuizOption key={opt} name={`q${idx}`} label={opt} value={oi} selected={sel === oi} right={isRight} wrong={isWrong} onPick={() => pick(oi)} />
              ))}
            </div>

            {isWrong && (
              <Feedback ok={false} title="Not quite." text="Choose another answer and submit again.">
                {!hintOpen[idx] && (
                  <button
                    type="button"
                    data-testid={`quiz-q${idx + 1}-hint`}
                    onClick={() => setHintOpen((h) => h.map((v, i) => (i === idx ? true : v)))}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-700 hover:underline dark:text-amber-300"
                  >
                    <Lightbulb className="h-4 w-4" aria-hidden="true" /> Show hint (no leaderboard points)
                  </button>
                )}
              </Feedback>
            )}
            {hintOpen[idx] && !isRight && missed[idx] && (
              <div data-testid={`quiz-q${idx + 1}-hint-text`} className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/40">
                <p className="text-sm font-extrabold text-amber-700 dark:text-amber-300">Hint</p>
                <p className="mt-1 text-sm text-amber-900 dark:text-amber-200">{q.why}</p>
                <p className="mt-1 text-xs text-amber-800 dark:text-amber-300/80">Hint used · this step will be completed without leaderboard points</p>
              </div>
            )}
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
    </section>
  );
}

function ResultPanel({
  signedIn,
  saving,
  saved,
  saveError,
  hintsUsed,
  total,
  next,
  onRetry,
}: {
  signedIn: boolean;
  saving: boolean;
  saved: Saved | null;
  saveError: boolean;
  hintsUsed: number;
  total: number;
  next?: { label: string; href: string };
  onRetry: () => void;
}) {
  const box = "mt-3 flex flex-wrap items-center gap-4 rounded-xl border px-5 py-4";
  const hintNote = `${hintsUsed} hint${hintsUsed === 1 ? "" : "s"} used`;

  if (!signedIn) {
    return (
      <div data-testid="quiz-signed-out" className={`${box} border-blue-300 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40`}>
        <Info className="h-6 w-6 shrink-0 text-blue-600" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-blue-700 dark:text-blue-300">Sign in to save your progress.</p>
          <p className="text-sm text-blue-900 dark:text-blue-200">Your result is kept in this browser and saved to your progress as soon as you sign in.</p>
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
        <button type="button" data-testid="quiz-reset" onClick={onRetry} className="h-10 shrink-0 rounded-[10px] border bg-white px-5 text-sm font-bold text-red-700 hover:bg-red-50 dark:bg-transparent">
          Try again
        </button>
      </div>
    );
  }

  const nextLink = (cls: string) =>
    next && (
      <Link href={next.href} className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[10px] px-5 text-sm font-bold text-white ${cls}`}>
        {next.label} <ArrowRight className="h-4 w-4" />
      </Link>
    );

  if (!saved.counted) {
    return (
      <div data-testid="quiz-saved-no-points" className={`${box} border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40`}>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white">
          <Check className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-amber-700 dark:text-amber-300">Step complete – no leaderboard points ({hintNote}).</p>
          <p className="text-sm text-amber-800 dark:text-amber-300/80">
            Progress is saved ({saved.done} of {saved.totalSteps} Manual testing steps done) and you can go on to the next lesson.
          </p>
        </div>
        {nextLink("bg-amber-600 hover:bg-amber-700")}
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
          {saved.done} of {saved.totalSteps} Manual testing steps done · you&apos;re on the leaderboard.
        </p>
      </div>
      {nextLink("bg-emerald-600 hover:bg-emerald-700")}
    </div>
  );
}
