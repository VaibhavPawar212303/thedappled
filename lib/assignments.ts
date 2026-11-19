import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import type { Reason, Signals, Verdict } from "@/lib/verification";

export const UI_AUTOMATION = "ui-automation";

export type StepId =
  | "login-empty"
  | "login-wrong"
  | "login-success"
  | "signup-empty"
  | "signup-mismatch"
  | "signup-success";

export const STEPS: { id: StepId; group: "Sign in" | "Sign up"; label: string }[] = [
  { id: "login-empty", group: "Sign in", label: "Empty form shows both field errors" },
  { id: "login-wrong", group: "Sign in", label: "Wrong password shows the error banner" },
  { id: "login-success", group: "Sign in", label: "Valid credentials show the welcome message" },
  { id: "signup-empty", group: "Sign up", label: "Empty form shows all five field errors" },
  { id: "signup-mismatch", group: "Sign up", label: "Mismatched passwords show an error" },
  { id: "signup-success", group: "Sign up", label: "Valid details + terms show the success message" },
];

const STEP_IDS = new Set<string>(STEPS.map((s) => s.id));
export const isStepId = (v: unknown): v is StepId => typeof v === "string" && STEP_IDS.has(v);

export type AssignmentStatus = {
  token: string;
  startedAt: string;
  completedAt: string | null;
  done: number;
  total: number;
  // done = verified as automated. rejected = the latest attempt did not count (and why).
  steps: { id: StepId; done: boolean; at: string | null; rejected: Reason | null }[];
};

type AssignmentWithEvents = {
  token: string;
  startedAt: Date;
  completedAt: Date | null;
  events: { name: string; createdAt: Date; verified: boolean; reason: string | null }[];
};

export function toStatus(a: AssignmentWithEvents): AssignmentStatus {
  const byName = new Map(a.events.map((e) => [e.name, e]));
  const steps = STEPS.map((s) => {
    const e = byName.get(s.id);
    const done = Boolean(e?.verified);
    return {
      id: s.id,
      done,
      at: done ? e!.createdAt.toISOString() : null,
      rejected: !done && e && (e.reason === "no-automation" || e.reason === "hand-driven") ? (e.reason as Reason) : null,
    };
  });
  const done = steps.filter((s) => s.done).length;
  return {
    token: a.token,
    startedAt: a.startedAt.toISOString(),
    // Completion only stands if every step is verified (older, unverified completions don't count).
    completedAt: done >= steps.length && a.completedAt ? a.completedAt.toISOString() : null,
    done,
    total: STEPS.length,
    steps,
  };
}

export async function getAssignmentForUser(userId: string): Promise<AssignmentStatus | null> {
  const a = await prisma.assignment.findUnique({
    where: { userId_slug: { userId, slug: UI_AUTOMATION } },
    include: { events: true },
  });
  return a ? toStatus(a) : null;
}

export async function startAssignment(userId: string): Promise<AssignmentStatus> {
  const existing = await getAssignmentForUser(userId);
  if (existing) return existing;
  const created = await prisma.assignment
    .create({
      data: { userId, slug: UI_AUTOMATION, token: randomBytes(9).toString("base64url") },
      include: { events: true },
    })
    .catch(async () => null); // lost a race with a concurrent start: read the winner below
  if (created) return toStatus(created);
  return (await getAssignmentForUser(userId))!;
}

export async function getStatusByToken(token: string): Promise<AssignmentStatus | null> {
  const a = await prisma.assignment.findUnique({ where: { token }, include: { events: true } });
  return a ? toStatus(a) : null;
}

export type RecordResult = {
  status: AssignmentStatus;
  verified: boolean;
  reason: Reason | null;
};

// Records one attempt at a step. Only verified attempts count; a verified step is never
// downgraded, and an earlier hand-done attempt is upgraded by a later automated one.
export async function recordEvent(token: string, step: StepId, verdict: Verdict, signals: Signals): Promise<RecordResult | null> {
  const a = await prisma.assignment.findUnique({ where: { token }, select: { id: true } });
  if (!a) return null;

  const existing = await prisma.assignmentEvent.findUnique({
    where: { assignmentId_name: { assignmentId: a.id, name: step } },
  });

  if (!existing) {
    await prisma.assignmentEvent
      .create({ data: { assignmentId: a.id, name: step, verified: verdict.verified, reason: verdict.reason, signals } })
      .catch(() => {}); // concurrent first attempt: the row exists now, fall through to re-read below
  } else if (!existing.verified) {
    // Unverified so far: a verified attempt upgrades it (new timestamp); another failed one just refreshes the reason.
    await prisma.assignmentEvent.update({
      where: { id: existing.id },
      data: verdict.verified
        ? { verified: true, reason: null, signals, createdAt: new Date() }
        : { reason: verdict.reason, signals },
    });
  }

  const verifiedEvents = await prisma.assignmentEvent.findMany({
    where: { assignmentId: a.id, verified: true },
    select: { createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  if (verifiedEvents.length >= STEPS.length) {
    // Completion time = when the last required step was verified.
    await prisma.assignment.update({ where: { id: a.id }, data: { completedAt: verifiedEvents[0].createdAt } });
  }

  const status = await getStatusByToken(token);
  if (!status) return null;
  const mine = status.steps.find((s) => s.id === step);
  return { status, verified: Boolean(mine?.done), reason: mine?.done ? null : (mine?.rejected ?? verdict.reason) };
}
