"use client";

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
        <div className="p-4 border-b h-full flex items-center bg-background shadow-sm">
            <BookMobileSidebar
                course={course}
                progressCount={progressCount}
                purchase={purchase} // ✅ Pass down
            />
            <NavbarRoutes />
        </div>
    )
}