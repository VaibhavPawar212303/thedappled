"use client";

import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Logo } from "./logo";

interface AppLogoLinkProps {
  showText?: boolean;
  className?: string;
}

// Logo always goes to the dashboard when signed in, and to the landing
// page when signed out — used everywhere the logo doubles as a nav link.
export const AppLogoLink = ({ showText = true, className }: AppLogoLinkProps) => {
  return (
    <>
      <SignedIn>
        <Link href="/dashboard" className={className} aria-label="Go to dashboard">
          <Logo showText={showText} />
        </Link>
      </SignedIn>
      <SignedOut>
        <Link href="/" className={className} aria-label="Go to home">
          <Logo showText={showText} />
        </Link>
      </SignedOut>
    </>
  );
};
