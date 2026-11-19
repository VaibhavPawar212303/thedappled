"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PROGRESS_EVENT } from "./assignment-reporter";

type Progress = { done: number; total: number; completed: boolean };

// Shown on the demo pages only when opened from an assignment link (`?a=<token>`).
export function AssignmentBanner() {
  const token = useSearchParams().get("a");
  const [p, setP] = React.useState<Progress | null>(null);

  React.useEffect(() => {
    if (!token) return;
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

  return (
    <div data-testid="assignment-banner" role="status" className="bg-emerald-700 text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-3 text-sm font-semibold md:px-8">
        <span>● Assignment mode — your steps are being recorded.</span>
        <span className="text-emerald-100">
          {p ? `${p.done} of ${p.total} done` : "Connecting…"} ·{" "}
          <Link href="/testing/ui-automation/assignment" className="underline underline-offset-2">
            View assignment →
          </Link>
        </span>
      </div>
    </div>
  );
}
