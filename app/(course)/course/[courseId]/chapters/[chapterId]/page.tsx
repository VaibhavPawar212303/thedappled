import { getChapter } from "@/actions/get-chapter";
import { Banner } from "@/components/banner";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { VideoPlayer } from "./_components/video-player";
import { CourseEnrollButton } from "./_components/course-enroll-button";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";
import { File } from "lucide-react";
import { CourseProgressButton } from "./_components/course-progress-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { htmlToPlainText, truncate } from "@/lib/seo";

interface PageProps {
    params: {
        courseId: string;
        chapterId: string;
    };
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ courseId: string; chapterId: string }>
}): Promise<Metadata> {
    const { courseId, chapterId } = await params;

    const [course, chapter] = await Promise.all([
        prisma.course.findUnique({
            where: { id: courseId, isPublished: true },
            select: { title: true, imageUrl: true },
        }),
        prisma.chapter.findUnique({
            where: { id: chapterId, isPublished: true },
            select: { title: true, description: true, isFree: true },
        }),
    ]);

    if (!course || !chapter) return {};

    const title = `${chapter.title} - ${course.title}`;
    const description = truncate(htmlToPlainText(chapter.description ?? ""), 160);

    return {
        title,
        description,
        // Locked chapters redirect anonymous visitors to /sign-in before this
        // page ever renders for them, but noindex keeps them out of results
        // for any crawler that does have access (e.g. via a logged-in fetch).
        robots: chapter.isFree ? undefined : { index: false, follow: true },
        openGraph: {
            title,
            description,
            type: "article",
            images: course.imageUrl ? [{ url: course.imageUrl }] : undefined,
        },
    };
}

const ChapterIdPage = async ({ params }: PageProps) => {
    const { courseId, chapterId } = await params;

    const { userId } = await auth();

    const {
        chapter,
        course,
        attachments,
        nextChapter,
        userProgress,
        purchase
    } = await getChapter({
        userId: userId ?? "",
        courseId,
        chapterId
    });

    if (!chapter || !course) {
        return redirect("/");
    }

    const isLocked = !chapter.isFree && !purchase;

    // Anonymous visitors can watch free chapters, but need to sign in before
    // they can even see a locked chapter's purchase prompt.
    if (isLocked && !userId) {
        return redirect(`/sign-in?redirect_url=${encodeURIComponent(`/course/${courseId}/chapters/${chapterId}`)}`);
    }

    const completeOnEnd = !!purchase && !userProgress?.isCompleted;

    return (
        <div>
            {userProgress?.isCompleted && (
                <Banner variant="suceess" label="You already completed this chapter." />
            )}

            {isLocked && (
                <Banner
                    variant="warning"
                    label="You need to purchase this course to watch this chapter."
                />
            )}

            <div className="flex flex-col max-w-4xl ms-auto pb-20">
                <div className="flex justify-end mr-5">
                    <Link href="/search">
                        <Button variant="default" size="sm" className="border-slate-300">
                            Back
                        </Button>
                    </Link>
                </div>
                <div className="p-4">
                    <VideoPlayer
                        chapterId={chapterId}
                        title={chapter.title}
                        courseId={courseId}
                        nextChapterId={nextChapter?.id}
                        videoUrl={chapter.videourl!}
                        isLocked={isLocked}
                        completeOnEnd={completeOnEnd}
                    />
                </div>

                <div>
                    <div className="p-4 flex flex-col md:flex-row items-center justify-between">
                        <h2 className="text-2xl font-semibold mb-2">{chapter.title}</h2>

                        {purchase ? (
                            <CourseProgressButton
                                chapterId={chapterId}
                                courseId={courseId}
                                nextChapterId={nextChapter?.id}
                                isCompleted={!!userProgress?.isCompleted}
                            />
                        ) : (
                            <CourseEnrollButton
                                courseId={courseId}
                                price={course.price!}
                            />
                        )}
                    </div>

                    <Separator />

                    <div>
                        <Preview value={chapter.description!} />
                    </div>

                    {!!attachments.length && (
                        <>
                            <Separator />

                            <div className="p-4">
                                {attachments.map((attachment) => (
                                    <a
                                        href={attachment.url}
                                        key={attachment.id}
                                        target="_blank"
                                        className="flex items-center gap-x-2 p-3 w-full bg-sky-100 border border-sky-200 text-sky-700 rounded-md transition hover:shadow-sm"
                                    >
                                        <File />
                                        <p className="line-clamp-1">{attachment.name}</p>
                                    </a>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChapterIdPage;
