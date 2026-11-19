"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import type { StepId } from "@/lib/assignments";

export const PROGRESS_EVENT = "assignment:progress";

// Reads the learner's personal token from `?a=` and reports demo-page outcomes to the API.
// Without a token (normal practice use) it does nothing.
export function useAssignmentReporter() {
  const token = useSearchParams().get("a");

  const report = React.useCallback(
    (step: StepId) => {
      if (!token) return;
      fetch("/api/assignments/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, event: step }),
        keepalive: true,
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((p) => {
          if (p) window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: p }));
        })
        .catch(() => {});
    },
    [token],
  );

  return { token, report };
}
