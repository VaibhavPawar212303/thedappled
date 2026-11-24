import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { DSA_QUIZZES, gradeDsaQuiz } from "@/lib/dsa-lessons";
import { recordDsaQuiz } from "@/lib/dsa-progress";

export const dynamic = "force-dynamic";

// Grades a DSA lesson quiz for a signed-in learner and saves the result. Only a perfect score
// completes the step; the client's own marking is never trusted.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in to save your progress." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const step = typeof body?.step === "string" ? body.step : "";
  const questions = Object.hasOwn(DSA_QUIZZES, step) ? DSA_QUIZZES[step] : undefined;
  if (!questions) return NextResponse.json({ error: "Unknown lesson." }, { status: 400 });

  const { score, total } = gradeDsaQuiz(questions, body?.answers);
  const passed = score === total;
  const saved = await recordDsaQuiz(userId, step, passed);

  return NextResponse.json({ score, total, passed, stepDone: saved.stepDone, done: saved.done, totalSteps: saved.total });
}
