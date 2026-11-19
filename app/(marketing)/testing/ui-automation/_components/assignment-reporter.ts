"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import type { StepId } from "@/lib/assignments";
import type { Reason, Signals } from "@/lib/verification";

export const PROGRESS_EVENT = "assignment:progress";

export type Progress = {
  done: number;
  total: number;
  completed: boolean;
  verified?: boolean;
  reason?: Reason | null;
};

const ARTIFACT_RE = /^\$?cdc_|^__nightmare$|^_phantom$|^callPhantom$|^domAutomation|^__webdriver_|^__selenium_|^__driver_|^_Selenium_IDE_Recorder$|^__pw|^__playwright/i;

// Static signals that say "this browser is being driven by a tool". Read once per report.
export function detectAutomationFlags() {
  let cypress = false;
  try {
    cypress = Boolean((window as unknown as { Cypress?: unknown }).Cypress) || Boolean((window.top as unknown as { Cypress?: unknown } | null)?.Cypress);
  } catch {
    cypress = true; // a cross-origin top window around the app is how Cypress/Selenium frames it
  }
  let artifacts = false;
  try {
    artifacts = Object.keys(window).some((k) => ARTIFACT_RE.test(k)) || Object.keys(document).some((k) => ARTIFACT_RE.test(k));
  } catch {}
  return {
    webdriver: navigator.webdriver === true,
    cypress,
    headless: /HeadlessChrome/i.test(navigator.userAgent),
    artifacts,
  };
}

const isAutomated = (f: ReturnType<typeof detectAutomationFlags>) => f.webdriver || f.cypress || f.headless || f.artifacts;

// Reads the learner's personal token from `?a=`, watches how the page is driven (mouse moves, key
// rhythm, synthetic events) and reports each demo-page outcome. Only counts and timings are sent,
// never what is typed. Without a token (normal practice use) it does nothing.
export function useAssignmentReporter() {
  const token = useSearchParams().get("a");
  const stats = React.useRef({ moves: 0, keys: [] as number[], untrusted: 0 });

  React.useEffect(() => {
    if (!token) return;
    const s = stats.current;
    const onMove = (e: Event) => { if (e.isTrusted) s.moves++; };
    const onKey = (e: Event) => { if (e.isTrusted) { if (s.keys.length < 200) s.keys.push(performance.now()); } else s.untrusted++; };
    const onClick = (e: Event) => { if (!e.isTrusted) s.untrusted++; };
    window.addEventListener("pointermove", onMove, { capture: true, passive: true });
    window.addEventListener("keydown", onKey, { capture: true, passive: true });
    window.addEventListener("click", onClick, { capture: true, passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove, true);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("click", onClick, true);
    };
  }, [token]);

  const report = React.useCallback(
    (step: StepId) => {
      if (!token) return;
      const s = stats.current;
      const gaps = s.keys.slice(1).map((t, i) => t - s.keys[i]);
      const mean = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
      const sd = gaps.length ? Math.sqrt(gaps.reduce((a, b) => a + (b - mean) ** 2, 0) / gaps.length) : 0;
      const signals: Signals = {
        ...detectAutomationFlags(),
        syntheticInput: s.untrusted > 0,
        pointerMoves: s.moves,
        keyCount: s.keys.length,
        keyMeanMs: Math.round(mean),
        keyCv: mean ? Math.round((sd / mean) * 1000) / 1000 : 0,
      };
      // Each step is judged on the activity since the previous step.
      s.moves = 0; s.keys = []; s.untrusted = 0;

      fetch("/api/assignments/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, event: step, signals }),
        keepalive: true,
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((p: Progress | null) => {
          if (p) window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: p }));
        })
        .catch(() => {});
    },
    [token],
  );

  return { token, report };
}

export { isAutomated };
