import { prisma } from "@/lib/db";

export type LandingStats = {
  courses: number;
  books: number;
  articles: number;
};

// The counts are decoration: if the database is unreachable, the landing page still renders
// (zero counts are hidden by the stats row) instead of failing entirely.
export const getLandingStats = async (): Promise<LandingStats> => {
  try {
    const [courses, books, articles] = await Promise.all([
      prisma.course.count({ where: { isPublished: true } }),
      prisma.book.count({ where: { isPublished: true } }),
      prisma.blog.count({ where: { isPublished: true } }),
    ]);
    return { courses, books, articles };
  } catch (e) {
    console.error("[landing] stats unavailable:", e instanceof Error ? e.message : e);
    return { courses: 0, books: 0, articles: 0 };
  }
};
