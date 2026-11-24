import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { CROSS_BROWSER, getAssignmentForUser } from "@/lib/assignments";
import { crossBrowserCredentials } from "@/lib/framework-creds";
import { getRankFor } from "@/lib/leaderboard";
import { chosenTool } from "@/lib/tool-choice";
import { SITE_URL } from "@/lib/seo";
import { XbView } from "../_components/xb-view";

export const metadata: Metadata = {
  title: "Cross-browser assignment",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CrossBrowserAssignmentPage({ searchParams }: { searchParams: Promise<{ tool?: string }> }) {
  const tool = await chosenTool((await searchParams).tool);
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent(`/testing/cross-browser/assignment?tool=${tool}`)}`);

  const assignment = await getAssignmentForUser(userId, CROSS_BROWSER, tool);
  if (!assignment) redirect(`/testing/cross-browser?tool=${tool}`);

  const c = crossBrowserCredentials(assignment.token);
  const env = { BASE_URL: SITE_URL, ASSIGNMENT_TOKEN: assignment.token, SHOP_EMAIL: c.email, SHOP_PASSWORD: c.password };
  const rank = await getRankFor(userId, CROSS_BROWSER, tool).catch(() => null);
  return <XbView key={tool} tool={tool} initial={assignment} env={env} rank={rank} />;
}
