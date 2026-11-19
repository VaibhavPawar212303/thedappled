import { NextRequest, NextResponse } from "next/server";
import { getStatusByToken, isStepId, recordEvent } from "@/lib/assignments";
import { sanitizeSignals, verdictFromSignals } from "@/lib/verification";

export const dynamic = "force-dynamic";

const TOKEN_RE = /^[A-Za-z0-9_-]{6,40}$/;

// Public on purpose: the demo pages are opened by the learner's script (not signed in) and
// authenticate with the personal token from the assignment link. Only whitelisted step ids are
// accepted. The browser sends raw signals; the verdict is decided here, never by the client.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = body?.token;
  const step = body?.event;
  if (typeof token !== "string" || !TOKEN_RE.test(token) || !isStepId(step)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const signals = sanitizeSignals(body?.signals);
  const serverHeadlessUa = /HeadlessChrome/i.test(req.headers.get("user-agent") ?? "");
  const verdict = verdictFromSignals(signals, serverHeadlessUa);

  const result = await recordEvent(token, step, verdict, signals);
  if (!result) return NextResponse.json({ error: "Unknown assignment" }, { status: 404 });

  const { status } = result;
  return NextResponse.json({
    done: status.done,
    total: status.total,
    completed: Boolean(status.completedAt),
    verified: result.verified,
    reason: result.reason,
  });
}

// GET ?token=… : progress counter for the "assignment mode" banner on the demo pages.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (!TOKEN_RE.test(token)) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const status = await getStatusByToken(token);
  if (!status) return NextResponse.json({ error: "Unknown assignment" }, { status: 404 });
  return NextResponse.json({ done: status.done, total: status.total, completed: Boolean(status.completedAt) });
}
