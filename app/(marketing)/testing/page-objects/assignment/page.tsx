import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getAssignmentForUser, PAGE_OBJECTS } from "@/lib/assignments";
import { shopCredentials } from "@/lib/framework-creds";
import { getRankFor } from "@/lib/leaderboard";
import { chosenTool } from "@/lib/tool-choice";
import { SITE_URL } from "@/lib/seo";
import { PomView } from "../_components/pom-view";

export const metadata: Metadata = {
  title: "Page objects assignment",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PageObjectsAssignmentPage({ searchParams }: { searchParams: Promise<{ tool?: string }> }) {
  const tool = await chosenTool((await searchParams).tool);
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent(`/testing/page-objects/assignment?tool=${tool}`)}`);

  const assignment = await getAssignmentForUser(userId, PAGE_OBJECTS, tool);
  if (!assignment) redirect(`/testing/page-objects?tool=${tool}`);

  const c = shopCredentials(assignment.token);
  const env = { BASE_URL: SITE_URL, ASSIGNMENT_TOKEN: assignment.token, SHOP_EMAIL: c.email, SHOP_PASSWORD: c.password };
  const rank = await getRankFor(userId, PAGE_OBJECTS, tool).catch(() => null);
  return <PomView key={tool} tool={tool} initial={assignment} env={env} rank={rank} />;
}
