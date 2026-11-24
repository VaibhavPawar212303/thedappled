"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import type { StepId } from "@/lib/assignments";
import type { Reason, Signals } from "@/lib/verification";
import type { ToolKey } from "@/lib/tools";

export const PROGRESS_EVENT = "assignment:progress";
export const REFUSED_EVENT = "assignment:refused"; // detail: message for the learner

export type Progress = {
  done: number;
  total: number;
  completed: boolean;
  tool?: ToolKey; // the track this assignment link belongs to
  verified?: boolean;
  reason?: Reason | null;
  seen?: string; // plain-English summary of the signals, only sent when a step did not count
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
type Collected = {
  moves: number;
  turns: number;
  lastX: number | null;
  lastY: number | null;
  lastAngle: number | null;
  keys: number[];
  keyHolds: number[];
  downAt: Record<string, number>;
  untrusted: number;
  clicks: { hold: number; off: number }[];
  pointerDownAt: number | null;
};

const fresh = (): Collected => ({ moves: 0, turns: 0, lastX: null, lastY: null, lastAngle: null, keys: [], keyHolds: [], downAt: {}, untrusted: 0, clicks: [], pointerDownAt: null });

const median = (xs: number[]) => {
  if (!xs.length) return 0;
  const a = [...xs].sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
};

// Reads the learner's personal token from `?a=`, watches how the page is driven (mouse path, click
// and key timing, synthetic events) and reports each demo-page outcome. Only counts and timings are
// sent, never what is typed. Without a token (normal practice use) it does nothing.
export function useAssignmentReporter() {
  const token = useSearchParams().get("a");
  const stats = React.useRef<Collected>(fresh());

  React.useEffect(() => {
    if (!token) return;
    const onMove = (e: Event) => {
      if (!e.isTrusted) return;
      const s = stats.current;
      const { clientX: x, clientY: y } = e as PointerEvent;
      if (s.lastX !== null && s.lastY !== null) {
        const dx = x - s.lastX;
        const dy = y - s.lastY;
        if (Math.hypot(dx, dy) < 2) return; // fake/zero moves after layout shifts are not mouse movement
        const angle = Math.atan2(dy, dx);
        if (s.lastAngle !== null) {
          let d = Math.abs(angle - s.lastAngle);
          if (d > Math.PI) d = 2 * Math.PI - d;
          if (d > 0.35) s.turns++;
        }
        s.lastAngle = angle;
      }
      s.lastX = x;
      s.lastY = y;
      s.moves++;
    };
    const onPointerDown = (e: Event) => { if (e.isTrusted) stats.current.pointerDownAt = e.timeStamp; };
    const onPointerUp = (e: Event) => {
      const s = stats.current;
      if (!e.isTrusted || s.pointerDownAt === null) return;
      const pe = e as PointerEvent;
      const el = (e.target as Element | null);
      const target = el?.closest?.("button,a,input,label,select,textarea,[role=button]") ?? el;
      const r = target?.getBoundingClientRect();
      if (r) s.clicks.push({ hold: e.timeStamp - s.pointerDownAt, off: Math.hypot(pe.clientX - (r.left + r.width / 2), pe.clientY - (r.top + r.height / 2)) });
      s.pointerDownAt = null;
    };
    const onKeyDown = (e: Event) => {
      const s = stats.current;
      if (!e.isTrusted) { s.untrusted++; return; }
      const k = e as KeyboardEvent;
      if (k.repeat) return;
      if (s.keys.length < 200) s.keys.push(e.timeStamp);
      s.downAt[k.code] = e.timeStamp;
    };
    const onKeyUp = (e: Event) => {
      const s = stats.current;
      const k = e as KeyboardEvent;
      if (e.isTrusted && s.downAt[k.code] !== undefined) {
        if (s.keyHolds.length < 200) s.keyHolds.push(e.timeStamp - s.downAt[k.code]);
        delete s.downAt[k.code];
      }
    };
    const onClick = (e: Event) => { if (!e.isTrusted) stats.current.untrusted++; };
    const opts = { capture: true, passive: true } as const;
    window.addEventListener("pointermove", onMove, opts);
    window.addEventListener("pointerdown", onPointerDown, opts);
    window.addEventListener("pointerup", onPointerUp, opts);
    window.addEventListener("keydown", onKeyDown, opts);
    window.addEventListener("keyup", onKeyUp, opts);
    window.addEventListener("click", onClick, opts);
    return () => {
      window.removeEventListener("pointermove", onMove, true);
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pointerup", onPointerUp, true);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
      window.removeEventListener("click", onClick, true);
    };
  }, [token]);

  const report = React.useCallback(
    (step: StepId, extra?: { engine?: string }) => {
      if (!token) return;
      const s = stats.current;
      const gaps = s.keys.slice(1).map((t, i) => t - s.keys[i]);
      const mean = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
      const sd = gaps.length ? Math.sqrt(gaps.reduce((a, b) => a + (b - mean) ** 2, 0) / gaps.length) : 0;
      const signals: Signals = {
        ...detectAutomationFlags(),
        syntheticInput: s.untrusted > 0,
        pointerMoves: s.moves,
        pointerTurns: s.turns,
        keyCount: s.keys.length,
        keyMeanMs: Math.round(mean),
        keyCv: mean ? Math.round((sd / mean) * 1000) / 1000 : 0,
        keyHoldMs: Math.round(median(s.keyHolds) * 10) / 10,
        clickCount: s.clicks.length,
        clickHoldMs: Math.round(median(s.clicks.map((c) => c.hold)) * 10) / 10,
        clickOffsetPx: Math.round(median(s.clicks.map((c) => c.off)) * 10) / 10,
      };
      // Each step is judged on the activity since the previous step.
      stats.current = fresh();

      fetch("/api/assignments/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, event: step, signals, ...extra }),
        keepalive: true,
      })
        .then(async (r) => {
          if (r.ok) return (await r.json()) as Progress;
          // A run by the other tool on this track's link is refused with a message for the learner.
          const d = r.status === 409 ? await r.json().catch(() => null) : null;
          if (typeof d?.message === "string") window.dispatchEvent(new CustomEvent(REFUSED_EVENT, { detail: d.message }));
          return null;
        })
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
