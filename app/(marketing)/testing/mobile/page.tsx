import type { Metadata } from "next";
import Link from "next/link";
import { Check, Smartphone } from "lucide-react";
import { TrackCard } from "../_components/track-card";
import { TrackHero } from "../_components/track-hero";

export const metadata: Metadata = {
  title: "Mobile testing track – Appium (coming soon)",
  description: "The mobile testing track: test Android and iOS apps with Appium. Its stages are being built: emulators, locators, gestures, waits, page objects and CI.",
  alternates: { canonical: "/testing/mobile" },
};

const PLANNED = [
  "Set up Appium with an Android emulator and an iOS simulator",
  "Find elements: accessibility id, id, XPath and when to use each",
  "Tap, type, swipe, scroll and long-press",
  "Waits, app state and resetting between tests",
  "Page objects for screens",
  "Run on a device cloud or in GitHub Actions",
];

// Design: Penpot "26 - Testing Learning Path", page "Roadmap – tracks", board E.
export default function MobileTrackPage() {
  return (
    <div className="bg-background text-foreground">
      <TrackHero
        crumbs={[{ label: "Testing", href: "/testing" }, { label: "Mobile testing" }]}
        label="Track · New · 1 tool"
        title="Mobile testing"
        blurb="Test Android and iOS apps the way mobile teams do. The first tool is Appium; its stages are being built."
        tone="green"
      />
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <div className="grid items-stretch gap-6 md:grid-cols-2">
          <TrackCard
            testid="tool-appium"
            tone="green"
            Icon={Smartphone}
            title="Appium"
            meta="Android and iOS · coming soon"
            pills={[{ label: "Coming soon", tone: "slate" }]}
            blurb="One WebDriver-based API for native, hybrid and mobile web apps on Android and iOS."
            chips={["Emulators", "Locators", "Gestures", "CI"]}
            cta="Coming soon"
            soon
          />
          <div className="rounded-3xl border bg-slate-50 p-6 sm:p-7 dark:bg-slate-900/40">
            <h2 className="text-lg font-extrabold">What the Appium stages will cover</h2>
            <ul className="m-0 mt-5 list-none space-y-4 p-0">
              {PLANNED.map((p) => (
                <li key={p} className="flex items-start gap-3 text-[15px] font-medium">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <Check className="h-3 w-3" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">
              Until then, the <Link href="/testing/manual" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">manual testing</Link> and{" "}
              <Link href="/testing/automation" className="font-semibold text-purple-600 hover:underline dark:text-purple-400">automation</Link> tracks are open.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
