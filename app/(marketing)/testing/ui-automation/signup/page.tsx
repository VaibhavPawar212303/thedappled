import * as React from "react";
import type { Metadata } from "next";
import { PracticeLayout } from "../_components/practice-layout";
import { SignupForm } from "../_components/signup-form";

export const metadata: Metadata = {
  title: "Sign up demo – UI automation practice",
  description: "A practice registration form for learning Playwright and Cypress.",
  robots: { index: false, follow: true },
};

export default function SignupDemoPage() {
  return (
    <PracticeLayout
      crumbs={[
        { label: "Testing", href: "/testing" },
        { label: "UI automation", href: "/testing/ui-automation" },
        { label: "Sign up demo" },
      ]}
      checklist={[
        "Submit empty — every required field errors",
        "Invalid email format is rejected",
        "Password needs 8+ chars, a number, a symbol",
        "Strength meter updates as you type",
        "Confirm password must match",
        "Terms must be ticked before submit",
        "Valid data shows the success message",
      ]}
    >
      <React.Suspense fallback={null}>
        <SignupForm />
      </React.Suspense>
    </PracticeLayout>
  );
}
