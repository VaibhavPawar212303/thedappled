import { Menu } from "lucide-react"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CourseSidebar } from "./course-sidebar"
import { Chapter, Course, UserProgress, Purchase } from "@prisma/client";
import { AppLogoLink } from "@/app/_components/app-logo-link";

interface CourseMobileSidebarProps {
    course: Course & {
        chapters: (Chapter & {
            userProgress: UserProgress[] | null;
        })[];
    };
    progressCount: number;
    purchase: Purchase | null;
}

export const CourseMobileSidebar = ({ course, progressCount, purchase }: CourseMobileSidebarProps) => {
    return (
        <Sheet>
            <SheetTrigger className="md:hidden pr-4 hover:opacity-75">
                <Menu />
            </SheetTrigger>
            <SheetContent className="p-0 bg-background w-72 flex flex-col">
                <div className="px-6 pt-6 pb-2">
                    <AppLogoLink className="hover:opacity-90 transition" />
                </div>
                <CourseSidebar
                    course={course}
                    progressCount={progressCount}
                    purchase={purchase}
                    inSheet
                />
            </SheetContent>
        </Sheet>
    )
}
