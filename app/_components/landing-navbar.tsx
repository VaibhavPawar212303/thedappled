"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { BookOpen, Newspaper, MonitorPlay, Terminal, FlaskConical, Binary } from "lucide-react";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { LandingMobileNav } from "./landing-mobile-nav";
import { AppLogoLink } from "./app-logo-link";


export const LandingNavbar = () => {
  const pathname = usePathname();
  const onTesting = pathname?.startsWith("/testing");
  const onDsa = pathname?.startsWith("/dsa");
  return (
    <nav className="p-4 bg-background flex items-center justify-between z-50 w-full border-b fixed top-0 transition-all">

      {/* 1. BRAND LOGO */}
      <AppLogoLink className="hover:opacity-90 transition mt-3" />

      {/* 2. NAVIGATION (Color Coded on Hover) */}
      <div className="hidden md:flex items-center gap-x-8">
        
        {/* Courses - Blue Hover */}
        <Link href="/search" className="group flex items-center gap-x-2 text-slate-600 dark:text-slate-300 font-medium transition hover:text-blue-600">
            <div className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-950 transition">
                <MonitorPlay className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-blue-600" />
            </div>
            Courses
        </Link>

        {/* Books - Purple Hover */}
        <Link href="/books" className="group flex items-center gap-x-2 text-slate-600 dark:text-slate-300 font-medium transition hover:text-purple-600">
            <div className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 group-hover:bg-purple-100 dark:group-hover:bg-purple-950 transition">
                <BookOpen className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-purple-600" />
            </div>
            Books
        </Link>

        {/* Blogs - Emerald Hover */}
        <Link href="/blogs" className="group flex items-center gap-x-2 text-slate-600 dark:text-slate-300 font-medium transition hover:text-emerald-600">
            <div className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950 transition">
                <Newspaper className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-emerald-600" />
            </div>
            Blogs
        </Link>

        {/* Testing - Emerald (active state when on /testing) */}
        <Link
            href="/testing"
            aria-current={onTesting ? "page" : undefined}
            className={`group flex items-center gap-x-2 font-medium transition hover:text-emerald-600 ${onTesting ? "text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-slate-300"}`}
        >
            <div className={`p-1 rounded-md transition group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950 ${onTesting ? "bg-emerald-100 dark:bg-emerald-950" : "bg-slate-100 dark:bg-slate-800"}`}>
                <FlaskConical className={`w-4 h-4 group-hover:text-emerald-600 ${onTesting ? "text-emerald-600" : "text-slate-600 dark:text-slate-300"}`} />
            </div>
            Testing
        </Link>

        {/* DSA - Blue (active state when on /dsa). Design: Penpot "27 - DSA Learning Path". */}
        <Link
            href="/dsa"
            aria-current={onDsa ? "page" : undefined}
            className={`group flex items-center gap-x-2 font-medium transition hover:text-blue-600 ${onDsa ? "text-blue-700 dark:text-blue-400" : "text-slate-600 dark:text-slate-300"}`}
        >
            <div className={`p-1 rounded-md transition group-hover:bg-blue-100 dark:group-hover:bg-blue-950 ${onDsa ? "bg-blue-100 dark:bg-blue-950" : "bg-slate-100 dark:bg-slate-800"}`}>
                <Binary className={`w-4 h-4 group-hover:text-blue-600 ${onDsa ? "text-blue-600" : "text-slate-600 dark:text-slate-300"}`} />
            </div>
            DSA
        </Link>

        {/* Compiler - Amber Hover (external app) */}
        <a
            href="https://c-architech-compiler.vercel.app/?tab=compiler"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-x-2 text-slate-600 dark:text-slate-300 font-medium transition hover:text-amber-600"
        >
            <div className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 group-hover:bg-amber-100 dark:group-hover:bg-amber-950 transition">
                <Terminal className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-amber-600" />
            </div>
            Compiler
        </a>
      </div>

      {/* 3. AUTH BUTTONS (Black & White Style) - desktop only, mirrored in the mobile drawer */}
      <div className="hidden md:flex items-center gap-x-2">
        <ModeToggle />
        <SignedIn>
            <Link href="/search">
                <Button variant="outline" size="sm" className="mr-2 border-slate-300 dark:border-slate-700">
                    Dashboard
                </Button>
            </Link>
            <UserButton afterSignOutUrl="/" />
        </SignedIn>

        <SignedOut>
            <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50">
                    Log in
                </Button>
            </SignInButton>

            <SignUpButton mode="modal">
                {/* Brand Black Button, inverts to light in dark mode so it still pops */}
                <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
                    Get Started
                </Button>
            </SignUpButton>
        </SignedOut>
      </div>

      {/* Mobile: theme toggle + hamburger drawer (nav links + auth live inside the drawer) */}
      <div className="flex md:hidden items-center gap-x-1">
        <ModeToggle />
        <LandingMobileNav />
      </div>
    </nav>
  );
};