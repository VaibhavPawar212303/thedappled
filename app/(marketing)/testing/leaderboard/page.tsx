import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getAllTracksBoard, getBoard } from "@/lib/leaderboard";
import { getAssignmentForUser, isAssignmentSlug } from "@/lib/assignments";
import { LeaderboardView } from "./leaderboard-view";
import { AllTracksView } from "./all-tracks-view";

export const metadata: Metadata = {
  title: "Leaderboard – Testing assignments",
  description: "See how learners are doing across the Testing tracks — manual testing and automation.",
  // Lists people's names, so keep it out of search results (it stays public to anyone with the link).
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

// ?stage=<slug> shows one track's board; no stage (or an unknown one) shows the All tracks board.
export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ stage?: string }> }) {
  const { stage: raw } = await searchParams;
  const { userId } = await auth();

  if (!isAssignmentSlug(raw)) {
    const board = await getAllTracksBoard(userId);
    return <AllTracksView board={board} signedIn={Boolean(userId)} />;
  }

  const [board, mine] = await Promise.all([
    getBoard(userId, raw),
    userId ? getAssignmentForUser(userId, raw).catch(() => null) : Promise.resolve(null),
  ]);
  return <LeaderboardView stage={raw} board={board} signedIn={Boolean(userId)} hasAssignment={Boolean(mine)} />;
}
