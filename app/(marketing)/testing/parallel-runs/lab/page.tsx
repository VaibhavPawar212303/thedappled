import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AssignmentBanner } from "../../ui-automation/_components/assignment-banner";
import { OrderDeskLab } from "../_components/order-desk-lab";

export const metadata: Metadata = {
  title: "Order desk lab – parallel runs assignment",
  robots: { index: false, follow: false },
};

// Design: Penpot "26 - Testing Learning Path", page "Stage 8 – Parallel runs & workers", board D.
export default function ParallelLabPage() {
  return (
    <div className="min-h-[70vh] bg-slate-50 dark:bg-slate-900/40">
      <React.Suspense fallback={null}>
        <AssignmentBanner />
      </React.Suspense>
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/testing" className="hover:text-foreground">Testing</Link>
          <span aria-hidden="true">/</span>
          <Link href="/testing/parallel-runs" className="hover:text-foreground">Parallel runs &amp; workers</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-semibold text-foreground">Lab</span>
        </nav>
        <React.Suspense fallback={null}>
          <OrderDeskLab />
        </React.Suspense>
      </div>
    </div>
  );
}
