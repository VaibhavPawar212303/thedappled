import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AssignmentBanner } from "../../ui-automation/_components/assignment-banner";
import { DemoShop } from "../_components/demo-shop";

export const metadata: Metadata = {
  title: "Demo shop – page objects assignment",
  robots: { index: false, follow: false },
};

export default function DemoShopPage() {
  return (
    <div className="min-h-[70vh] bg-slate-50 dark:bg-slate-900/40">
      <React.Suspense fallback={null}>
        <AssignmentBanner />
      </React.Suspense>
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/testing" className="hover:text-foreground">Testing</Link>
          <span aria-hidden="true">/</span>
          <Link href="/testing/page-objects" className="hover:text-foreground">Page objects &amp; fixtures</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-semibold text-foreground">Demo shop</span>
        </nav>
        <div className="mx-auto max-w-xl rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <React.Suspense fallback={null}>
            <DemoShop />
          </React.Suspense>
        </div>
      </div>
    </div>
  );
}
