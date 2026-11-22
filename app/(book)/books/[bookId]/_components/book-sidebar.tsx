import { Book, BookChapter, BookUserProgress, BookPurchase } from "@prisma/client";
import { CourseProgress } from "@/components/course-progress";
import { BookSidebarItem } from "./book-sidebar-item";

interface BookSidebarProps {
    course: Book & {
        chapters: (BookChapter & {
            userProgress: BookUserProgress[] | null
        })[]
    };
    progressCount: number;
    purchase: BookPurchase | null; // ✅ Receive via prop
    // The fixed desktop sidebar sits under the fixed navbar/brand-corner and
    // needs pt-20 to clear them; the mobile Sheet version has no header
    // overlapping it.
    inSheet?: boolean;
}

export const BookSidebar = ({ course, progressCount, purchase, inSheet = false }: BookSidebarProps) => {
    // ✅ No prisma queries here!

    return (
        <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm bg-background">
            <div className={`px-6 pb-6 border-b flex flex-col gap-y-4 ${inSheet ? "pt-6" : "pt-20"}`}>
                <div>
                    <h1 className="font-semibold">
                        {course.title}
                    </h1>
                    {purchase && (
                        <div className="mt-4">
                            <CourseProgress
                                variant="success"
                                value={progressCount}
                            />
                        </div>
                    )}
                </div>
            </div>
            <div className="flex flex-col w-full">
                {course.chapters.map((chapter) => (
                    <BookSidebarItem
                        key={chapter.id}
                        id={chapter.id}
                        label={chapter.title}
                        isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
                        bookId={course.id}
                        isLocked={!chapter.isFree && !purchase}
                    />
                ))}
            </div>
        </div>
    )
}