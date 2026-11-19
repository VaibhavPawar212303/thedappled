import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAssignmentForUser, startAssignment } from "@/lib/assignments";

export const dynamic = "force-dynamic";

// GET: the signed-in learner's assignment status (null if not started).
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ assignment: await getAssignmentForUser(userId) });
}

// POST: start the assignment (idempotent: returns the existing one if already started).
export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ assignment: await startAssignment(userId) });
}
