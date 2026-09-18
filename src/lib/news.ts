import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { sanitizeRichText } from "@/lib/sanitize";

export const newsStatuses = ["DRAFT", "PUBLISHED", "SCHEDULED"] as const;
export type NewsStatus = (typeof newsStatuses)[number];

export const newsInputSchema = z.object({
  title: z.string().trim().min(3, "Tytuł musi mieć co najmniej 3 znaki").max(200, "Tytuł może mieć maksymalnie 200 znaków"),
  content: z.string().min(1, "Treść jest wymagana").max(100_000, "Treść jest zbyt długa"),
  excerpt: z.string().trim().max(300, "Opis SEO może mieć maksymalnie 300 znaków").nullable().optional(),
  status: z.enum(newsStatuses),
  publishedAt: z.string().datetime().nullable().optional(),
}).superRefine((data, ctx) => {
  const text = data.content.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim();
  if (text.length < 3) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["content"], message: "Treść musi mieć co najmniej 3 znaki" });
  if (data.status === "SCHEDULED" && (!data.publishedAt || new Date(data.publishedAt) <= new Date())) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["publishedAt"], message: "Termin publikacji musi przypadać w przyszłości" });
  }
});

export function newsStatus(item: { isPublished: boolean; publishedAt: Date | null }): NewsStatus {
  if (!item.isPublished) return "DRAFT";
  return item.publishedAt && item.publishedAt > new Date() ? "SCHEDULED" : "PUBLISHED";
}

export function newsWriteData(
  input: z.infer<typeof newsInputSchema>,
  current?: { isPublished: boolean; publishedAt: Date | null },
): Prisma.NewsUncheckedCreateInput {
  const sanitizedContent = sanitizeRichText(input.content);
  const preservedPublicationDate = current?.isPublished && current.publishedAt && current.publishedAt <= new Date()
    ? current.publishedAt
    : null;
  const publishedAt = input.status === "SCHEDULED"
    ? new Date(input.publishedAt!)
    : input.status === "PUBLISHED"
      ? preservedPublicationDate || new Date()
      : null;

  return {
    title: input.title,
    content: sanitizedContent,
    excerpt: input.excerpt || null,
    isPublished: input.status !== "DRAFT",
    publishedAt,
  };
}

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
