// Stage 4 (cross-browser): which browser engine ran a step. Pure and dependency-free.
// The server reads the engine from the request's User-Agent; the page also names the engine it
// detected from browser features. A step only counts when both agree.

export type Engine = "chromium" | "firefox" | "webkit";
export const ENGINES: Engine[] = ["chromium", "firefox", "webkit"];
export const ENGINE_LABEL: Record<Engine, string> = { chromium: "Chromium", firefox: "Firefox", webkit: "WebKit" };

export const isEngine = (v: unknown): v is Engine => typeof v === "string" && (ENGINES as string[]).includes(v);

// Playwright's WebKit and desktop Safari send "AppleWebKit … Version/x Safari/…" with no Chrome
// token; Chromium-based browsers (Chrome, Edge, Electron, headless shell) all send Chrome/ or
// HeadlessChrome/; Firefox sends Firefox/ (Gecko).
export function engineFromUserAgent(ua: string): Engine | null {
  if (/\bFirefox\/\d/.test(ua)) return "firefox";
  if (/\b(HeadlessChrome|Chrome|Chromium|CriOS|Edg|Electron)\/\d/.test(ua)) return "chromium";
  if (/AppleWebKit\/\d/.test(ua)) return "webkit";
  return null;
}

export const engineStep = (e: Engine) => `xb-${e}` as const;
export const engineOfStep = (step: string): Engine | null => {
  const e = step.startsWith("xb-") ? step.slice(3) : "";
  return isEngine(e) ? e : null;
};
