import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import type { Reason, Signals, Verdict } from "@/lib/verification";
import { DEFAULT_TOOL, NO_TOOL, PLAYWRIGHT, type Tool, type ToolKey } from "@/lib/tools";

export const UI_AUTOMATION = "ui-automation";
export const FRAMEWORK_SETUP = "framework-setup";
export const PAGE_OBJECTS = "page-objects";
export const CROSS_BROWSER = "cross-browser";
export const ANNOTATIONS = "annotations";
export const ANNOTATIONS_ADVANCED = "annotations-advanced";
export const FIXTURES_ADVANCED = "fixtures-advanced";
export const PARALLEL_RUNS = "parallel-runs";
export const MANUAL_TESTING = "manual-testing";
export type AssignmentSlug = typeof UI_AUTOMATION | typeof FRAMEWORK_SETUP | typeof PAGE_OBJECTS | typeof CROSS_BROWSER | typeof ANNOTATIONS | typeof ANNOTATIONS_ADVANCED | typeof FIXTURES_ADVANCED | typeof PARALLEL_RUNS | typeof MANUAL_TESTING;
// Learning order: set up the framework, automate pages in it, then improve it step by step.
// Playwright: 1 framework, 2 UI automation, 3 page objects, 4 annotations, 5 cross-browser,
// 6 advanced fixtures, 7 advanced annotations, 8 parallel runs. Cypress: the four shared stages.
export const AUTOMATION_SLUGS = [FRAMEWORK_SETUP, UI_AUTOMATION, PAGE_OBJECTS, ANNOTATIONS, CROSS_BROWSER, FIXTURES_ADVANCED, ANNOTATIONS_ADVANCED, PARALLEL_RUNS] as const;
// Stages that exist for one tool only (Playwright's annotations, fixtures and parallel runs).
export const PLAYWRIGHT_ONLY_SLUGS = new Set<string>([ANNOTATIONS, ANNOTATIONS_ADVANCED, FIXTURES_ADVANCED, PARALLEL_RUNS]);
// The automation stages a tool's learners can take, in learning order.
export const automationSlugsFor = (tool: Tool) => AUTOMATION_SLUGS.filter((s) => tool === PLAYWRIGHT || !PLAYWRIGHT_ONLY_SLUGS.has(s));
// A stage's number on a tool's track (1-based), e.g. stageNumber("cross-browser", "playwright") = 5.
export const stageNumber = (slug: string, tool: Tool) => (automationSlugsFor(tool) as readonly string[]).indexOf(slug) + 1;
export const ASSIGNMENT_SLUGS: AssignmentSlug[] = [MANUAL_TESTING, ...AUTOMATION_SLUGS];
export const isAssignmentSlug = (v: unknown): v is AssignmentSlug => ASSIGNMENT_SLUGS.includes(v as AssignmentSlug);

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
  | "repo-ci"
  | "pom-login"
  | "pom-cart"
  | "pom-checkout"
  | "repo-pages"
  | "repo-fixture"
  | "repo-specs"
  | "xb-chromium"
  | "xb-firefox"
  | "xb-webkit"
  | "repo-browsers"
  | "repo-ci-matrix"
  | "ann-lab"
  | "ann-skip"
  | "ann-fixme"
  | "ann-fail"
  | "ann-slow"
  | "ann-tags"
  | "ann-custom"
  | "repo-forbid-only"
  | "repo-grep-smoke"
  | "repo-describe-runtime"
  | "adv-lab"
  | "adv-group-skip"
  | "adv-hook-fixme"
  | "adv-multi"
  | "adv-title-tag"
  | "adv-hidden"
  | "repo-skip-callback"
  | "repo-fixme-hook"
  | "repo-declared-skip"
  | "repo-grep-combine"
  | "fx-lab"
  | "fx-auto"
  | "fx-worker"
  | "fx-option"
  | "repo-fx-teardown"
  | "repo-fx-merge"
  | "repo-fx-override"
  | "repo-fx-global"
  | "par-lab"
  | "par-file-parallel"
  | "par-serial"
  | "par-unique-data"
  | "par-max-failures"
  | "par-shard"
  | "repo-par-shard-ci"
  | "repo-par-modes"
  | "repo-par-config"
  | "manual-fundamentals"
  | "manual-test-design"
  | "manual-test-cases"
  | "manual-exploratory";

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

// Stage 3. The first three steps come from the learner's test run through the demo shop; the last
// three from a scan of their public GitHub repository (page classes, a fixture, clean specs).
export const POM_STEPS: Step[] = [
  { id: "pom-login", group: "Run your tests", label: "Sign in to the shop through your LoginPage" },
  { id: "pom-cart", group: "Run your tests", label: "Add two products to the cart" },
  { id: "pom-checkout", group: "Run your tests", label: "Checkout shows the order confirmation" },
  { id: "repo-pages", group: "Structure on GitHub", label: "pages/ has LoginPage, ProductsPage and CartPage" },
  { id: "repo-fixture", group: "Structure on GitHub", label: "A fixture provides the page objects to tests" },
  { id: "repo-specs", group: "Structure on GitHub", label: "Spec files use page objects only (no raw locators)" },
];

// Stage 4. The same checkout spec must pass on each browser engine (the engine is read from the request
// on the server, see lib/browser-engine.ts); then a scan of the repo for browser projects and a CI matrix.
export const CROSS_BROWSER_STEPS: Step[] = [
  { id: "xb-chromium", group: "Run on every browser", label: "Checkout spec passes on Chromium" },
  { id: "xb-firefox", group: "Run on every browser", label: "Checkout spec passes on Firefox" },
  { id: "xb-webkit", group: "Run on every browser", label: "Checkout spec passes on WebKit (Safari engine)" },
  { id: "repo-browsers", group: "Configure it on GitHub", label: "Config has chromium, firefox and webkit projects" },
  { id: "repo-ci-matrix", group: "Configure it on GitHub", label: "GitHub Actions runs all three browsers" },
];

// Stage 5 (Playwright only). The lab step comes from the learner's run on the annotations lab; the next
// six from the JSON report of that run (lib/ann-report.ts); the last three from a repo scan (lib/ann-repo-scan.ts).
export const ANNOTATION_STEPS: Step[] = [
  { id: "ann-lab", group: "Run the lab", label: "Your tests opened the annotations lab (automated browser)" },
  { id: "ann-skip", group: "From your test report", label: "Conditional skip with a reason (Copy link on WebKit)" },
  { id: "ann-fixme", group: "From your test report", label: "fixme on the unfinished dark-mode export" },
  { id: "ann-fail", group: "From your test report", label: "fail on the SAVE10 coupon bug, with the outcome “expected”" },
  { id: "ann-slow", group: "From your test report", label: "slow: the 40-second export passes" },
  { id: "ann-tags", group: "From your test report", label: "Tests tagged @smoke and @regression" },
  { id: "ann-custom", group: "From your test report", label: "A custom annotation, e.g. { type: 'issue', description }" },
  { id: "repo-forbid-only", group: "Configure it on GitHub", label: "forbidOnly: !!process.env.CI, and no test.only left in specs" },
  { id: "repo-grep-smoke", group: "Configure it on GitHub", label: "CI or a project runs only @smoke (--grep or grep:)" },
  { id: "repo-describe-runtime", group: "Configure it on GitHub", label: "A tagged describe block and a runtime test.info().annotations" },
];
// Stage 6 (Playwright only): the same three kinds of check as stage 5, for group-level annotations.
// The two group checks compare projects, so learners run chromium, firefox and a mobile device.
export const ADVANCED_STEPS: Step[] = [
  { id: "adv-lab", group: "Run the lab", label: "Your tests opened the advanced lab (automated browser)" },
  { id: "adv-group-skip", group: "From your test report", label: "A describe group is skipped in one project and runs in another (Charts)" },
  { id: "adv-hook-fixme", group: "From your test report", label: "A group is fixme in one project and runs in another (Settings on mobile)" },
  { id: "adv-multi", group: "From your test report", label: "A test with two or more annotations" },
  { id: "adv-title-tag", group: "From your test report", label: "A tag written in a test title (e.g. 'full report @slow')" },
  { id: "adv-hidden", group: "From your test report", label: "A hidden annotation (its type starts with _)" },
  { id: "repo-skip-callback", group: "Configure it on GitHub", label: "test.skip(({ browserName }) => …) inside a describe block" },
  { id: "repo-fixme-hook", group: "Configure it on GitHub", label: "test.fixme(condition, 'why') in a beforeEach hook" },
  { id: "repo-declared-skip", group: "Configure it on GitHub", label: "A declared skip, test.skip('title', …), and an annotated describe" },
  { id: "repo-grep-combine", group: "Configure it on GitHub", label: "CI combines tags: --grep \"@a|@b\" or \"(?=.*@a)(?=.*@b)\"" },
];

// Stage 7 (Playwright only): advanced fixtures. The report checks compare tests, workers and projects
// (lib/fx-report.ts); the repo checks look for teardown, mergeTests, overrides and a global worker hook.
export const FIXTURE_STEPS: Step[] = [
  { id: "fx-lab", group: "Run the lab", label: "Your tests opened the fixtures lab (automated browser)" },
  { id: "fx-auto", group: "From your test report", label: "Every test has the same attachment, added by an auto fixture" },
  { id: "fx-worker", group: "From your test report", label: "One account per worker: same worker, same account" },
  { id: "fx-option", group: "From your test report", label: "The currency option differs between two projects" },
  { id: "repo-fx-teardown", group: "Configure it on GitHub", label: "A fixture cleans up after await use()" },
  { id: "repo-fx-merge", group: "Configure it on GitHub", label: "mergeTests combines two fixture files" },
  { id: "repo-fx-override", group: "Configure it on GitHub", label: "An overridden built-in: page, baseURL or storageState" },
  { id: "repo-fx-global", group: "Configure it on GitHub", label: "A worker auto fixture, and { box: true } or a title" },
];

// Stage 8 (Playwright only): parallel runs and workers. Learners may upload several reports (a normal run,
// a run stopped by maxFailures, a shard); each upload records the checks it passes (lib/par-report.ts).
export const PARALLEL_STEPS: Step[] = [
  { id: "par-lab", group: "Run the lab", label: "Your tests opened the order desk lab (automated browser)" },
  { id: "par-file-parallel", group: "From your test reports", label: "Tests from one file ran at the same time in two workers" },
  { id: "par-serial", group: "From your test reports", label: "A serial group skipped its later tests after a failure" },
  { id: "par-unique-data", group: "From your test reports", label: "Each test's order ID comes from its own testId" },
  { id: "par-max-failures", group: "From your test reports", label: "A maxFailures run stopped early and skipped the rest" },
  { id: "par-shard", group: "From your test reports", label: "A report from a sharded run (--shard=1/2)" },
  { id: "repo-par-shard-ci", group: "Configure it on GitHub", label: "GitHub Actions shards the suite with a matrix" },
  { id: "repo-par-modes", group: "Configure it on GitHub", label: "describe.configure with serial, and parallel or default" },
  { id: "repo-par-config", group: "Configure it on GitHub", label: "Config: fullyParallel, CI-based workers and maxFailures" },
];

export const REPORT_STEPS = new Set<StepId>([
  "ann-skip", "ann-fixme", "ann-fail", "ann-slow", "ann-tags", "ann-custom",
  "adv-group-skip", "adv-hook-fixme", "adv-multi", "adv-title-tag", "adv-hidden",
  "fx-auto", "fx-worker", "fx-option",
  "par-file-parallel", "par-serial", "par-unique-data", "par-max-failures", "par-shard",
]);
// Stages checked from an uploaded report, and the step that records the learner's lab runs.
export const LAB_STEP: Partial<Record<AssignmentSlug, StepId>> = { [ANNOTATIONS]: "ann-lab", [ANNOTATIONS_ADVANCED]: "adv-lab", [FIXTURES_ADVANCED]: "fx-lab", [PARALLEL_RUNS]: "par-lab" };
export const isLabStep = (step: string) => Object.values(LAB_STEP).includes(step as StepId);

export const REPO_STEPS = new Set<StepId>([
  "repo-config", "repo-ignore", "repo-ci", "repo-pages", "repo-fixture", "repo-specs", "repo-browsers", "repo-ci-matrix",
  "repo-forbid-only", "repo-grep-smoke", "repo-describe-runtime",
  "repo-skip-callback", "repo-fixme-hook", "repo-declared-skip", "repo-grep-combine",
  "repo-fx-teardown", "repo-fx-merge", "repo-fx-override", "repo-fx-global",
  "repo-par-shard-ci", "repo-par-modes", "repo-par-config",
]);

// Manual testing track: one step per lesson, done when a signed-in learner scores 5/5 on its quiz
// (graded on the server, see lib/manual-quizzes.ts). Not reported through the automation event API.
export const MANUAL_STEPS: Step[] = [
  { id: "manual-fundamentals", group: "Manual testing", label: "Testing fundamentals" },
  { id: "manual-test-design", group: "Manual testing", label: "Test design techniques" },
  { id: "manual-test-cases", group: "Manual testing", label: "Test cases & bug reports" },
  { id: "manual-exploratory", group: "Manual testing", label: "Exploratory testing" },
];
const MANUAL_STEP_IDS = new Set<string>(MANUAL_STEPS.map((s) => s.id));

const STEPS_BY_SLUG: Record<string, Step[]> = {
  [UI_AUTOMATION]: STEPS,
  [FRAMEWORK_SETUP]: FRAMEWORK_STEPS,
  [PAGE_OBJECTS]: POM_STEPS,
  [CROSS_BROWSER]: CROSS_BROWSER_STEPS,
  [ANNOTATIONS]: ANNOTATION_STEPS,
  [ANNOTATIONS_ADVANCED]: ADVANCED_STEPS,
  [FIXTURES_ADVANCED]: FIXTURE_STEPS,
  [PARALLEL_RUNS]: PARALLEL_STEPS,
  [MANUAL_TESTING]: MANUAL_STEPS,
};
export const stepsFor = (slug: string): Step[] => STEPS_BY_SLUG[slug] ?? STEPS;

const STEP_IDS = new Set<string>([...STEPS, ...FRAMEWORK_STEPS, ...POM_STEPS, ...CROSS_BROWSER_STEPS, ...ANNOTATION_STEPS, ...ADVANCED_STEPS, ...FIXTURE_STEPS, ...PARALLEL_STEPS, ...MANUAL_STEPS].map((s) => s.id));
export const isStepId = (v: unknown): v is StepId => typeof v === "string" && STEP_IDS.has(v);

export type AssignmentStatus = {
  token: string;
  slug: string;
  tool: ToolKey;
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
  tool: string;
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
    tool: a.tool as ToolKey,
    startedAt: a.startedAt.toISOString(),
    // Completion only stands if every step is verified (older, unverified completions don't count).
    completedAt: done >= steps.length && a.completedAt ? a.completedAt.toISOString() : null,
    done,
    total: list.length,
    steps,
  };
}

// Manual testing has one assignment per learner; each automation stage has one per tool, except the
// Playwright-only stages, which are always stored (and ranked) as Playwright.
export const toolKeyFor = (slug: string, tool: Tool = DEFAULT_TOOL): ToolKey =>
  slug === MANUAL_TESTING ? NO_TOOL : PLAYWRIGHT_ONLY_SLUGS.has(slug) ? PLAYWRIGHT : tool;

export async function getAssignmentForUser(userId: string, slug: AssignmentSlug = UI_AUTOMATION, tool: Tool = DEFAULT_TOOL): Promise<AssignmentStatus | null> {
  const a = await prisma.assignment.findUnique({
    where: { userId_slug_tool: { userId, slug, tool: toolKeyFor(slug, tool) } },
    include: { events: true },
  });
  return a ? toStatus(a) : null;
}

export async function startAssignment(userId: string, slug: AssignmentSlug = UI_AUTOMATION, tool: Tool = DEFAULT_TOOL): Promise<AssignmentStatus> {
  const existing = await getAssignmentForUser(userId, slug, tool);
  if (existing) return existing;
  const created = await prisma.assignment
    .create({
      data: { userId, slug, tool: toolKeyFor(slug, tool), token: randomBytes(9).toString("base64url") },
      include: { events: true },
    })
    .catch(async () => null); // lost a race with a concurrent start: read the winner below
  if (created) return toStatus(created);
  return (await getAssignmentForUser(userId, slug, tool))!;
}

// The tool an assignment link belongs to (null = unknown token).
export async function toolOfToken(token: string): Promise<ToolKey | null> {
  const a = await prisma.assignment.findUnique({ where: { token }, select: { tool: true } });
  return a ? (a.tool as ToolKey) : null;
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
  if (a.slug === MANUAL_TESTING || MANUAL_STEP_IDS.has(step)) return null; // manual steps are only completed by passing a quiz
  if (!Object.hasOwn(STEPS_BY_SLUG, a.slug)) return null; // not a Testing assignment (e.g. DSA progress)
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

// Manual testing: records a quiz attempt. The first attempt starts the learner's manual-testing
// record (their start time on the leaderboard); a perfect score marks the step done. A done step is
// never undone by a later attempt. A step passed with hints is done (own progress) but its signals
// carry `hints`, so the leaderboards leave it out; a later clean pass does not change that.
export async function recordManualQuiz(
  userId: string,
  step: StepId,
  perfect: boolean,
  hints = 0,
): Promise<{ status: AssignmentStatus; counted: boolean }> {
  if (!MANUAL_STEP_IDS.has(step)) throw new Error(`not a manual testing step: ${step}`);
  const status = await startAssignment(userId, MANUAL_TESTING);
  if (!perfect) return { status, counted: false };

  const a = await prisma.assignment.findUnique({ where: { token: status.token }, select: { id: true } });
  if (!a) return { status, counted: false };
  const existing = await prisma.assignmentEvent.findUnique({ where: { assignmentId_name: { assignmentId: a.id, name: step } } });
  const detail = { source: "quiz", score: "5/5", hints };
  let counted = hints === 0;
  if (!existing) {
    await prisma.assignmentEvent.create({ data: { assignmentId: a.id, name: step, verified: true, signals: detail } }).catch(() => {});
  } else if (!existing.verified) {
    await prisma.assignmentEvent.update({ where: { id: existing.id }, data: { verified: true, reason: null, signals: detail, createdAt: new Date() } });
  } else {
    counted = countsOnBoard(existing); // already done: keep its original result
  }

  const verifiedEvents = await prisma.assignmentEvent.findMany({
    where: { assignmentId: a.id, verified: true },
    select: { createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  if (verifiedEvents.length >= MANUAL_STEPS.length) {
    await prisma.assignment.update({ where: { id: a.id }, data: { completedAt: verifiedEvents[0].createdAt } });
  }
  return { status: (await getStatusByToken(status.token)) ?? status, counted };
}

// Whether a step event earns leaderboard credit: it must be verified, and a Manual testing quiz
// passed with hints does not count (it still counts as done in the learner's own progress).
export function countsOnBoard(e: { verified: boolean; signals?: unknown }): boolean {
  if (!e.verified) return false;
  const sig = e.signals as { hints?: unknown } | null | undefined;
  return !(sig && typeof sig === "object" && typeof sig.hints === "number" && sig.hints > 0);
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

// Stages 5-8: records the checks that passed in an uploaded test report (never downgrades a verified step).
export async function recordReportChecks(token: string, passed: Partial<Record<StepId, boolean>>, detail: Record<string, string | number>): Promise<AssignmentStatus | null> {
  const a = await prisma.assignment.findUnique({ where: { token }, select: { id: true, slug: true } });
  if (!a || !LAB_STEP[a.slug as AssignmentSlug]) return null;
  const list = stepsFor(a.slug);
  for (const [name, ok] of Object.entries(passed)) {
    if (!ok || !REPORT_STEPS.has(name as StepId) || !list.some((st) => st.id === name)) continue;
    const signals = { source: "report", ...detail };
    const existing = await prisma.assignmentEvent.findUnique({ where: { assignmentId_name: { assignmentId: a.id, name } } });
    if (!existing) {
      await prisma.assignmentEvent.create({ data: { assignmentId: a.id, name, verified: true, signals } }).catch(() => {});
    } else if (!existing.verified) {
      await prisma.assignmentEvent.update({ where: { id: existing.id }, data: { verified: true, reason: null, signals, createdAt: new Date() } });
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

// Stages 5-8: when the learner's tests last drove the lab. An uploaded report must come from a run
// around that time. Kept in the verified lab step's signals.
export async function touchLabVisit(token: string): Promise<void> {
  const a = await prisma.assignment.findUnique({ where: { token }, select: { id: true, slug: true } });
  const lab = a && LAB_STEP[a.slug as AssignmentSlug];
  if (!a || !lab) return;
  const e = await prisma.assignmentEvent.findUnique({ where: { assignmentId_name: { assignmentId: a.id, name: lab } } });
  if (!e?.verified) return;
  const prev = e.signals && typeof e.signals === "object" && !Array.isArray(e.signals) ? (e.signals as Record<string, unknown>) : {};
  await prisma.assignmentEvent.update({ where: { id: e.id }, data: { signals: { ...prev, lastSeenAt: new Date().toISOString() } as object } });
}

// The last time the learner's tests drove the lab (null = no verified lab run yet).
export async function lastLabVisit(token: string): Promise<Date | null> {
  const a = await prisma.assignment.findUnique({ where: { token }, select: { id: true, slug: true } });
  const lab = a && LAB_STEP[a.slug as AssignmentSlug];
  if (!a || !lab) return null;
  const e = await prisma.assignmentEvent.findUnique({ where: { assignmentId_name: { assignmentId: a.id, name: lab } } });
  if (!e?.verified) return null;
  const seen = (e.signals as { lastSeenAt?: unknown } | null)?.lastSeenAt;
  return typeof seen === "string" && !Number.isNaN(Date.parse(seen)) ? new Date(seen) : e.createdAt;
}
