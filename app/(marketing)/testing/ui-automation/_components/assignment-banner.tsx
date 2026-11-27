"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { PROGRESS_EVENT, REFUSED_EVENT, detectAutomationFlags, isAutomated, type Progress } from "./assignment-reporter";
import { REASON_TEXT } from "@/lib/verification";
import { isTool, TOOL_LABEL } from "@/lib/tools";

// Shown on the demo pages only when opened from an assignment link (`?a=<token>`).
export function AssignmentBanner() {
  const token = useSearchParams().get("a");
  const path = usePathname();
  const stage = path.startsWith("/testing/framework-setup")
    ? "framework-setup"
    : path.startsWith("/testing/page-objects")
      ? "page-objects"
      : path.startsWith("/testing/cross-browser")
        ? "cross-browser"
        : path.startsWith("/testing/fixtures-advanced")
        ? "fixtures-advanced"
        : path.startsWith("/testing/annotations-advanced")
          ? "annotations-advanced"
          : path.startsWith("/testing/annotations")
            ? "annotations"
            : "ui-automation";
  const [p, setP] = React.useState<Progress | null>(null);
  const [automated, setAutomated] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (!token) return;
    setAutomated(isAutomated(detectAutomationFlags()));
    let alive = true;
    fetch(`/api/assignments/event?token=${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && d && setP(d))
      .catch(() => {});
    const onProgress = (e: Event) => setP((e as CustomEvent<Progress>).detail);
    window.addEventListener(PROGRESS_EVENT, onProgress);
    return () => {
      alive = false;
      window.removeEventListener(PROGRESS_EVENT, onProgress);
    };
  }, [token]);

  if (!token) return null;

  // Flags are visible at load, but scripts that hide them are only recognised from how they click
  // and type, so a verified step also proves automation.
  const proven = p?.verified === true;
  const manual = automated === false && !proven;
  const tool = p && isTool(p.tool) ? p.tool : null;
  const link = (
    <Link href={`/testing/${stage}/assignment${tool ? `?tool=${tool}` : ""}`} className="underline underline-offset-2">
      View assignment →
    </Link>
  );

  return (
    <div
      data-testid="assignment-banner"
      data-mode={automated === null ? "checking" : manual ? "manual" : "automated"}
      role="status"
      className={`${manual ? "bg-amber-700" : stage === "framework-setup" || stage === "annotations" || stage === "annotations-advanced" || stage === "fixtures-advanced" ? "bg-purple-700" : stage === "cross-browser" ? "bg-blue-700" : "bg-emerald-700"} text-white`}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-3 text-sm font-semibold md:px-8">
        <span>
          {automated === null
            ? "● Checking how this page is being driven…"
            : manual
              ? "⚠ No automation detected yet — steps done by hand won’t count. Run it with Playwright, Cypress or Selenium."
              : `● Automation detected — your steps are being recorded${tool ? ` on the ${TOOL_LABEL[tool]} track` : ""}.`}
        </span>
        <span className={manual ? "text-amber-100" : stage === "framework-setup" || stage === "annotations" || stage === "annotations-advanced" || stage === "fixtures-advanced" ? "text-purple-100" : stage === "cross-browser" ? "text-blue-100" : "text-emerald-100"}>
          {!manual && (p ? `${p.done} of ${p.total} verified · ` : "")}
          {link}
        </span>
      </div>
    </div>
  );
}

// The result of the latest step, shown under the form: counted, or why it did not count.
export function AssignmentNote() {
  const token = useSearchParams().get("a");
  const [p, setP] = React.useState<Progress | null>(null);
  const [refused, setRefused] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!token) return;
    const onProgress = (e: Event) => {
      setRefused(null);
      setP((e as CustomEvent<Progress>).detail);
    };
    const onRefused = (e: Event) => setRefused((e as CustomEvent<string>).detail);
    window.addEventListener(PROGRESS_EVENT, onProgress);
    window.addEventListener(REFUSED_EVENT, onRefused);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, onProgress);
      window.removeEventListener(REFUSED_EVENT, onRefused);
    };
  }, [token]);

  if (token && refused) {
    return (
      <div data-testid="assignment-note-wrong-tool" role="alert" className="mt-4 rounded-[10px] border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
        <p className="font-bold">Not counted — wrong tool for this link</p>
        <p className="mt-1 text-[13px]">{refused}</p>
      </div>
    );
  }

  if (!token || !p || p.verified === undefined) return null;

  if (p.verified) {
    return (
      <div data-testid="assignment-note-ok" role="status" className="mt-4 rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
        ✓ Counted — verified as automated ({p.done} of {p.total})
      </div>
    );
  }
  return (
    <div data-testid="assignment-note-rejected" role="alert" className="mt-4 rounded-[10px] border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
      <p className="font-bold">{REASON_TEXT[p.reason ?? "no-automation"].long}</p>
      <p className="mt-1 text-[13px]">Run it with your {isTool(p.tool) ? TOOL_LABEL[p.tool] : "Playwright or Cypress"} script to record it.</p>
      {p.seen && <p data-testid="assignment-note-seen" className="mt-2 text-xs opacity-80">What we saw: {p.seen}</p>}
    </div>
  );
}
