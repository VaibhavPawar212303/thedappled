import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getBoard } from "@/lib/leaderboard";
import { getAssignmentForUser } from "@/lib/assignments";
import { LeaderboardView } from "./leaderboard-view";

export const metadata: Metadata = {
  title: "Leaderboard – UI automation assignment",
  description: "See how learners are doing on the UI automation assignment.",
  // Lists people's names, so keep it out of search results (it stays public to anyone with the link).
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const { userId } = await auth();
  const [board, mine] = await Promise.all([
    getBoard(userId),
    userId ? getAssignmentForUser(userId).catch(() => null) : Promise.resolve(null),
  ]);

  return <LeaderboardView board={board} signedIn={Boolean(userId)} hasAssignment={Boolean(mine)} />;
}
