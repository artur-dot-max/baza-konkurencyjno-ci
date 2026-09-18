import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { newsStatus } from "@/lib/news";
import { NewsForm } from "@/components/admin/news-form";

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.news.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <nav className="flex flex-wrap items-center text-sm text-gray-700" aria-label="Okruszki">
        <Link href="/admin/aktualnosci" className="hover:underline">Aktualności</Link>
        <ChevronRight className="mx-1 h-4 w-4" aria-hidden="true" />
        <span className="truncate">Edycja: {item.title}</span>
      </nav>
      <h1 className="text-3xl font-bold text-navy-900">Edytuj aktualność</h1>
      <NewsForm initialData={{
        id: item.id,
        title: item.title,
        content: item.content,
        excerpt: item.excerpt || "",
        status: newsStatus(item),
        publishedAt: item.publishedAt?.toISOString() || "",
      }} />
    </div>
  );
}
