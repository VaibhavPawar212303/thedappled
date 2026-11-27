import { automationSlugsFor, getAssignmentForUser } from "@/lib/assignments";
import { getManualProgress } from "@/lib/manual-progress";
import { TOOLS as AUTOMATION_TOOLS, type Tool } from "@/lib/tools";

// The testing roadmap as tracks → tools → steps. Used by /testing (track cards), /testing/manual,
// /testing/automation (tool cards), /testing/automation/[tool] and /testing/mobile.
// Design: Penpot "26 - Testing Learning Path", page "Roadmap – tracks".

export type Tone = "blue" | "purple" | "green";

export const TONES: Record<Tone, { chip: string; text: string; bar: string; soft: string; border: string; button: string; blob: string }> = {
  blue: {
    chip: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    text: "text-blue-600 dark:text-blue-400",
    bar: "bg-blue-600",
    soft: "bg-blue-200 dark:bg-blue-900",
    border: "border-blue-600",
    button: "bg-blue-600 text-white hover:bg-blue-700",
    blob: "bg-blue-200/60 dark:bg-blue-900/20",
  },
  purple: {
    chip: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    text: "text-purple-600 dark:text-purple-400",
    bar: "bg-purple-600",
    soft: "bg-purple-200 dark:bg-purple-900",
    border: "border-purple-600",
    button: "bg-purple-600 text-white hover:bg-purple-700",
    blob: "bg-purple-200/60 dark:bg-purple-900/20",
  },
  green: {
    chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    text: "text-emerald-700 dark:text-emerald-400",
    bar: "bg-emerald-600",
    soft: "bg-emerald-200 dark:bg-emerald-900",
    border: "border-emerald-600",
    button: "bg-emerald-600 text-white hover:bg-emerald-700",
    blob: "bg-emerald-200/60 dark:bg-emerald-900/20",
  },
};

// progressKey: the Manual testing step id, or "<tool>:<stage slug>" for an automation stage (progress is kept per tool).
export type Step = { n: number; title: string; blurb: string; href?: string; isNew?: boolean; progressKey: string };

export const MANUAL_STEPS: Step[] = [
  { n: 1, title: "Testing fundamentals", blurb: "SDLC and STLC, test levels and types, and what makes a good tester.", href: "/testing/manual-testing/fundamentals", progressKey: "manual-fundamentals" },
  { n: 2, title: "Test design techniques", blurb: "Equivalence partitioning, boundary values and decision tables.", href: "/testing/manual-testing/test-design", progressKey: "manual-test-design" },
  { n: 3, title: "Test cases & bug reports", blurb: "Write clear test cases and defect reports with steps, severity and priority.", href: "/testing/manual-testing/test-cases", progressKey: "manual-test-cases" },
  { n: 4, title: "Exploratory testing", blurb: "Charters, time-boxed sessions and notes that find real bugs.", href: "/testing/manual-testing/exploratory", progressKey: "manual-exploratory" },
];

// Every automation stage. The order (and so each stage's number) comes from automationSlugsFor(tool)
// in lib/assignments: framework setup first, then each stage improves on the last.
// Design: Penpot "26 - Testing Learning Path", page "Roadmap – tracks", board D.
const STAGES: Record<string, { title: string; href: string; blurb: string | Record<Tool, string>; isNew?: boolean }> = {
  "framework-setup": {
    title: "Framework setup",
    href: "/testing/framework-setup",
    blurb: {
      playwright: "Config and credentials in .env, tests that read them, and the project on GitHub with secrets.",
      cypress: "cypress.config and env values, tests that read them, and the project on GitHub with secrets.",
    },
  },
  "ui-automation": {
    title: "UI automation",
    href: "/testing/ui-automation",
    blurb: {
      playwright: "Write tests in your framework: locators, waits, assertions and debugging on real sign-in and sign-up pages.",
      cypress: "Write tests in your framework: cy commands, retries and assertions on real sign-in and sign-up pages.",
    },
  },
  "page-objects": {
    title: "Page objects & fixtures",
    href: "/testing/page-objects",
    blurb: {
      playwright: "Move locators into page classes, share setup with fixtures, keep specs readable.",
      cypress: "Page classes and custom commands, so specs stay short and readable.",
    },
  },
  annotations: { title: "Playwright annotations", href: "/testing/annotations", blurb: "skip, fixme, fail, slow, only, tags and custom annotations." },
  "cross-browser": {
    title: "Cross-browser testing",
    href: "/testing/cross-browser",
    blurb: {
      playwright: "Run the same spec on Chromium, Firefox and WebKit, locally and in GitHub Actions.",
      cypress: "Run the same spec on Chrome, Firefox and WebKit, locally and in GitHub Actions.",
    },
  },
  "fixtures-advanced": { title: "Advanced fixtures", href: "/testing/fixtures-advanced", blurb: "Teardown, worker, auto and option fixtures, overrides and mergeTests." },
  "annotations-advanced": { title: "Advanced annotations", href: "/testing/annotations-advanced", blurb: "Group skip, fixme in hooks, several annotations, --grep OR and AND." },
  "parallel-runs": { title: "Parallel runs & workers", href: "/testing/parallel-runs", blurb: "Workers, parallel and serial modes, maxFailures and sharding.", isNew: true },
};

export function toolSteps(tool: Tool): Step[] {
  return automationSlugsFor(tool).map((slug, i) => {
    const st = STAGES[slug];
    return { n: i + 1, title: st.title, blurb: typeof st.blurb === "string" ? st.blurb : st.blurb[tool], href: st.href, isNew: st.isNew, progressKey: `${tool}:${slug}` };
  });
}

export const TOOL_INFO: Record<Tool, { title: string; tone: Tone; blurb: string; chips: string[]; soon?: string }> = {
  playwright: {
    title: "Playwright",
    tone: "purple",
    blurb: "Set up the framework the way teams do, automate real pages in it, then improve it step by step: page objects, annotations, cross-browser, fixtures and parallel runs.",
    chips: ["Framework", "UI automation", "Page objects", "Annotations", "Cross-browser", "Fixtures", "Parallel"],
  },
  cypress: {
    title: "Cypress",
    tone: "green",
    blurb: "The same practice pages with Cypress: the framework first, then commands and retries, page objects, and Chrome, Firefox and WebKit in CI.",
    chips: ["Framework", "UI automation", "Page objects", "Cross-browser"],
    soon: "More Cypress stages coming soon",
  },
};

// A signed-in learner's state for each step. "active" = in progress (automation: started, not
// complete) or up next (manual: the first step not yet done).
export type StepState = { state: "done" | "active" | "todo"; done: number; total: number };
export type Progress = Map<string, StepState>;

export async function loadRoadmapProgress(userId: string | null): Promise<Progress | null> {
  if (!userId) return null;
  try {
    const keys = AUTOMATION_TOOLS.flatMap((tool) => automationSlugsFor(tool).map((slug) => ({ tool, slug })));
    const [manual, ...autos] = await Promise.all([getManualProgress(userId), ...keys.map((k) => getAssignmentForUser(userId, k.slug, k.tool))]);
    const map: Progress = new Map();
    const manualDone = new Set<string>(manual?.done ?? []);
    let upNextSet = false;
    for (const st of MANUAL_STEPS) {
      const done = manualDone.has(st.progressKey);
      const active = !done && !upNextSet;
      if (active) upNextSet = true;
      map.set(st.progressKey, { state: done ? "done" : active ? "active" : "todo", done: done ? 1 : 0, total: 1 });
    }
    keys.forEach(({ tool, slug }, i) => {
      const a = autos[i];
      map.set(`${tool}:${slug}`, !a ? { state: "todo", done: 0, total: 0 } : a.completedAt ? { state: "done", done: a.total, total: a.total } : { state: "active", done: a.done, total: a.total });
    });
    return map;
  } catch {
    return null; // database unavailable: show the roadmap without progress
  }
}

export const doneCount = (steps: Step[], progress: Progress | null) => (progress ? steps.filter((s) => progress.get(s.progressKey)?.state === "done").length : 0);
