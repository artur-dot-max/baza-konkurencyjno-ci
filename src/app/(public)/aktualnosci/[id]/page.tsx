import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { sanitizeRichText } from "@/lib/sanitize";
import { formatDate } from "@/lib/utils";
import { newsExcerpt, publicNewsWhere } from "@/lib/news";

type PageProps = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await prisma.news.findFirst({ where: { id, ...publicNewsWhere() } });
  if (!item) return { title: "Nie znaleziono aktualności" };
  return { title: item.title, description: newsExcerpt(item.content, item.excerpt, 160) };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { id } = await params;
  const item = await prisma.news.findFirst({ where: { id, ...publicNewsWhere() } });
  if (!item) notFound();

  const publicationDate = item.publishedAt ?? item.createdAt;

  return (
    <article className="container mx-auto max-w-4xl px-4 py-10">
      <nav className="flex flex-wrap items-center text-sm text-gray-700 mb-6" aria-label="Okruszki">
        <Link href="/" className="hover:text-[#145447] hover:underline">Strona główna</Link>
        <ChevronRight className="w-4 h-4 mx-1" aria-hidden="true" />
        <Link href="/aktualnosci" className="hover:text-[#145447] hover:underline">Aktualności</Link>
        <ChevronRight className="w-4 h-4 mx-1" aria-hidden="true" />
        <span className="min-w-0 truncate">{item.title}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-[#145447] mb-4">{item.title}</h1>
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="w-5 h-5" aria-hidden="true" />
          <time dateTime={publicationDate.toISOString()}>{formatDate(publicationDate)}</time>
        </div>
      </header>

      <div
        className="prose prose-lg max-w-none bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm"
        dangerouslySetInnerHTML={{ __html: sanitizeRichText(item.content) }}
      />

      <Link href="/aktualnosci" className="inline-flex mt-8 font-semibold text-[#145447] hover:underline">
        Wróć do aktualności
      </Link>
    </article>
  );
}
