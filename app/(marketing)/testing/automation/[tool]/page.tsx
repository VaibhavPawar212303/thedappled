import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { isTool, otherTool, TOOLS, TOOL_LABEL, withTool, type Tool } from "@/lib/tools";
import { doneCount, loadRoadmapProgress, TOOL_INFO, TONES, toolSteps } from "../../_components/roadmap-data";
import { StepList, StepsHeader } from "../../_components/step-list";
import { TrackHero } from "../../_components/track-hero";

// Only playwright and cypress exist: any other tool is a real 404, not a streamed not-found page.
// (The page reads the signed-in user, so it still renders per request.)
export const dynamicParams = false;

const BLURB: Record<Tool, string> = {
  playwright: "Set up the framework the way teams do, automate real pages in it, then improve it step by step: page objects, annotations, cross-browser, fixtures and parallel runs.",
  cypress: "The same practice pages with Cypress: the framework first, then commands and retries, page objects, and running on Chrome, Firefox and WebKit.",
};

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ tool }));
}

export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }): Promise<Metadata> {
  const { tool } = await params;
  if (!isTool(tool)) return {};
  return {
    title: `${TOOL_LABEL[tool]} track – ${toolSteps(tool).length} hands-on automation stages`,
    description: BLURB[tool],
    alternates: { canonical: `/testing/automation/${tool}` },
  };
}

// Design: Penpot "26 - Testing Learning Path", page "Roadmap – tracks", board D (Cypress uses the same layout).
export default async function ToolTrackPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;
  if (!isTool(tool)) notFound();
  const { userId } = await auth();
  const progress = await loadRoadmapProgress(userId);
  const info = TOOL_INFO[tool];
  const steps = toolSteps(tool);
  const other = otherTool(tool);
  const t = TONES[info.tone];

  return (
    <div className="bg-background text-foreground">
      <TrackHero
        crumbs={[{ label: "Testing", href: "/testing" }, { label: "Automation", href: "/testing/automation" }, { label: info.title }]}
        label={`Automation · ${info.title} · ${steps.length} stages`}
        title={info.title}
        blurb={BLURB[tool]}
        tone={info.tone}
      />
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <StepsHeader title="Stages" done={doneCount(steps, progress)} total={steps.length} unit="stages done" tone={info.tone} testid={`track-progress-automation-${tool}`} />
        <StepList steps={steps} tone={info.tone} progress={progress} tool={tool} stepTestId={(n) => (tool === "playwright" ? `step-card-${n}` : `cypress-step-card-${n}`)} />
        {info.soon && <p className="mt-3 rounded-2xl border border-dashed px-4 py-3 text-center text-sm font-semibold text-muted-foreground">{info.soon}</p>}
        <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold">
          <Link href={withTool("/testing/leaderboard", tool)} className={`hover:underline ${t.text}`}>View the {info.title} leaderboard →</Link>
          <Link href={`/testing/automation/${other}`} className={`hover:underline ${t.text}`}>Switch to {TOOL_LABEL[other]} →</Link>
        </p>
      </section>
    </div>
  );
}
