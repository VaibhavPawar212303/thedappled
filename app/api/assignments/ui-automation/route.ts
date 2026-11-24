import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAssignmentForUser, startAssignment, UI_AUTOMATION } from "@/lib/assignments";
import { parseTool } from "@/lib/tools";

export const dynamic = "force-dynamic";

// GET: the signed-in learner's assignment status (null if not started).
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ assignment: await getAssignmentForUser(userId, UI_AUTOMATION, parseTool(req.nextUrl.searchParams.get("tool"))) });
}

// ?tool=playwright|cypress picks the track (default Playwright).
// POST: start the assignment (idempotent: returns the existing one if already started).
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ assignment: await startAssignment(userId, UI_AUTOMATION, parseTool(req.nextUrl.searchParams.get("tool"))) });
}
