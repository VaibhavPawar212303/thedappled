import { getAssignmentForUser, MANUAL_TESTING, type StepId } from "@/lib/assignments";

export type ManualProgress = { done: StepId[] };

// The signed-in learner's completed Manual testing steps, or null when signed out. A missing record
// (no quiz attempted yet) is an empty list. Database errors fall back to "no progress shown".
export async function getManualProgress(userId: string | null): Promise<ManualProgress | null> {
  if (!userId) return null;
  const a = await getAssignmentForUser(userId, MANUAL_TESTING).catch(() => null);
  return { done: a ? a.steps.filter((s) => s.done).map((s) => s.id) : [] };
}
