"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Logo } from "./logo";

interface AppLogoLinkProps {
  showText?: boolean;
  className?: string;
}

// Logo always goes to the dashboard when signed in, and to the landing
// page when signed out — used everywhere the logo doubles as a nav link.
//
// Rendered unconditionally (not inside <SignedIn>/<SignedOut>) so the brand
// name is in the server HTML of statically generated pages — those Clerk
// wrappers render nothing until auth loads, which hid "Thedappled" from
// crawlers. Before auth loads, `isSignedIn` is undefined, so it links home.
export const AppLogoLink = ({ showText = true, className }: AppLogoLinkProps) => {
  const { isSignedIn } = useAuth();
  return (
    <Link
      href={isSignedIn ? "/dashboard" : "/"}
      className={className}
      aria-label={isSignedIn ? "TheDappled – go to dashboard" : "TheDappled – go to home"}
    >
      <Logo showText={showText} />
    </Link>
  );
};
