import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getBoard } from "@/lib/leaderboard";
import { FRAMEWORK_SETUP, getAssignmentForUser, UI_AUTOMATION, type AssignmentSlug } from "@/lib/assignments";
import { LeaderboardView } from "./leaderboard-view";

export const metadata: Metadata = {
  title: "Leaderboard – Testing assignments",
  description: "See how learners are doing on the Testing assignments.",
  // Lists people's names, so keep it out of search results (it stays public to anyone with the link).
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ stage?: string }> }) {
  const { stage: raw } = await searchParams;
  const stage: AssignmentSlug = raw === FRAMEWORK_SETUP ? FRAMEWORK_SETUP : UI_AUTOMATION;

  const { userId } = await auth();
  const [board, mine] = await Promise.all([
    getBoard(userId, stage),
    userId ? getAssignmentForUser(userId, stage).catch(() => null) : Promise.resolve(null),
  ]);

  return <LeaderboardView stage={stage} board={board} signedIn={Boolean(userId)} hasAssignment={Boolean(mine)} />;
}
