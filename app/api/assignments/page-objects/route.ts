import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAssignmentForUser, PAGE_OBJECTS, startAssignment } from "@/lib/assignments";
import { parseTool } from "@/lib/tools";
import { shopCredentials } from "@/lib/framework-creds";

export const dynamic = "force-dynamic";

// The learner's .env values come with their assignment: the token is theirs, the shop sign-in is derived from it.
function withEnv(a: NonNullable<Awaited<ReturnType<typeof getAssignmentForUser>>>) {
  const c = shopCredentials(a.token);
  return { ...a, env: { ASSIGNMENT_TOKEN: a.token, SHOP_EMAIL: c.email, SHOP_PASSWORD: c.password } };
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const a = await getAssignmentForUser(userId, PAGE_OBJECTS, parseTool(req.nextUrl.searchParams.get("tool")));
  return NextResponse.json({ assignment: a ? withEnv(a) : null });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ assignment: withEnv(await startAssignment(userId, PAGE_OBJECTS, parseTool(req.nextUrl.searchParams.get("tool")))) });
}
