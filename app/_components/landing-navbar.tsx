"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { BookOpen, Newspaper, MonitorPlay } from "lucide-react";
import { Logo } from "./logo";
import { ModeToggle } from "@/components/mode-toggle";
import { LandingMobileNav } from "./landing-mobile-nav";


export const LandingNavbar = () => {
  return (
    <nav className="p-4 bg-background flex items-center justify-between z-50 w-full border-b fixed top-0 transition-all">
      
      {/* 1. BRAND LOGO */}
      <Link href="/" className="hover:opacity-90 transition mt-3">
        <Logo />
      </Link>

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