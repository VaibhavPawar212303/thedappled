import { CourseSidebarItem } from "./course-sidebar-item";
import { CourseProgress } from "@/components/course-progress";
import { Chapter, Course, UserProgress, Purchase } from "@prisma/client";

interface CourseSidebarProps {
    course: Course & {
        chapters: (Chapter & {
            userProgress: UserProgress[] | null
        })[]
    };
    progressCount: number;
    purchase: Purchase | null;
    inSheet?: boolean;
}

export const CourseSidebar = ({ course, progressCount, purchase, inSheet = false }: CourseSidebarProps) => {
    return (
        <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm bg-background">
            <div className={`px-6 pb-6 border-b flex flex-col gap-y-4 ${inSheet ? "pt-6" : "pt-20"}`}>
                <div>
                    <h1 className="font-semibold">
                        {course.title}
                    </h1>
                    {
                        purchase && (
                            <div className="mt-4">
                                <CourseProgress
                                    variant="success"
                                    value={progressCount}
                                />
                            </div>
                        )
                    }
                </div>
            </div>
            <div className="flex flex-col w-full">
                {
                    course.chapters.map((chapter: typeof course.chapters[number]) => <CourseSidebarItem
                        key={chapter.id}
                        id={chapter.id}
                        label={chapter.title}
                        isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
                        courseId={course.id}
                        isLocked={!chapter.isFree && !purchase}
                    />)
                }
            </div>
        </div>
    )
}
