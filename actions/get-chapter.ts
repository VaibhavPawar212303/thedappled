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
    console.log("📥 getChapter INPUT:", { userId, courseId, chapterId });

    // 1️⃣ Check Purchase
    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    // 2️⃣ Fetch Course
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
        price: true,
      },
    });

    if (!course) {
      console.log("❌ Course not found:", courseId);
      return {
        chapter: null,
        course: null,
        attachments: [],
        nextChapter: null,
        userProgress: null,
        purchase: null,
      };
    }

    // 3️⃣ Fetch Chapter
    const chapter = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
      },
    });

    if (!chapter) {
      console.log("❌ Chapter not found:", chapterId);
      return {
        chapter: null,
        course: null,
        attachments: [],
        nextChapter: null,
        userProgress: null,
        purchase: null,
      };
    }

    if (!chapter.isPublished) {
      console.log("❌ Chapter not published");
      return {
        chapter: null,
        course: null,
        attachments: [],
        nextChapter: null,
        userProgress: null,
        purchase: null,
      };
    }

    // 4️⃣ Attachments visible only if purchased
    let attachments: Attachment[] = [];

    if (purchase) {
      attachments = await prisma.attachment.findMany({
        where: {
          courseId,
        },
      });
    }

    // 5️⃣ Get next chapter only if allowed
    let nextChapter: Chapter | null = null;

    if (chapter.isFree || purchase) {
      nextChapter = await prisma.chapter.findFirst({
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
      });
    }

    // 6️⃣ User progress
    const userProgress = await prisma.userProgress.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
    });

    // 7️⃣ Final return
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
