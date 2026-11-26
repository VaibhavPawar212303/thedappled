import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getAllTracksBoard, getBoard } from "@/lib/leaderboard";
import { getAssignmentForUser, isAssignmentSlug, PLAYWRIGHT_ONLY_SLUGS } from "@/lib/assignments";
import { PLAYWRIGHT } from "@/lib/tools";
import { chosenTool } from "@/lib/tool-choice";
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
// ?tool=playwright|cypress picks the tool (automation boards are ranked per tool; Manual testing is shared).
export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ stage?: string; tool?: string }> }) {
  const { stage: raw, tool: rawTool } = await searchParams;
  const tool = await chosenTool(rawTool);
  const { userId } = await auth();

  if (!isAssignmentSlug(raw)) {
    const board = await getAllTracksBoard(userId, tool);
    return <AllTracksView board={board} signedIn={Boolean(userId)} tool={tool} />;
  }

  // A Playwright-only stage has one board, whatever tool was chosen.
  if (PLAYWRIGHT_ONLY_SLUGS.has(raw) && tool !== PLAYWRIGHT) redirect(`/testing/leaderboard?stage=${raw}&tool=${PLAYWRIGHT}`);

  const [board, mine] = await Promise.all([
    getBoard(userId, raw, tool),
    userId ? getAssignmentForUser(userId, raw, tool).catch(() => null) : Promise.resolve(null),
  ]);
  return <LeaderboardView stage={raw} board={board} signedIn={Boolean(userId)} hasAssignment={Boolean(mine)} tool={tool} />;
}
