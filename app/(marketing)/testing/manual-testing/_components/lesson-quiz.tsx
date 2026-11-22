"use client";

import * as React from "react";
import { Check, X } from "lucide-react";

export type QuizQuestion = { q: string; options: string[]; answer: number; why: string };

// Self-check at the end of a Manual testing lesson. Runs entirely in the browser: nothing is sent or saved.
export function LessonQuiz({ questions, doneText }: { questions: QuizQuestion[]; doneText: string }) {
  const [picked, setPicked] = React.useState<(number | null)[]>(() => questions.map(() => null));
  const [checked, setChecked] = React.useState(false);
  const answered = picked.filter((p) => p !== null).length;
  const score = picked.filter((p, i) => p === questions[i].answer).length;

  return (
    <section id="quiz" data-testid="lesson-quiz" className="scroll-mt-24 rounded-2xl border-[1.5px] border-blue-600 bg-card p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Check your understanding</p>
          <h2 className="mt-1 text-2xl font-extrabold">{questions.length} quick questions</h2>
        </div>
        <p className="text-sm font-bold text-blue-700 dark:text-blue-300">Pick one answer for each</p>
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

      <div className="mt-8 flex flex-wrap items-center gap-4">
        {!checked ? (
          <>
            <button
              type="button"
              data-testid="quiz-check"
              onClick={() => setChecked(true)}
              disabled={answered === 0}
              className="h-11 rounded-[10px] bg-blue-600 px-6 text-[15px] font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              Check answers
            </button>
            <p className="text-sm text-muted-foreground">
              {answered} of {questions.length} answered · nothing is saved
            </p>
          </>
        ) : (
          <>
            <p data-testid="quiz-score" role="status" className="text-lg font-extrabold">
              {score} of {questions.length} correct
              <span className="ml-2 text-sm font-semibold text-muted-foreground">
                {score === questions.length ? `— ${doneText}` : "— read the notes above and try again."}
              </span>
            </p>
            <button
              type="button"
              data-testid="quiz-reset"
              onClick={() => {
                setPicked(questions.map(() => null));
                setChecked(false);
              }}
              className="h-11 rounded-[10px] border px-5 text-[15px] font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Try again
            </button>
          </>
        )}
      </div>
    </section>
  );
}
