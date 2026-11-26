import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ANNOTATIONS_ADVANCED, getAssignmentForUser } from "@/lib/assignments";
import { getRankFor } from "@/lib/leaderboard";
import { PLAYWRIGHT } from "@/lib/tools";
import { SITE_URL } from "@/lib/seo";
import { AnnView } from "../../annotations/_components/ann-view";

export const metadata: Metadata = {
  title: "Advanced annotations assignment",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Design: Penpot "26 - Testing Learning Path", page "Stage 6 – Advanced annotations", board C.
export default async function AdvancedAnnotationsAssignmentPage() {
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent("/testing/annotations-advanced/assignment")}`);

  const assignment = await getAssignmentForUser(userId, ANNOTATIONS_ADVANCED, PLAYWRIGHT);
  if (!assignment) redirect("/testing/annotations-advanced");

  const rank = await getRankFor(userId, ANNOTATIONS_ADVANCED, PLAYWRIGHT).catch(() => null);
  return <AnnView slug="annotations-advanced" initial={assignment} env={{ BASE_URL: SITE_URL, ASSIGNMENT_TOKEN: assignment.token }} rank={rank} />;
}
