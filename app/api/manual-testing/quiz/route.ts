import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { LEADERBOARD_TAG } from "@/lib/leaderboard";
import { MANUAL_STEPS, recordManualQuiz } from "@/lib/assignments";
import { gradeQuiz, manualLesson } from "@/lib/manual-quizzes";

export const dynamic = "force-dynamic";

// Grades a Manual testing quiz for a signed-in learner and saves the result. Only a perfect score
// completes the step; the client's own marking is never trusted. The hint count is reported by the
// client (the hint text is already on the page), so it is an honesty rule, not an anti-cheat.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in to save your progress." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const lesson = manualLesson(typeof body?.lesson === "string" ? body.lesson : "");
  if (!lesson) return NextResponse.json({ error: "Unknown lesson." }, { status: 400 });

  const { score, total } = gradeQuiz(lesson, body?.answers);
  const passed = score === total;
  // Hints the learner opened in this attempt. A pass with any hint completes the step without
  // leaderboard credit.
  const rawHints = Number(body?.hints);
  const hints = Number.isFinite(rawHints) ? Math.min(total, Math.max(0, Math.floor(rawHints))) : 0;
  const { status, counted } = await recordManualQuiz(userId, lesson.step, passed, hints);
  // First attempt adds the learner to the boards; a pass changes their score. Either way, expire the
  // cached boards now so the change is visible on the next leaderboard load.
  revalidateTag(LEADERBOARD_TAG, { expire: 0 });

  return NextResponse.json({
    score,
    total,
    passed,
    hints,
    counted,
    stepDone: status.steps.some((s) => s.id === lesson.step && s.done),
    done: status.done,
    totalSteps: MANUAL_STEPS.length,
  });
}
