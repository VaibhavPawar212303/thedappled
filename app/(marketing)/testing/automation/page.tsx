import type { Metadata } from "next";
import { FlaskConical, Play } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { TOOLS } from "@/lib/tools";
import { doneCount, loadRoadmapProgress, TOOL_INFO, toolSteps } from "../_components/roadmap-data";
import { TrackCard } from "../_components/track-card";
import { TrackHero } from "../_components/track-hero";

export const metadata: Metadata = {
  title: "Automation track – Playwright and Cypress assignments",
  description:
    "The automation track: pick Playwright or Cypress. Each tool is its own set of hands-on assignments, from UI automation and the framework to page objects, cross-browser runs and more.",
  alternates: { canonical: "/testing/automation" },
};

export const dynamic = "force-dynamic";

const ICON = { playwright: Play, cypress: FlaskConical } as const;

// Design: Penpot "26 - Testing Learning Path", page "Roadmap – tracks", board C.
export default async function AutomationTrackPage() {
  const { userId } = await auth();
  const progress = await loadRoadmapProgress(userId);

  return (
    <div className="bg-background text-foreground">
      <TrackHero
        crumbs={[{ label: "Testing", href: "/testing" }, { label: "Automation" }]}
        label={`Track · Intermediate · ${TOOLS.length} tools`}
        title="Automation"
        blurb="Automate real web pages. Pick a tool: each one is its own set of assignments with its own progress and leaderboard."
        tone="purple"
      />
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <div className="grid items-stretch gap-6 md:grid-cols-2">
          {TOOLS.map((tool) => {
            const info = TOOL_INFO[tool];
            const steps = toolSteps(tool);
            const fresh = steps.filter((s) => s.isNew).length;
            return (
              <TrackCard
                key={tool}
                href={`/testing/automation/${tool}`}
                testid={`tool-${tool}`}
                tone={info.tone}
                Icon={ICON[tool]}
                title={info.title}
                meta={`${steps.length} stages`}
                pills={fresh ? [{ label: `${fresh} new`, tone: "green" }] : []}
                blurb={info.blurb}
                chips={info.chips}
                progress={progress && { done: doneCount(steps, progress), total: steps.length, unit: "stages done" }}
                cta={`Open ${info.title}`}
              />
            );
          })}
        </div>
        <p className="mt-8 text-center text-sm font-medium text-muted-foreground">Not sure? Playwright has more stages; Cypress is popular in front-end teams. You can do both.</p>
      </section>
    </div>
  );
}
