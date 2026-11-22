import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getAssignmentForUser, PAGE_OBJECTS } from "@/lib/assignments";
import { shopCredentials } from "@/lib/framework-creds";
import { getRankFor } from "@/lib/leaderboard";
import { SITE_URL } from "@/lib/seo";
import { PomView } from "../_components/pom-view";

export const metadata: Metadata = {
  title: "Page objects assignment",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PageObjectsAssignmentPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/testing/page-objects/assignment");

  const assignment = await getAssignmentForUser(userId, PAGE_OBJECTS);
  if (!assignment) redirect("/testing/page-objects");

  const c = shopCredentials(assignment.token);
  const env = { BASE_URL: SITE_URL, ASSIGNMENT_TOKEN: assignment.token, SHOP_EMAIL: c.email, SHOP_PASSWORD: c.password };
  const rank = await getRankFor(userId, PAGE_OBJECTS).catch(() => null);
  return <PomView initial={assignment} env={env} rank={rank} />;
}
