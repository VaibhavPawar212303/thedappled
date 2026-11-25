"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { pendingLessons, readPending, sendQuiz } from "./manual-pending";

// Renders nothing. Once the learner is signed in, saves every Manual testing quiz they finished while
// signed out, then refreshes the page so progress shows. `skip` is the lesson whose quiz is on this
// page; that quiz saves its own result.
export function ManualPendingSync({ skip }: { skip?: string }) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const ran = React.useRef(false);

  React.useEffect(() => {
    if (!isSignedIn || ran.current) return;
    ran.current = true;
    const lessons = pendingLessons().filter((l) => l !== skip);
    if (!lessons.length) return;
    void (async () => {
      let any = false;
      for (const lesson of lessons) {
        const p = readPending(lesson);
        const res = p ? await sendQuiz(lesson, p).catch(() => null) : null;
        if (res?.passed) any = true;
      }
      if (any) router.refresh();
    })();
  }, [isSignedIn, skip, router]);

  return null;
}
