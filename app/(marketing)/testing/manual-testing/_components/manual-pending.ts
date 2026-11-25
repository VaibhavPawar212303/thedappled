// Manual testing quizzes finished (5 of 5) while signed out, kept in this browser until the learner
// signs in and the server saves them. The server re-grades the answers, so nothing here is trusted.
// localStorage so a sign-in that opens a new tab or lands on another page still works.

export type Pending = { answers: (number | null)[]; hints: number };

const PREFIX = "manual-quiz-pending:";

export function savePending(lesson: string, p: Pending) {
  try {
    localStorage.setItem(PREFIX + lesson, JSON.stringify(p));
  } catch {}
}

export function readPending(lesson: string): Pending | null {
  try {
    const raw = localStorage.getItem(PREFIX + lesson);
    const p = raw ? JSON.parse(raw) : null;
    return p && Array.isArray(p.answers) ? { answers: p.answers, hints: Number(p.hints) || 0 } : null;
  } catch {
    return null;
  }
}

export function clearPending(lesson: string) {
  try {
    localStorage.removeItem(PREFIX + lesson);
  } catch {}
}

export function pendingLessons(): string[] {
  try {
    return Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .map((k) => k.slice(PREFIX.length));
  } catch {
    return [];
  }
}

// Sends one quiz to the server. Returns the saved result, or null if it couldn't be saved.
export async function sendQuiz(lesson: string, p: Pending) {
  const r = await fetch("/api/manual-testing/quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lesson, answers: p.answers, hints: p.hints }),
  });
  if (r.status === 400) clearPending(lesson); // unknown lesson: drop it
  if (!r.ok) return null;
  clearPending(lesson);
  return (await r.json()) as { passed: boolean; counted: boolean; done: number; totalSteps: number };
}
