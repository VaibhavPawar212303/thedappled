import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { FRAMEWORK_SETUP, getAssignmentForUser, startAssignment } from "@/lib/assignments";
import { demoCredentials } from "@/lib/framework-creds";

export const dynamic = "force-dynamic";

// The learner's .env values come with their assignment: the token is theirs, the demo sign-in is derived from it.
function withEnv(a: NonNullable<Awaited<ReturnType<typeof getAssignmentForUser>>>) {
  const c = demoCredentials(a.token);
  return { ...a, env: { ASSIGNMENT_TOKEN: a.token, DEMO_EMAIL: c.email, DEMO_PASSWORD: c.password } };
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const a = await getAssignmentForUser(userId, FRAMEWORK_SETUP);
  return NextResponse.json({ assignment: a ? withEnv(a) : null });
}

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ assignment: withEnv(await startAssignment(userId, FRAMEWORK_SETUP)) });
}
