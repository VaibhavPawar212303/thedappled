import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import type { Reason, Signals, Verdict } from "@/lib/verification";

export const UI_AUTOMATION = "ui-automation";
export const FRAMEWORK_SETUP = "framework-setup";
export type AssignmentSlug = typeof UI_AUTOMATION | typeof FRAMEWORK_SETUP;

export type StepId =
  | "login-empty"
  | "login-wrong"
  | "login-success"
  | "signup-empty"
  | "signup-mismatch"
  | "signup-success"
  | "env-login"
  | "env-login-wrong"
  | "repo-config"
  | "repo-ignore"
  | "repo-ci";

type Step = { id: StepId; group: string; label: string };

export const STEPS: Step[] = [
  { id: "login-empty", group: "Sign in", label: "Empty form shows both field errors" },
  { id: "login-wrong", group: "Sign in", label: "Wrong password shows the error banner" },
  { id: "login-success", group: "Sign in", label: "Valid credentials show the welcome message" },
  { id: "signup-empty", group: "Sign up", label: "Empty form shows all five field errors" },
  { id: "signup-mismatch", group: "Sign up", label: "Mismatched passwords show an error" },
  { id: "signup-success", group: "Sign up", label: "Valid details + terms show the success message" },
];

// Stage 2. The first two steps are verified from the learner's automated test run on the demo
// sign-in page; the last three come from a scan of their public GitHub repository.
export const FRAMEWORK_STEPS: Step[] = [
  { id: "env-login", group: "Run your tests", label: "Sign in with the credentials from your .env file" },
  { id: "env-login-wrong", group: "Run your tests", label: "Wrong password shows the error (same config)" },
  { id: "repo-config", group: "Save it on GitHub", label: "Config reads values from .env (playwright / cypress config)" },
  { id: "repo-ignore", group: "Save it on GitHub", label: ".env is git-ignored and .env.example is committed" },
  { id: "repo-ci", group: "Save it on GitHub", label: "GitHub Actions run uses repository secrets" },
];

export const REPO_STEPS = new Set<StepId>(["repo-config", "repo-ignore", "repo-ci"]);

const STEPS_BY_SLUG: Record<string, Step[]> = { [UI_AUTOMATION]: STEPS, [FRAMEWORK_SETUP]: FRAMEWORK_STEPS };
export const stepsFor = (slug: string): Step[] => STEPS_BY_SLUG[slug] ?? STEPS;

const STEP_IDS = new Set<string>([...STEPS, ...FRAMEWORK_STEPS].map((s) => s.id));
export const isStepId = (v: unknown): v is StepId => typeof v === "string" && STEP_IDS.has(v);

export type AssignmentStatus = {
  token: string;
  slug: string;
  startedAt: string;
  completedAt: string | null;
  done: number;
  total: number;
  // done = verified as automated. rejected = the latest attempt did not count (and why).
  steps: { id: StepId; done: boolean; at: string | null; rejected: Reason | null }[];
};

type AssignmentWithEvents = {
  token: string;
  slug: string;
  startedAt: Date;
  completedAt: Date | null;
  events: { name: string; createdAt: Date; verified: boolean; reason: string | null }[];
};

export function toStatus(a: AssignmentWithEvents): AssignmentStatus {
  const byName = new Map(a.events.map((e) => [e.name, e]));
  const list = stepsFor(a.slug);
  const steps = list.map((s) => {
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
    slug: a.slug,
    startedAt: a.startedAt.toISOString(),
    // Completion only stands if every step is verified (older, unverified completions don't count).
    completedAt: done >= steps.length && a.completedAt ? a.completedAt.toISOString() : null,
    done,
    total: list.length,
    steps,
  };
}

export async function getAssignmentForUser(userId: string, slug: AssignmentSlug = UI_AUTOMATION): Promise<AssignmentStatus | null> {
  const a = await prisma.assignment.findUnique({
    where: { userId_slug: { userId, slug } },
    include: { events: true },
  });
  return a ? toStatus(a) : null;
}

export async function startAssignment(userId: string, slug: AssignmentSlug = UI_AUTOMATION): Promise<AssignmentStatus> {
  const existing = await getAssignmentForUser(userId, slug);
  if (existing) return existing;
  const created = await prisma.assignment
    .create({
      data: { userId, slug, token: randomBytes(9).toString("base64url") },
      include: { events: true },
    })
    .catch(async () => null); // lost a race with a concurrent start: read the winner below
  if (created) return toStatus(created);
  return (await getAssignmentForUser(userId, slug))!;
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
  const a = await prisma.assignment.findUnique({ where: { token }, select: { id: true, slug: true } });
  if (!a) return null;
  const list = stepsFor(a.slug);
  if (!list.some((s) => s.id === step)) return null; // step belongs to a different stage

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
  if (verifiedEvents.length >= list.length) {
    // Completion time = when the last required step was verified.
    await prisma.assignment.update({ where: { id: a.id }, data: { completedAt: verifiedEvents[0].createdAt } });
  }

  const status = await getStatusByToken(token);
  if (!status) return null;
  const mine = status.steps.find((s) => s.id === step);
  return { status, verified: Boolean(mine?.done), reason: mine?.done ? null : (mine?.rejected ?? verdict.reason) };
}

// Records the outcome of a repository scan. A passing check becomes a verified step (never
// downgraded later, like the test-run steps); a failing one leaves the step as it was.
export async function recordRepoChecks(
  token: string,
  repo: string,
  passed: Partial<Record<StepId, boolean>>,
): Promise<AssignmentStatus | null> {
  const a = await prisma.assignment.findUnique({ where: { token }, select: { id: true, slug: true } });
  if (!a) return null;
  const list = stepsFor(a.slug);
  for (const [name, ok] of Object.entries(passed)) {
    if (!ok || !REPO_STEPS.has(name as StepId) || !list.some((st) => st.id === name)) continue;
    const detail = { source: "github", repo };
    const existing = await prisma.assignmentEvent.findUnique({ where: { assignmentId_name: { assignmentId: a.id, name } } });
    if (!existing) {
      await prisma.assignmentEvent.create({ data: { assignmentId: a.id, name, verified: true, signals: detail } }).catch(() => {});
    } else if (!existing.verified) {
      await prisma.assignmentEvent.update({ where: { id: existing.id }, data: { verified: true, reason: null, signals: detail, createdAt: new Date() } });
    }
  }
  const verifiedEvents = await prisma.assignmentEvent.findMany({
    where: { assignmentId: a.id, verified: true },
    select: { createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  if (verifiedEvents.length >= list.length) {
    await prisma.assignment.update({ where: { id: a.id }, data: { completedAt: verifiedEvents[0].createdAt } });
  }
  return getStatusByToken(token);
}
