import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAssignmentForUser, lastLabVisit, recordReportChecks, startAssignment, type AssignmentSlug, type AssignmentStatus } from "@/lib/assignments";
import { PLAYWRIGHT } from "@/lib/tools";
import { reportMatchesLab, type ReportCheck } from "@/lib/ann-report";
import { RepoError } from "@/lib/repo-scan";

// API handlers shared by the two Playwright-only annotation stages (5 and 6). Each stage passes its own
// report evaluator and repo check; the flow (auth, rate limits, lab-time match, recording) is the same.

type Evaluated = { checks: Record<string, ReportCheck>; tests: number; startTime: Date | null };

export function statusHandlers(slug: AssignmentSlug) {
  return {
    async GET() {
      const { userId } = await auth();
      if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return NextResponse.json({ assignment: await getAssignmentForUser(userId, slug, PLAYWRIGHT) });
    },
    async POST() {
      const { userId } = await auth();
      if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return NextResponse.json({ assignment: await startAssignment(userId, slug, PLAYWRIGHT) });
    },
  };
}

const MAX_BYTES = 4 * 1024 * 1024; // a JSON report without attachments is far smaller
const TOO_BIG = "The report is larger than 4 MB. Run with --reporter=json only (no traces or attachments).";

// The learner uploads the JSON report of a run against their lab. Only the checks are kept, never the file.
export function reportHandler(slug: AssignmentSlug, evaluate: (report: unknown) => Evaluated) {
  const lastUpload = new Map<string, number>();
  return async function POST(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const a = await getAssignmentForUser(userId, slug, PLAYWRIGHT);
    if (!a) return NextResponse.json({ error: "Start the assignment first." }, { status: 400 });

    const now = Date.now();
    if (now - (lastUpload.get(userId) ?? 0) < 3000) return NextResponse.json({ error: "Please wait a few seconds before uploading again." }, { status: 429 });
    lastUpload.set(userId, now);

    if (Number(req.headers.get("content-length") ?? 0) > MAX_BYTES) return NextResponse.json({ error: TOO_BIG }, { status: 413 });
    const raw = await req.text();
    if (raw.length > MAX_BYTES) return NextResponse.json({ error: TOO_BIG }, { status: 413 });

    let report: unknown;
    try {
      report = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "That file isn't valid JSON. Upload the file made by npx playwright test --reporter=json > results.json." }, { status: 400 });
    }

    const result = evaluate(report);
    if (!result.tests) return NextResponse.json({ error: "No tests found in this file. Is it a Playwright JSON report?" }, { status: 400 });

    const match = reportMatchesLab(result.startTime, await lastLabVisit(a.token));
    if (!match.ok) return NextResponse.json({ error: match.message, checks: result.checks, tests: result.tests }, { status: 409 });

    const passed = Object.fromEntries(Object.entries(result.checks).map(([k, v]) => [k, v.ok]));
    const assignment = await recordReportChecks(a.token, passed, { tests: result.tests, startTime: result.startTime?.toISOString() ?? "" });
    return NextResponse.json({ checks: result.checks, tests: result.tests, startTime: result.startTime, assignment });
  };
}

// One scan per learner every 8 seconds (each scan makes several GitHub requests).
export function repoHandler(slug: AssignmentSlug, check: (token: string, repoUrl: string) => Promise<{ assignment: AssignmentStatus | null }>) {
  const lastScan = new Map<string, number>();
  return async function POST(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const a = await getAssignmentForUser(userId, slug, PLAYWRIGHT);
    if (!a) return NextResponse.json({ error: "Start the assignment first." }, { status: 400 });

    const body = await req.json().catch(() => null);
    if (typeof body?.repoUrl !== "string") return NextResponse.json({ error: "Enter your GitHub repository URL." }, { status: 400 });

    const now = Date.now();
    if (now - (lastScan.get(userId) ?? 0) < 8000) return NextResponse.json({ error: "Please wait a few seconds before checking again." }, { status: 429 });
    lastScan.set(userId, now);

    try {
      return NextResponse.json(await check(a.token, body.repoUrl));
    } catch (e) {
      if (e instanceof RepoError) return NextResponse.json({ error: e.message }, { status: e.status });
      return NextResponse.json({ error: "Could not check the repository. Try again." }, { status: 502 });
    }
  };
}
