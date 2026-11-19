import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";

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
  steps: { id: StepId; done: boolean; at: string | null }[];
};

type AssignmentWithEvents = {
  token: string;
  startedAt: Date;
  completedAt: Date | null;
  events: { name: string; createdAt: Date }[];
};

export function toStatus(a: AssignmentWithEvents): AssignmentStatus {
  const seen = new Map(a.events.map((e) => [e.name, e.createdAt]));
  const steps = STEPS.map((s) => ({
    id: s.id,
    done: seen.has(s.id),
    at: seen.get(s.id)?.toISOString() ?? null,
  }));
  return {
    token: a.token,
    startedAt: a.startedAt.toISOString(),
    completedAt: a.completedAt?.toISOString() ?? null,
    done: steps.filter((s) => s.done).length,
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

// Records one step (idempotent) and completes the assignment once every step has been seen.
export async function recordEvent(token: string, step: StepId): Promise<AssignmentStatus | null> {
  const a = await prisma.assignment.findUnique({ where: { token }, select: { id: true } });
  if (!a) return null;
  await prisma.assignmentEvent.upsert({
    where: { assignmentId_name: { assignmentId: a.id, name: step } },
    create: { assignmentId: a.id, name: step },
    update: {},
  });
  const count = await prisma.assignmentEvent.count({ where: { assignmentId: a.id } });
  if (count >= STEPS.length) {
    await prisma.assignment.updateMany({ where: { id: a.id, completedAt: null }, data: { completedAt: new Date() } });
  }
  return getStatusByToken(token);
}
