import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AssignmentBanner } from "../../ui-automation/_components/assignment-banner";
import { FixturesLab } from "../_components/fixtures-lab";

export const metadata: Metadata = {
  title: "Fixtures lab – advanced fixtures assignment",
  robots: { index: false, follow: false },
};

// Design: Penpot "26 - Testing Learning Path", page "Stage 6 – Advanced fixtures", board D.
export default function FixturesLabPage() {
  return (
    <div className="min-h-[70vh] bg-slate-50 dark:bg-slate-900/40">
      <React.Suspense fallback={null}>
        <AssignmentBanner />
      </React.Suspense>
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/testing" className="hover:text-foreground">Testing</Link>
          <span aria-hidden="true">/</span>
          <Link href="/testing/fixtures-advanced" className="hover:text-foreground">Advanced fixtures</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-semibold text-foreground">Lab</span>
        </nav>
        <React.Suspense fallback={null}>
          <FixturesLab />
        </React.Suspense>
      </div>
    </div>
  );
}
