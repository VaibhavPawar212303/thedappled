"use client";

import Link from "next/link";
import { Menu, MonitorPlay, BookOpen, Newspaper } from "lucide-react";
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Logo } from "./logo";

const links = [
  { href: "/search", label: "Courses", icon: MonitorPlay },
  { href: "/books", label: "Books", icon: BookOpen },
  { href: "/blogs", label: "Blogs", icon: Newspaper },
];

export const LandingMobileNav = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="md:hidden p-2 -mr-2 hover:opacity-75 transition"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-3/4 sm:max-w-xs">
        <SheetHeader>
          <SheetTitle>
            <Logo />
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {links.map(({ href, label, icon: Icon }) => (
            <SheetClose asChild key={href}>
              <Link
                href={href}
                className="flex items-center gap-x-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            </SheetClose>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 p-4 border-t">
          <SignedIn>
            <SheetClose asChild>
              <Link href="/search">
                <Button variant="outline" className="w-full">
                  Dashboard
                </Button>
              </Link>
            </SheetClose>
            <div className="flex justify-center pt-2">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" className="w-full">
                Log in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
                Get Started
              </Button>
            </SignUpButton>
          </SignedOut>
        </div>
      </SheetContent>
    </Sheet>
  );
};
