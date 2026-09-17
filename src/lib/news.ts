import type { Prisma } from "@prisma/client";

export function publicNewsWhere(): Prisma.NewsWhereInput {
  return {
    isPublished: true,
    publishedAt: { lte: new Date() },
  };
}

export function newsExcerpt(content: string, excerpt?: string | null, length = 180) {
  const source = excerpt?.trim() || content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

  return source.length > length ? `${source.slice(0, length).trimEnd()}…` : source;
}
