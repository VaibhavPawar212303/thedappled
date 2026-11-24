import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { NO_TOOL } from "@/lib/tools";
import { DSA_FOUNDATIONS, FOUNDATIONS_STEPS } from "@/lib/dsa-lessons";

// DSA progress reuses the Assignment / AssignmentEvent tables (no schema change): one assignment per
// learner with slug "dsa-foundations" and tool "none", and one verified event per completed step.
// The Testing leaderboards only query their own slugs, so these rows never appear there.

export type DsaProgress = { done: string[] };

const key = (userId: string) => ({ userId_slug_tool: { userId, slug: DSA_FOUNDATIONS, tool: NO_TOOL } });

// The signed-in learner's completed Foundations steps, or null when signed out or the database is
// unavailable (pages then render without progress).
export async function getDsaProgress(userId: string | null): Promise<DsaProgress | null> {
  if (!userId) return null;
  try {
    const a = await prisma.assignment.findUnique({
      where: key(userId),
      select: { events: { where: { verified: true }, select: { name: true } } },
    });
    return { done: a ? a.events.map((e) => e.name) : [] };
  } catch {
    return null;
  }
}

async function ensureAssignment(userId: string): Promise<string> {
  const existing = await prisma.assignment.findUnique({ where: key(userId), select: { id: true } });
  if (existing) return existing.id;
  const created = await prisma.assignment
    .create({ data: { userId, slug: DSA_FOUNDATIONS, tool: NO_TOOL, token: randomBytes(9).toString("base64url") }, select: { id: true } })
    .catch(() => null); // lost a race with a concurrent first attempt: read the winner below
  if (created) return created.id;
  return (await prisma.assignment.findUniqueOrThrow({ where: key(userId), select: { id: true } })).id;
}

// Records a quiz attempt. Only a perfect score marks the step done; a done step is never undone.
export async function recordDsaQuiz(userId: string, stepId: string, perfect: boolean): Promise<{ done: number; total: number; stepDone: boolean }> {
  if (!FOUNDATIONS_STEPS.some((s) => s.id === stepId)) throw new Error(`not a DSA step: ${stepId}`);
  const assignmentId = await ensureAssignment(userId);

  if (perfect) {
    const existing = await prisma.assignmentEvent.findUnique({ where: { assignmentId_name: { assignmentId, name: stepId } } });
    const signals = { source: "quiz", score: "5/5" };
    if (!existing) {
      await prisma.assignmentEvent.create({ data: { assignmentId, name: stepId, verified: true, signals } }).catch(() => {});
    } else if (!existing.verified) {
      await prisma.assignmentEvent.update({ where: { id: existing.id }, data: { verified: true, reason: null, signals, createdAt: new Date() } });
    }
  }

  const verified = await prisma.assignmentEvent.findMany({
    where: { assignmentId, verified: true },
    select: { name: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  const doneIds = new Set(verified.map((e) => e.name));
  const done = FOUNDATIONS_STEPS.filter((s) => doneIds.has(s.id)).length;
  if (done >= FOUNDATIONS_STEPS.length) {
    await prisma.assignment.update({ where: { id: assignmentId }, data: { completedAt: verified[0].createdAt } });
  }
  return { done, total: FOUNDATIONS_STEPS.length, stepDone: doneIds.has(stepId) };
}
