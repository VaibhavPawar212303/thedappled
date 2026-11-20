import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { FRAMEWORK_SETUP, getAssignmentForUser } from "@/lib/assignments";
import { demoCredentials } from "@/lib/framework-creds";
import { getRankFor } from "@/lib/leaderboard";
import { SITE_URL } from "@/lib/seo";
import { FrameworkView } from "../_components/framework-view";

export const metadata: Metadata = {
  title: "Framework setup assignment",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function FrameworkAssignmentPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/testing/framework-setup/assignment");

  const assignment = await getAssignmentForUser(userId, FRAMEWORK_SETUP);
  if (!assignment) redirect("/testing/framework-setup");

  const c = demoCredentials(assignment.token);
  const env = { BASE_URL: SITE_URL, ASSIGNMENT_TOKEN: assignment.token, DEMO_EMAIL: c.email, DEMO_PASSWORD: c.password };
  const rank = await getRankFor(userId, FRAMEWORK_SETUP).catch(() => null);
  return <FrameworkView initial={assignment} env={env} siteUrl={SITE_URL} rank={rank} />;
}
