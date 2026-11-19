import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getAssignmentForUser } from "@/lib/assignments";
import { getRankFor } from "@/lib/leaderboard";
import { SITE_URL } from "@/lib/seo";
import { AssignmentView } from "../_components/assignment-view";

export const metadata: Metadata = {
  title: "UI automation assignment",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AssignmentPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/testing/ui-automation/assignment");

  const assignment = await getAssignmentForUser(userId);
  if (!assignment) redirect("/testing/ui-automation");

  const rank = await getRankFor(userId).catch(() => null);

  return <AssignmentView initial={assignment} siteUrl={SITE_URL} rank={rank} />;
}
