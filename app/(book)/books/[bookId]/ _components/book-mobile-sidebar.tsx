"use client";

import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Book, BookChapter, BookUserProgress, BookPurchase } from "@prisma/client";
import { BookSidebar } from "./book-sidebar";
import { AppLogoLink } from "@/app/_components/app-logo-link";

interface BookMobileSidebarProps {
    course: Book & {
        chapters: (BookChapter & {
            userProgress: BookUserProgress[] | null;
        })[];
    };
    progressCount: number;
    purchase: BookPurchase | null; // ✅ Add this
}

export const BookMobileSidebar = ({ course, progressCount, purchase }: BookMobileSidebarProps) => {
    return (
        <Sheet>
            <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
                <Menu />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-background w-72 flex flex-col">
                <div className="px-6 pt-6 pb-2">
                    <AppLogoLink className="hover:opacity-90 transition" />
                </div>
                <BookSidebar
                    course={course}
                    progressCount={progressCount}
                    purchase={purchase}
                    inSheet
                />
            </SheetContent>
        </Sheet>
    )
}
