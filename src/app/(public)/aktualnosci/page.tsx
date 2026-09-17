import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { newsExcerpt, publicNewsWhere } from "@/lib/news";

export const metadata: Metadata = {
  title: "Aktualności",
  description: "Najnowsze informacje dotyczące Bazy Konkurencyjności Funduszu Sprawiedliwości.",
};

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const news = await prisma.news.findMany({
    where: publicNewsWhere(),
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <nav className="flex items-center text-sm text-gray-700 mb-6" aria-label="Okruszki">
        <Link href="/" className="hover:text-[#145447] hover:underline">Strona główna</Link>
        <ChevronRight className="w-4 h-4 mx-1" aria-hidden="true" />
        <span>Aktualności</span>
      </nav>

      <h1 className="text-3xl font-bold text-[#145447] mb-8">Aktualności</h1>

      {news.length === 0 ? (
        <p className="text-gray-700">Brak opublikowanych aktualności.</p>
      ) : (
        <div className="space-y-5">
          {news.map((item) => (
            <article key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <Calendar className="w-4 h-4" aria-hidden="true" />
                <time dateTime={(item.publishedAt ?? item.createdAt).toISOString()}>
                  {formatDate(item.publishedAt ?? item.createdAt)}
                </time>
              </div>
              <h2 className="text-xl font-bold mb-2">
                <Link href={`/aktualnosci/${item.id}`} className="text-gray-900 hover:text-[#145447] hover:underline">
                  {item.title}
                </Link>
              </h2>
              <p className="text-gray-700">{newsExcerpt(item.content, item.excerpt, 260)}</p>
              <Link href={`/aktualnosci/${item.id}`} className="inline-flex mt-4 font-semibold text-[#145447] hover:underline">
                Czytaj więcej
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
