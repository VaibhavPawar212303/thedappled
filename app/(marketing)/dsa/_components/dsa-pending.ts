// Quizzes finished (5 of 5) while signed out, kept in this browser until the learner signs in and the
// server saves them. The server re-grades the answers, so nothing stored here is trusted.
// localStorage (not sessionStorage) so a sign-in that opens a new tab or lands on another page still works.

const PREFIX = "dsa-quiz-pending:";

export function savePending(step: string, answers: (number | null)[]) {
  try {
    localStorage.setItem(PREFIX + step, JSON.stringify(answers));
  } catch {}
}

export function readPending(step: string): (number | null)[] | null {
  try {
    const raw = localStorage.getItem(PREFIX + step);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearPending(step: string) {
  try {
    localStorage.removeItem(PREFIX + step);
  } catch {}
}

export function pendingSteps(): string[] {
  try {
    return Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .map((k) => k.slice(PREFIX.length));
  } catch {
    return [];
  }
}

// Sends one pending quiz to the server. Returns whether it passed, or null if it couldn't be saved.
export async function sendQuiz(step: string, answers: (number | null)[]) {
  const r = await fetch("/api/dsa/quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ step, answers }),
  });
  if (r.status === 400) clearPending(step); // unknown step: drop it
  if (!r.ok) return null;
  clearPending(step);
  return (await r.json()) as { passed: boolean; done: number; totalSteps: number };
}
