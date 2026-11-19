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
  pointerTurns: number; // direction changes in the mouse path (people curve, scripts jump in straight lines)
  clickCount: number; // trusted mouse clicks since the last step
  clickHoldMs: number; // median time the button was held down (scripts: ~0 ms, people: 60+ ms)
  clickOffsetPx: number; // median distance of the click from the element's exact centre (scripts: 0)
  keyHoldMs: number; // median time a key was held down
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
    pointerTurns: Math.round(num(r.pointerTurns, 100000)),
    clickCount: Math.round(num(r.clickCount, 100000)),
    clickHoldMs: Math.round(num(r.clickHoldMs, 600000) * 10) / 10,
    clickOffsetPx: Math.round(num(r.clickOffsetPx, 100000) * 10) / 10,
    keyHoldMs: Math.round(num(r.keyHoldMs, 600000) * 10) / 10,
  };
}

// Evidence 1 - the browser says it is automated (flags, headless UA, Cypress, synthetic events).
// Evidence 2 - the input itself is machine-made, whatever the browser claims. Many setups hide the
// flags (e.g. --disable-blink-features=AutomationControlled), but a scripted click is still held for
// ~0 ms and lands exactly on the element's centre, and scripted typing has near-constant gaps.
export const ROBOT_CLICK = { holdMs: 8, offsetPx: 1.5 };
export const ROBOT_KEYS = { count: 6, maxCv: 0.1 };

// Evidence against: the mouse path looks like a person's (many moves that curve), or typing has a
// human rhythm together with mouse activity. A scripted click produces 1-2 moves and a straight line.
export const HUMAN_PATH = { moves: 40, turns: 5 };
const HUMAN_KEYS = { count: 4, meanMs: 70, cv: 0.3 };
const HUMAN_KEYS_PATH = { moves: 10, turns: 3 };

export function verdictFromSignals(s: Signals, serverHeadlessUa: boolean): Verdict {
  const flags = s.webdriver || s.cypress || s.headless || s.artifacts || s.syntheticInput || serverHeadlessUa;
  const robotClicks = s.clickCount >= 1 && s.clickHoldMs <= ROBOT_CLICK.holdMs && s.clickOffsetPx <= ROBOT_CLICK.offsetPx;
  const robotKeys = s.keyCount >= ROBOT_KEYS.count && s.keyCv <= ROBOT_KEYS.maxCv;
  if (!(flags || robotClicks || robotKeys)) return { verified: false, reason: "no-automation" };

  const humanKeys = s.keyCount >= HUMAN_KEYS.count && s.keyMeanMs >= HUMAN_KEYS.meanMs && s.keyCv >= HUMAN_KEYS.cv;
  const humanPath = s.pointerMoves >= HUMAN_PATH.moves && s.pointerTurns >= HUMAN_PATH.turns;
  const humanTyping = humanKeys && s.pointerMoves >= HUMAN_KEYS_PATH.moves && s.pointerTurns >= HUMAN_KEYS_PATH.turns;
  return humanPath || humanTyping ? { verified: false, reason: "hand-driven" } : { verified: true, reason: null };
}

// A short, plain-English summary of what the page saw, shown to the learner when a step does not count.
export function describeSignals(s: Signals): string {
  const flags = [s.webdriver && "webdriver", s.cypress && "Cypress", s.headless && "headless", s.artifacts && "driver markers", s.syntheticInput && "synthetic events"].filter(Boolean);
  const parts = [`Browser flags: ${flags.length ? flags.join(", ") : "none"}`];
  parts.push(s.clickCount ? `clicks held ${s.clickHoldMs} ms, ${s.clickOffsetPx} px from centre` : "no mouse clicks");
  if (s.keyCount) parts.push(`${s.keyCount} key presses, rhythm variation ${Math.round(s.keyCv * 100)}%`);
  parts.push(`${s.pointerMoves} mouse moves (${s.pointerTurns} turns)`);
  return parts.join(" · ");
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
