import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { doneCount, loadRoadmapProgress, MANUAL_STEPS } from "../_components/roadmap-data";
import { StepList, StepsHeader } from "../_components/step-list";
import { TrackHero } from "../_components/track-hero";

export const metadata: Metadata = {
  title: "Manual testing track – fundamentals, test design, bug reports, exploratory testing",
  description:
    "The manual testing track: testing fundamentals, test design techniques, test cases and bug reports, and exploratory testing. Each step ends with a 5-question quiz.",
  alternates: { canonical: "/testing/manual" },
};

export const dynamic = "force-dynamic";

// Design: Penpot "26 - Testing Learning Path", page "Roadmap – tracks", board B.
export default async function ManualTrackPage() {
  const { userId } = await auth();
  const progress = await loadRoadmapProgress(userId);

  return (
    <div className="bg-background text-foreground">
      <TrackHero
        crumbs={[{ label: "Testing", href: "/testing" }, { label: "Manual testing" }]}
        label={`Track · Beginner · ${MANUAL_STEPS.length} steps`}
        title="Manual testing"
        blurb="Learn how testers think before you automate: plan tests, design cases, report bugs clearly and explore an app to find what breaks."
        tone="blue"
      />
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <StepsHeader title="Steps" done={doneCount(MANUAL_STEPS, progress)} total={MANUAL_STEPS.length} unit="done" tone="blue" testid="track-progress-manual-testing" />
        <StepList steps={MANUAL_STEPS} tone="blue" progress={progress} stepTestId={(n) => `manual-step-card-${n}`} activeLabel="Up next" />
        <p className="mt-6 text-sm text-muted-foreground">
          Each step ends with a 5-question quiz. 5 of 5 marks it done.{" "}
          <Link href="/testing/leaderboard?stage=manual-testing" className="font-bold text-blue-600 hover:underline dark:text-blue-400">View the manual testing leaderboard →</Link>
        </p>
      </section>
    </div>
  );
}
