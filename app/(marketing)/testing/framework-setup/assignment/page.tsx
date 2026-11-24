import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { FRAMEWORK_SETUP, getAssignmentForUser } from "@/lib/assignments";
import { demoCredentials } from "@/lib/framework-creds";
import { getRankFor } from "@/lib/leaderboard";
import { chosenTool } from "@/lib/tool-choice";
import { SITE_URL } from "@/lib/seo";
import { FrameworkView } from "../_components/framework-view";

export const metadata: Metadata = {
  title: "Framework setup assignment",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function FrameworkAssignmentPage({ searchParams }: { searchParams: Promise<{ tool?: string }> }) {
  const tool = await chosenTool((await searchParams).tool);
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent(`/testing/framework-setup/assignment?tool=${tool}`)}`);

  const assignment = await getAssignmentForUser(userId, FRAMEWORK_SETUP, tool);
  if (!assignment) redirect(`/testing/framework-setup?tool=${tool}`);

  const c = demoCredentials(assignment.token);
  const env = { BASE_URL: SITE_URL, ASSIGNMENT_TOKEN: assignment.token, DEMO_EMAIL: c.email, DEMO_PASSWORD: c.password };
  const rank = await getRankFor(userId, FRAMEWORK_SETUP, tool).catch(() => null);
  return <FrameworkView key={tool} tool={tool} initial={assignment} env={env} siteUrl={SITE_URL} rank={rank} />;
}
