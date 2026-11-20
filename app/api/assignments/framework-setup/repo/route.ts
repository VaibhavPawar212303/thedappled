import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { FRAMEWORK_SETUP, getAssignmentForUser } from "@/lib/assignments";
import { checkRepoForAssignment } from "@/lib/framework-repo-check";
import { RepoError } from "@/lib/repo-scan";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// One scan per learner every 8 seconds (each scan makes several GitHub requests).
const lastScan = new Map<string, number>();

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const a = await getAssignmentForUser(userId, FRAMEWORK_SETUP);
  if (!a) return NextResponse.json({ error: "Start the assignment first." }, { status: 400 });

  const body = await req.json().catch(() => null);
  if (typeof body?.repoUrl !== "string") return NextResponse.json({ error: "Enter your GitHub repository URL." }, { status: 400 });

  const now = Date.now();
  if (now - (lastScan.get(userId) ?? 0) < 8000) return NextResponse.json({ error: "Please wait a few seconds before checking again." }, { status: 429 });
  lastScan.set(userId, now);

  try {
    return NextResponse.json(await checkRepoForAssignment(a.token, body.repoUrl));
  } catch (e) {
    if (e instanceof RepoError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Could not check the repository. Try again." }, { status: 502 });
  }
}
