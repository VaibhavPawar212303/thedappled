// Decides whether a demo-page step was driven by an automation tool or done by hand.
// Pure and dependency-free: the browser collects raw signals, the SERVER makes the decision.

export type Signals = {
  webdriver: boolean; // navigator.webdriver (Playwright, Selenium, Puppeteer)
  cypress: boolean; // window.Cypress / window.top.Cypress
  headless: boolean; // "HeadlessChrome" in the browser's user agent
  artifacts: boolean; // leftover Selenium / Puppeteer / PhantomJS markers
  syntheticInput: boolean; // click or key events that were not dispatched by the browser itself
  pointerMoves: number; // trusted mouse/pointer move events since the last step
  keyCount: number; // trusted keydown events since the last step
  keyMeanMs: number; // mean gap between those key events
  keyCv: number; // coefficient of variation of the gaps (jitter)
};

export type Verdict = {
  verified: boolean;
  reason: "no-automation" | "hand-driven" | null;
};

const bool = (v: unknown) => v === true;
const num = (v: unknown, max: number) => (typeof v === "number" && Number.isFinite(v) ? Math.min(Math.max(v, 0), max) : 0);

// Coerces untrusted JSON from the browser into a well-formed Signals object (never throws).
export function sanitizeSignals(raw: unknown): Signals {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    webdriver: bool(r.webdriver),
    cypress: bool(r.cypress),
    headless: bool(r.headless),
    artifacts: bool(r.artifacts),
    syntheticInput: bool(r.syntheticInput),
    pointerMoves: Math.round(num(r.pointerMoves, 100000)),
    keyCount: Math.round(num(r.keyCount, 100000)),
    keyMeanMs: Math.round(num(r.keyMeanMs, 600000)),
    keyCv: Math.round(num(r.keyCv, 100) * 1000) / 1000,
  };
}

// Thresholds are deliberately generous toward automation: a scripted click produces 1–2 mouse
// moves, a person produces dozens. Keystroke rhythm alone is never enough.
export const HUMAN_POINTER_MOVES = 12;
const HUMAN_KEYS = { count: 4, meanMs: 70, cv: 0.3 };
const HUMAN_KEYS_NEEDS_POINTER = 3;

export function verdictFromSignals(s: Signals, serverHeadlessUa: boolean): Verdict {
  const automation = s.webdriver || s.cypress || s.headless || s.artifacts || s.syntheticInput || serverHeadlessUa;
  if (!automation) return { verified: false, reason: "no-automation" };

  const humanKeys = s.keyCount >= HUMAN_KEYS.count && s.keyMeanMs >= HUMAN_KEYS.meanMs && s.keyCv >= HUMAN_KEYS.cv;
  const handDriven = s.pointerMoves >= HUMAN_POINTER_MOVES || (humanKeys && s.pointerMoves >= HUMAN_KEYS_NEEDS_POINTER);
  return handDriven ? { verified: false, reason: "hand-driven" } : { verified: true, reason: null };
}

export type Reason = NonNullable<Verdict["reason"]>;

export const REASON_TEXT: Record<Reason, { short: string; long: string }> = {
  "no-automation": {
    short: "Not counted — done by hand. Run it with your script.",
    long: "This step was done by hand, so it didn’t count.",
  },
  "hand-driven": {
    short: "Not counted — an automation tool was detected, but the step looked hand-driven.",
    long: "An automation tool was detected, but this step looked hand-driven, so it didn’t count.",
  },
};
