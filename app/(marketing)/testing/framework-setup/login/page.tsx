import * as React from "react";
import type { Metadata } from "next";
import { PracticeLayout } from "../../ui-automation/_components/practice-layout";
import { FrameworkLoginForm } from "../_components/framework-login-form";

export const metadata: Metadata = {
  title: "Sign in – framework setup assignment",
  robots: { index: false, follow: false },
};

export default function FrameworkLoginPage() {
  return (
    <PracticeLayout
      crumbs={[
        { label: "Testing", href: "/testing" },
        { label: "Framework setup", href: "/testing/framework-setup" },
        { label: "Sign in" },
      ]}
      checklist={[
        "Valid .env credentials show the welcome message",
        "Wrong password shows the error banner",
        "Base URL comes from BASE_URL, not the test",
      ]}
      note={<p>Your credentials are on your assignment page. Keep them in <code>.env</code> — never in the test.</p>}
    >
      <React.Suspense fallback={null}>
        <FrameworkLoginForm />
      </React.Suspense>
    </PracticeLayout>
  );
}
