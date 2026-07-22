import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

const CourseIdPage = async ({ params }: { params: Promise<{ courseId: string }> }) => {
    const { courseId } = await params;  // ✅ Await params
    
    // This page only exists to redirect to the first chapter, so fetch just
    // the one id needed for that instead of every chapter's full record.
    const course = await prisma.course.findUnique({
        where: {
            id: courseId
        },
        select: {
            id: true,
            chapters: {
                where: {
                    isPublished: true
                },
                orderBy: {
                    position: "asc"
                },
                take: 1,
                select: {
                    id: true
                }
            },
        }
    });

    if (!course || !course.chapters[0]) {
        return redirect('/');
    }

    return redirect(`/course/${course.id}/chapters/${course.chapters[0].id}`)
}

export default CourseIdPage;