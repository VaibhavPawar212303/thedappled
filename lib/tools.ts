// The two automation tools. Each automation stage is a separate assignment per tool, so a learner's
// Playwright and Cypress progress (and their leaderboard places) are kept apart.

export const PLAYWRIGHT = "playwright";
export const CYPRESS = "cypress";
export const TOOLS = [PLAYWRIGHT, CYPRESS] as const;
export type Tool = (typeof TOOLS)[number];

// Stored on Manual testing assignments, which don't belong to either tool.
export const NO_TOOL = "none";
export type ToolKey = Tool | typeof NO_TOOL;

export const DEFAULT_TOOL: Tool = PLAYWRIGHT;

export const TOOL_LABEL: Record<Tool, string> = { playwright: "Playwright", cypress: "Cypress" };

export const isTool = (v: unknown): v is Tool => v === PLAYWRIGHT || v === CYPRESS;

// For ?tool= query values and request bodies: anything unknown falls back to the default tool.
export const parseTool = (v: unknown): Tool => (isTool(v) ? v : DEFAULT_TOOL);

export const otherTool = (t: Tool): Tool => (t === PLAYWRIGHT ? CYPRESS : PLAYWRIGHT);

// The learner's last chosen tool, so the stage pages, assignments and leaderboard open on it.
export const TOOL_COOKIE = "testing-tool";

// Adds ?tool= to an internal link (keeps any query it already has).
export const withTool = (href: string, tool: Tool) => `${href}${href.includes("?") ? "&" : "?"}tool=${tool}`;

// Which tool drove the browser, from the signals the demo page reports. Cypress runs inside a browser
// it controls and sets window.Cypress; Playwright sets navigator.webdriver. Null = no tool detected.
export function toolFromSignals(s: { cypress?: boolean; webdriver?: boolean } | null | undefined): Tool | null {
  if (!s) return null;
  if (s.cypress) return CYPRESS;
  if (s.webdriver) return PLAYWRIGHT;
  return null;
}
