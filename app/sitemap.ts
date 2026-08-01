import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogs, books, courses] = await Promise.all([
    prisma.blog.findMany({
      where: { isPublished: true },
      select: { id: true, updatedAt: true },
    }),
    prisma.book.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        chapters: {
          where: { isPublished: true, isFree: true },
          select: { id: true, updatedAt: true },
        },
      },
    }),
    prisma.course.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        chapters: {
          where: { isPublished: true, isFree: true },
          select: { id: true, updatedAt: true },
        },
      },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/blogs`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/books`, changeFrequency: "weekly", priority: 0.8 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = blogs.map((blog) => ({
    url: `${SITE_URL}/blogs/${blog.id}`,
    lastModified: blog.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Only free chapters are publicly reachable without an account/purchase
  // (locked chapters redirect anonymous visitors to /sign-in), so those are
  // the only ones worth pointing crawlers at.
  const bookChapterRoutes: MetadataRoute.Sitemap = books.flatMap((book) =>
    book.chapters.map((chapter) => ({
      url: `${SITE_URL}/books/${book.id}/chapters/${chapter.id}`,
      lastModified: chapter.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
  );

  const courseChapterRoutes: MetadataRoute.Sitemap = courses.flatMap((course) =>
    course.chapters.map((chapter) => ({
      url: `${SITE_URL}/course/${course.id}/chapters/${chapter.id}`,
      lastModified: chapter.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
  );

  return [...staticRoutes, ...blogRoutes, ...bookChapterRoutes, ...courseChapterRoutes];
}
