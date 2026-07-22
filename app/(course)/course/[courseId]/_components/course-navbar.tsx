import { NavbarRoutes } from "@/components/navbar-routes";
import { CourseMobileSidebar } from "./course-mobile-sidebar";
import { Chapter, Course, UserProgress, Purchase } from "@prisma/client";

interface CourseNavbarProps {
    course: Course & {
        chapters: (Chapter & {
            userProgress: UserProgress[] | null;
        })[];
    };
    progressCount: number;
    purchase: Purchase | null;
};

export const CourseNavbar = ({ course, progressCount, purchase }: CourseNavbarProps) => {
    return (
        <div className="p-4 border-b h-full flex items-center bg-background shadow-sm">
            <CourseMobileSidebar
                course={course}
                progressCount={progressCount}
                purchase={purchase}
            />
            <NavbarRoutes />
        </div>
    )
}
