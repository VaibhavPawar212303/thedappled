import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ANNOTATIONS, getAssignmentForUser } from "@/lib/assignments";
import { getRankFor } from "@/lib/leaderboard";
import { PLAYWRIGHT } from "@/lib/tools";
import { SITE_URL } from "@/lib/seo";
import { AnnView } from "../_components/ann-view";

export const metadata: Metadata = {
  title: "Playwright annotations assignment",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AnnotationsAssignmentPage() {
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent("/testing/annotations/assignment")}`);

  const assignment = await getAssignmentForUser(userId, ANNOTATIONS, PLAYWRIGHT);
  if (!assignment) redirect("/testing/annotations");

  const rank = await getRankFor(userId, ANNOTATIONS, PLAYWRIGHT).catch(() => null);
  return <AnnView initial={assignment} env={{ BASE_URL: SITE_URL, ASSIGNMENT_TOKEN: assignment.token }} rank={rank} />;
}
