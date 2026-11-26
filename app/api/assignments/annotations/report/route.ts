import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ANNOTATIONS, getAssignmentForUser, lastLabVisit, recordReportChecks } from "@/lib/assignments";
import { PLAYWRIGHT } from "@/lib/tools";
import { evaluateAnnotationsReport, reportMatchesLab } from "@/lib/ann-report";

export const dynamic = "force-dynamic";

const MAX_BYTES = 4 * 1024 * 1024; // a JSON report without attachments is far smaller
const lastUpload = new Map<string, number>();

// The learner uploads the JSON report of a run against their lab. Only the checks are kept, never the file.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const a = await getAssignmentForUser(userId, ANNOTATIONS, PLAYWRIGHT);
  if (!a) return NextResponse.json({ error: "Start the assignment first." }, { status: 400 });

  const now = Date.now();
  if (now - (lastUpload.get(userId) ?? 0) < 3000) return NextResponse.json({ error: "Please wait a few seconds before uploading again." }, { status: 429 });
  lastUpload.set(userId, now);

  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > MAX_BYTES) return NextResponse.json({ error: "The report is larger than 4 MB. Run with --reporter=json only (no traces or attachments)." }, { status: 413 });
  const raw = await req.text();
  if (raw.length > MAX_BYTES) return NextResponse.json({ error: "The report is larger than 4 MB. Run with --reporter=json only (no traces or attachments)." }, { status: 413 });

  let report: unknown;
  try {
    report = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "That file isn't valid JSON. Upload the file made by npx playwright test --reporter=json > results.json." }, { status: 400 });
  }

  const result = evaluateAnnotationsReport(report);
  if (!result.tests) return NextResponse.json({ error: "No tests found in this file. Is it a Playwright JSON report?" }, { status: 400 });

  const match = reportMatchesLab(result.startTime, await lastLabVisit(a.token));
  if (!match.ok) return NextResponse.json({ error: match.message, checks: result.checks, tests: result.tests }, { status: 409 });

  const passed = Object.fromEntries(Object.entries(result.checks).map(([k, v]) => [k, v.ok]));
  const assignment = await recordReportChecks(a.token, passed, { tests: result.tests, startTime: result.startTime?.toISOString() ?? "" });
  return NextResponse.json({ checks: result.checks, tests: result.tests, startTime: result.startTime, assignment });
}
