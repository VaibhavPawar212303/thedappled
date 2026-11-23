import { getLandingStats } from "@/actions/get-landing-stats";
import type { Metadata } from "next";
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

  return <LandingContent stats={stats} />;
}
