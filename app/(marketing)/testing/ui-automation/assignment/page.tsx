import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getAssignmentForUser, UI_AUTOMATION } from "@/lib/assignments";
import { getRankFor } from "@/lib/leaderboard";
import { chosenTool } from "@/lib/tool-choice";
import { SITE_URL } from "@/lib/seo";
import { AssignmentView } from "../_components/assignment-view";

export const metadata: Metadata = {
  title: "UI automation assignment",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AssignmentPage({ searchParams }: { searchParams: Promise<{ tool?: string }> }) {
  const tool = await chosenTool((await searchParams).tool);
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent(`/testing/ui-automation/assignment?tool=${tool}`)}`);

  const assignment = await getAssignmentForUser(userId, UI_AUTOMATION, tool);
  if (!assignment) redirect(`/testing/ui-automation?tool=${tool}`);

  const rank = await getRankFor(userId, UI_AUTOMATION, tool).catch(() => null);

  return <AssignmentView key={tool} tool={tool} initial={assignment} siteUrl={SITE_URL} rank={rank} />;
}
