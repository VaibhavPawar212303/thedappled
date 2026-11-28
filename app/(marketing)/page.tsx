import { getLandingStats } from "@/actions/get-landing-stats";
import type { Metadata } from "next";
import { automationSlugsFor } from "@/lib/assignments";
import { FOUNDATIONS_STEPS } from "@/lib/dsa-lessons";
import { CYPRESS, PLAYWRIGHT } from "@/lib/tools";
import { MANUAL_STEPS } from "./testing/_components/roadmap-data";
import LandingContent from "./_components/landing-content";

// Keep the page statically generated for speed, but refresh the live
// course/book/article counts periodically instead of freezing them at build time.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    title: "The Dappled (TheDappled) – E-Learning Platform for Developers",
    description:
      "Step-by-step courses, books and articles for developers, plus a free C compiler visualizer that shows the stack and heap as your code runs.",
  },
};

export const revalidate = 3600;

export default async function LandingPage() {
  const stats = await getLandingStats();
  // Real path sizes, read from the same lists the roadmaps use (so the landing page never goes stale).
  const paths = {
    manualSteps: MANUAL_STEPS.length,
    playwrightStages: automationSlugsFor(PLAYWRIGHT).length,
    cypressStages: automationSlugsFor(CYPRESS).length,
    dsaLessons: FOUNDATIONS_STEPS.filter((s) => s.href).length,
    dsaSteps: FOUNDATIONS_STEPS.filter((s) => s.href).map((s) => ({ n: s.n, title: s.title, href: s.href!, isNew: s.id === "dsa-tracing" })),
  };

  return <LandingContent stats={stats} paths={paths} />;
}
