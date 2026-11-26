import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ANNOTATIONS, getAssignmentForUser, startAssignment } from "@/lib/assignments";
import { PLAYWRIGHT } from "@/lib/tools";

export const dynamic = "force-dynamic";

// Stage 5 is Playwright only: any ?tool= is ignored.
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ assignment: await getAssignmentForUser(userId, ANNOTATIONS, PLAYWRIGHT) });
}

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ assignment: await startAssignment(userId, ANNOTATIONS, PLAYWRIGHT) });
}
