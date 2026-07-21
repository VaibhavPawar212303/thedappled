import { Attachment, Chapter } from "@prisma/client";
import { prisma } from "@/lib/db";

interface GetChapterProps {
  userId: string;
  courseId: string;
  chapterId: string;
}

export const getChapter = async ({
  userId,
  courseId,
  chapterId,
}: GetChapterProps) => {
  try {
    // Purchase, course, chapter, and user progress are independent lookups — run in parallel.
    const [purchase, course, chapter, userProgress] = await Promise.all([
      prisma.purchase.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      }),
      prisma.course.findUnique({
        where: {
          id: courseId,
        },
        select: {
          id: true,
          price: true,
        },
      }),
      prisma.chapter.findUnique({
        where: {
          id: chapterId,
        },
      }),
      prisma.userProgress.findUnique({
        where: {
          userId_chapterId: {
            userId,
            chapterId,
          },
        },
      }),
    ]);

    if (!course || !chapter || !chapter.isPublished) {
      return {
        chapter: null,
        course: null,
        attachments: [],
        nextChapter: null,
        userProgress: null,
        purchase: null,
      };
    }

    // Attachments and next-chapter lookup depend on chapter/purchase — run together.
    const [attachments, nextChapter] = await Promise.all([
      purchase
        ? prisma.attachment.findMany({
            where: {
              courseId,
            },
          })
        : Promise.resolve<Attachment[]>([]),
      chapter.isFree || purchase
        ? prisma.chapter.findFirst({
            where: {
              courseId,
              isPublished: true,
              position: {
                gt: chapter.position,
              },
            },
            orderBy: {
              position: "asc",
            },
          })
        : Promise.resolve<Chapter | null>(null),
    ]);

    return {
      chapter,
      course,
      attachments,
      nextChapter,
      userProgress,
      purchase,
    };
  } catch (error) {
    console.log("[GET_CHAPTER] ERROR:", error);

    return {
      chapter: null,
      course: null,
      attachments: [],
      nextChapter: null,
      userProgress: null,
      purchase: null,
    };
  }
};
