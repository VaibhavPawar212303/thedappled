import { getLandingStats } from "@/actions/get-landing-stats";
import LandingContent from "./_components/landing-content";

// Keep the page statically generated for speed, but refresh the live
// course/book/article counts periodically instead of freezing them at build time.
export const revalidate = 3600;

export default async function LandingPage() {
  const stats = await getLandingStats();

  return <LandingContent stats={stats} />;
}
