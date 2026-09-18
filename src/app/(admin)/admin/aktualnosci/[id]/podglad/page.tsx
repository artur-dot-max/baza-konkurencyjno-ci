import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ChevronRight, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { newsStatus } from "@/lib/news";
import { sanitizeRichText } from "@/lib/sanitize";
import { Button } from "@/components/ui/button";

const labels = { DRAFT: "Szkic", PUBLISHED: "Opublikowana", SCHEDULED: "Zaplanowana" } as const;

export default async function PreviewNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.news.findUnique({ where: { id } });
  if (!item) notFound();
  const status = newsStatus(item);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <nav className="flex flex-wrap items-center text-sm text-gray-700" aria-label="Okruszki">
        <Link href="/admin/aktualnosci" className="hover:underline">Aktualności</Link>
        <ChevronRight className="mx-1 h-4 w-4" aria-hidden="true" />
        <span>Podgląd</span>
      </nav>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 inline-flex rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-800">{labels[status]}</p>
          <h1 className="text-3xl font-bold text-[#145447]">{item.title}</h1>
          {item.publishedAt && <p className="mt-3 flex items-center gap-2 text-gray-700"><Calendar className="h-4 w-4" aria-hidden="true" />{formatDateTime(item.publishedAt)}</p>}
        </div>
        <Button asChild><Link href={`/admin/aktualnosci/${item.id}/edycja`}><Pencil className="mr-2 h-4 w-4" aria-hidden="true" />Edytuj</Link></Button>
      </div>
      {item.excerpt && <p className="rounded-md border-l-4 border-[#145447] bg-white p-4 text-gray-700">{item.excerpt}</p>}
      <article className="prose prose-lg max-w-none rounded-lg border bg-white p-6 shadow-sm" dangerouslySetInnerHTML={{ __html: sanitizeRichText(item.content) }} />
      <p className="text-sm text-gray-600">To jest podgląd administracyjny. Szkice i zaplanowane wpisy nie są dostępne publicznie przed publikacją.</p>
    </div>
  );
}
