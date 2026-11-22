"use client";

import Link from "next/link";
import { SignedIn } from "@clerk/nextjs";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavbarRoutes } from "@/components/navbar-routes";
import { BookMobileSidebar } from "./book-mobile-sidebar";
import { Book, BookChapter, BookUserProgress, BookPurchase } from "@prisma/client";

interface BookNavbarProps {
    course: Book & {
        chapters: (BookChapter & {
            userProgress: BookUserProgress[] | null;
        })[];
    };
    progressCount: number;
    purchase: BookPurchase | null; // ✅ Add this
};

export const BookNavbar = ({ course, progressCount, purchase }: BookNavbarProps) => {
    return (
        <div className="p-4 border-b h-full flex items-center gap-x-4 bg-background shadow-sm">
            <BookMobileSidebar
                course={course}
                progressCount={progressCount}
                purchase={purchase} // ✅ Pass down
            />
            <SignedIn>
                <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="gap-x-2">
                        <LayoutDashboard className="h-4 w-4" />
                        <span className="hidden sm:inline">Back to Dashboard</span>
                    </Button>
                </Link>
            </SignedIn>
            <NavbarRoutes />
        </div>
    )
}