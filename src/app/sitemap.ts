import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { AnnouncementStatus } from "@prisma/client";
import { publicNewsWhere } from "@/lib/news";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const publicStatuses = [
    AnnouncementStatus.PUBLISHED,
    AnnouncementStatus.IN_PROGRESS,
    AnnouncementStatus.RESOLVED,
    AnnouncementStatus.COMPLETED,
    AnnouncementStatus.CANCELLED
  ];

  const announcements = await prisma.announcement.findMany({
    where: {
      status: { in: publicStatuses }, publishedAt: { lte: new Date() }
    },
    select: {
      id: true,
      updatedAt: true
    }
  });

  const news = await prisma.news.findMany({
    where: publicNewsWhere(),
    select: { id: true, updatedAt: true },
  });

  const announcementUrls = announcements.map((announcement) => ({
    url: `${appUrl}/ogloszenia/${announcement.id}`,
    lastModified: announcement.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const newsUrls = news.map((item) => ({
    url: `${appUrl}/aktualnosci/${item.id}`,
    lastModified: item.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    {
      url: appUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${appUrl}/ogloszenia`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${appUrl}/aktualnosci`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${appUrl}/logowanie`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${appUrl}/rejestracja`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...announcementUrls,
    ...newsUrls,
  ];
}
