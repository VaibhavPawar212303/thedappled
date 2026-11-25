"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { pendingSteps, readPending, sendQuiz } from "./dsa-pending";

// Renders nothing. Once the learner is signed in, saves every DSA quiz they finished while signed out
// (on any lesson), then refreshes the page so the roadmap and sidebar show the new progress.
// `skip` is the step whose quiz is on this page; that quiz saves its own result.
export function DsaPendingSync({ skip }: { skip?: string }) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const ran = React.useRef(false);

  React.useEffect(() => {
    if (!isSignedIn || ran.current) return;
    ran.current = true;
    const steps = pendingSteps().filter((s) => s !== skip);
    if (!steps.length) return;
    void (async () => {
      let any = false;
      for (const step of steps) {
        const answers = readPending(step);
        const res = answers ? await sendQuiz(step, answers).catch(() => null) : null;
        if (res?.passed) any = true;
      }
      if (any) router.refresh();
    })();
  }, [isSignedIn, skip, router]);

  return null;
}
