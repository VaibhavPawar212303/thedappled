import { prisma } from "@/lib/db";

export type LandingStats = {
  courses: number;
  books: number;
  articles: number;
};

export const getLandingStats = async (): Promise<LandingStats> => {
  const [courses, books, articles] = await Promise.all([
    prisma.course.count({ where: { isPublished: true } }),
    prisma.book.count({ where: { isPublished: true } }),
    prisma.blog.count({ where: { isPublished: true } }),
  ]);

  return { courses, books, articles };
};
