import type { Metadata } from "next";
import { PracticeLayout } from "../_components/practice-layout";
import { LoginForm } from "../_components/login-form";

export const metadata: Metadata = {
  title: "Sign in demo – UI automation practice",
  description: "A practice sign-in form for learning Playwright and Cypress.",
  robots: { index: false, follow: true },
};

export default function LoginDemoPage() {
  return (
    <PracticeLayout
      crumbs={[
        { label: "Testing", href: "/testing" },
        { label: "UI automation", href: "/testing/ui-automation" },
        { label: "Sign in demo" },
      ]}
      checklist={[
        "Valid login shows the welcome message",
        "Wrong password shows the error banner",
        "Empty email / password show field errors",
        "Show toggles the password visibility",
        "Remember me can be checked and unchecked",
        "Pressing Enter submits the form",
      ]}
      note={
        <>
          <p className="font-semibold text-foreground">Demo account</p>
          <p className="mt-1">demo@thedappled.com / Test@1234</p>
        </>
      }
    >
      <LoginForm />
    </PracticeLayout>
  );
}
