import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { MANUAL_STEPS, recordManualQuiz } from "@/lib/assignments";
import { gradeQuiz, manualLesson } from "@/lib/manual-quizzes";

export const dynamic = "force-dynamic";

// Grades a Manual testing quiz for a signed-in learner and saves the result. Only a perfect score
// completes the step; the client's own marking is never trusted.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in to save your progress." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const lesson = manualLesson(typeof body?.lesson === "string" ? body.lesson : "");
  if (!lesson) return NextResponse.json({ error: "Unknown lesson." }, { status: 400 });

  const { score, total } = gradeQuiz(lesson, body?.answers);
  const passed = score === total;
  const status = await recordManualQuiz(userId, lesson.step, passed);

  return NextResponse.json({
    score,
    total,
    passed,
    stepDone: status.steps.some((s) => s.id === lesson.step && s.done),
    done: status.done,
    totalSteps: MANUAL_STEPS.length,
  });
}
