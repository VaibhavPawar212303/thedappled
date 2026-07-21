import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin, getStoragePathFromPublicUrl } from "@/lib/supabase";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
    try {
        const { userId } = await auth();
        const { courseId, chapterId } = await params;  // ✅ Await params

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const ownCourse = await prisma.course.findUnique({
            where: {
                id: courseId,  // ✅ Use courseId
                userId,
            },
        });

        if (!ownCourse) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const chapter = await prisma.chapter.findUnique({
            where: {
                id: chapterId,  // ✅ Use chapterId
                courseId: courseId,  // ✅ Use courseId
            }
        });

        if (!chapter) {
            return new NextResponse("Not Found", { status: 404 });
        }

        if (chapter.videourl) {
            const path = getStoragePathFromPublicUrl("chapter-videos", chapter.videourl);
            if (path) {
                await supabaseAdmin.storage.from("chapter-videos").remove([path]);
            }
        }

        const deletedChapter = await prisma.chapter.delete({
            where: {
                id: chapterId  // ✅ Use chapterId
            }
        });

        const isPublishedChapterInCourse = await prisma.chapter.findMany({
            where: {
                id: chapterId,  // ✅ Use chapterId
                isPublished: true
            }
        });

        if (!isPublishedChapterInCourse.length) {
            await prisma.course.update({
                where: {
                    id: courseId  // ✅ Use courseId
                },
                data: {
                    isPublished: false
                }
            })
        }

        return NextResponse.json(deletedChapter);
    } catch (error) {
        console.error("[COURSE_CHAPTER_ID] Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
    try {
        const { userId } = await auth();
        const { courseId, chapterId } = await params;  // ✅ Await params
        //@ts-ignore
        const { isPublished, ...values } = await req.json();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const ownCourse = await prisma.course.findUnique({
            where: {
                id: courseId,  // ✅ Use courseId
                userId,
            },
        });

        if (!ownCourse) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const chapter = await prisma.chapter.update({
            where: {
                id: chapterId,  // ✅ Use chapterId
                courseId: courseId,  // ✅ Use courseId
            },
            data: {
                ...values,
            },
        });

        return NextResponse.json(chapter);
    } catch (error) {
        console.error("[COURSE_CHAPTER_ID] Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}