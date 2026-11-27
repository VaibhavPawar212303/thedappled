import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { PARALLEL_RUNS, getAssignmentForUser } from "@/lib/assignments";
import { getRankFor } from "@/lib/leaderboard";
import { PLAYWRIGHT } from "@/lib/tools";
import { SITE_URL } from "@/lib/seo";
import { AnnView } from "../../annotations/_components/ann-view";

export const metadata: Metadata = {
  title: "Parallel runs assignment",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Design: Penpot "26 - Testing Learning Path", page "Stage 8 – Parallel runs & workers", board C.
export default async function ParallelRunsAssignmentPage() {
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent("/testing/parallel-runs/assignment")}`);

  const assignment = await getAssignmentForUser(userId, PARALLEL_RUNS, PLAYWRIGHT);
  if (!assignment) redirect("/testing/parallel-runs");

  const rank = await getRankFor(userId, PARALLEL_RUNS, PLAYWRIGHT).catch(() => null);
  return <AnnView slug="parallel-runs" initial={assignment} env={{ BASE_URL: SITE_URL, ASSIGNMENT_TOKEN: assignment.token }} rank={rank} />;
}
