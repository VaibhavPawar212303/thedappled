import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";
import { PAGE_OBJECTS } from "@/lib/assignments";
import { shopCredentials } from "@/lib/framework-creds";

export const dynamic = "force-dynamic";

const TOKEN_RE = /^[A-Za-z0-9_-]{6,40}$/;
const same = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

// Public on purpose: the learner's script opens the demo shop without a session. The shop posts
// what was typed here; the expected values are derived from the token on the server only.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { token, email, password } = body ?? {};
  if (typeof token !== "string" || !TOKEN_RE.test(token) || typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const a = await prisma.assignment.findUnique({ where: { token }, select: { slug: true } });
  if (!a || a.slug !== PAGE_OBJECTS) return NextResponse.json({ error: "Unknown assignment" }, { status: 404 });

  const want = shopCredentials(token);
  const ok = same(email.trim().toLowerCase(), want.email) && same(password, want.password);
  return NextResponse.json({ ok });
}
