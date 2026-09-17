import { publicAnnouncementWhere } from "@/lib/access";
import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate, STATUS_COLORS, STATUS_LABELS, ORDER_TYPE_LABELS, VOIVODESHIPS } from "@/lib/utils";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { AnnouncementStatus, OrderType, Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "Baza ogłoszeń",
  description: "Baza ogłoszeń Funduszu Sprawiedliwości",
};

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;

  const q = typeof resolvedParams.q === "string" ? resolvedParams.q : "";
  const status = typeof resolvedParams.status === "string" ? resolvedParams.status : "";
  const orderType = typeof resolvedParams.orderType === "string" ? resolvedParams.orderType : "";
  const voivodeship = typeof resolvedParams.voivodeship === "string" ? resolvedParams.voivodeship : "";
  const org = typeof resolvedParams.org === "string" ? resolvedParams.org : "";
  const sort = typeof resolvedParams.sort === "string" ? resolvedParams.sort : "newest";
  const page = Math.min(100000, Math.max(1, Number.parseInt(String(resolvedParams.page), 10) || 1));
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const where: Prisma.AnnouncementWhereInput = {
    AND: [publicAnnouncementWhere()],
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { procedureNumber: { contains: q, mode: "insensitive" } }
      ]
    }),
    ...(["PUBLISHED", "IN_PROGRESS", "RESOLVED", "CANCELLED", "COMPLETED"].includes(status) && { status: status as AnnouncementStatus }),
    ...(["SUPPLIES", "SERVICES", "CONSTRUCTION"].includes(orderType) && { orderType: orderType as OrderType }),
    ...(voivodeship && { voivodeship }),
    ...(org && { organization: { name: { contains: org, mode: "insensitive" } } })
  };

  let orderBy: Prisma.AnnouncementOrderByWithRelationInput = { publishedAt: "desc" };
  if (sort === "oldest") orderBy = { publishedAt: "asc" };
  if (sort === "deadline") orderBy = { bidsDeadline: "asc" };

  let announcements: any[] = [];
  let total = 0;

  try {
    const [fetched, count] = await Promise.all([
      prisma.announcement.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: { organization: true }
      }),
      prisma.announcement.count({ where })
    ]);
    announcements = fetched;
    total = count;
  } catch (e) {
    console.error(e);
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold text-[#145447] mb-8">Baza ogłoszeń</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters */}
        <aside className="w-full lg:w-1/4">
          <form className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
          <div className="flex items-center gap-2 text-lg font-semibold text-[#145447] mb-2">
              <Filter className="w-5 h-5" />
              <span>Filtruj wyniki</span>
            </div>

            <div>
              <label htmlFor="q" className="block text-sm font-medium text-gray-700 mb-1">Szukaj</label>
              <input type="text" id="q" name="q" defaultValue={q} placeholder="Tytuł, numer..." className="w-full px-3 py-2 border rounded-md" />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select id="status" name="status" defaultValue={status} className="w-full px-3 py-2 border rounded-md bg-white">
                <option value="">Wszystkie</option>
                <option value="PUBLISHED">Opublikowane</option>
                <option value="IN_PROGRESS">W toku</option>
                <option value="RESOLVED">Rozstrzygnięte</option>
                <option value="CANCELLED">Unieważnione</option>
              </select>
            </div>

            <div>
              <label htmlFor="orderType" className="block text-sm font-medium text-gray-700 mb-1">Rodzaj zamówienia</label>
              <select id="orderType" name="orderType" defaultValue={orderType} className="w-full px-3 py-2 border rounded-md bg-white">
                <option value="">Wszystkie</option>
                {Object.entries(ORDER_TYPE_LABELS || {}).map(([val, label]) => (
                  <option key={val} value={val}>{String(label)}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="voivodeship" className="block text-sm font-medium text-gray-700 mb-1">Województwo</label>
              <select id="voivodeship" name="voivodeship" defaultValue={voivodeship} className="w-full px-3 py-2 border rounded-md bg-white">
                <option value="">Wszystkie</option>
                {(VOIVODESHIPS || []).map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="org" className="block text-sm font-medium text-gray-700 mb-1">Organizacja</label>
              <input type="text" id="org" name="org" defaultValue={org} placeholder="Nazwa organizacji..." className="w-full px-3 py-2 border rounded-md" />
            </div>

            <button type="submit" className="w-full bg-[#145447] hover:bg-[#0D4036] text-white font-medium py-2 px-4 rounded-md transition-colors">
              Zastosuj filtry
            </button>
            <Link href="/ogloszenia" className="block w-full text-center text-sm text-gray-500 hover:text-gray-700">
              Wyczyść filtry
            </Link>
          </form>
        </aside>

        {/* Results */}
        <div className="w-full lg:w-3/4 flex flex-col">
          <div className="flex flex-wrap justify-between items-center mb-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <span className="text-sm text-gray-600">
              Znaleziono: <strong className="text-gray-900">{total}</strong> ogłoszeń
            </span>
            <form className="flex items-center gap-2">
              <input type="hidden" name="q" value={q} />
              <input type="hidden" name="status" value={status} />
              <input type="hidden" name="orderType" value={orderType} />
              <input type="hidden" name="voivodeship" value={voivodeship} />
              <input type="hidden" name="org" value={org} />
              <label htmlFor="sort" className="text-sm text-gray-600">Sortuj:</label>
              <select
                id="sort"
                name="sort"
                defaultValue={sort}
                className="px-2 py-1 border rounded text-sm bg-white"
              >
                <option value="newest">Najnowsze</option>
                <option value="oldest">Najstarsze</option>
                <option value="deadline">Termin składania ofert</option>
              </select>
              <button type="submit" className="px-3 py-1 rounded bg-[#145447] text-white text-sm">Sortuj</button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-700 border-b">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Numer / Tytuł</th>
                    <th className="px-4 py-3 font-semibold">Organizacja / Województwo</th>
                    <th className="px-4 py-3 font-semibold">Daty</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {announcements.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        Nie znaleziono ogłoszeń spełniających kryteria.
                      </td>
                    </tr>
                  ) : (
                    announcements.map((a: any) => {
                      const statusColor = (STATUS_COLORS as Record<string, string>)[a.status] || "bg-gray-100 text-gray-800";
                      const statusLabel = (STATUS_LABELS as Record<string, string>)[a.status] || a.status;

                      return (
                        <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 w-2/5">
                            <span className="text-xs text-gray-500 mb-1 block">{a.procedureNumber}</span>
                          <Link href={`/ogloszenia/${a.id}`} className="text-[#145447] font-semibold hover:underline line-clamp-2">
                              {a.title}
                            </Link>
                          </td>
                          <td className="px-4 py-4 w-1/4">
                            <div className="text-gray-900 font-medium line-clamp-2">{a.organization?.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{a.voivodeship}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-600">
                            <div><span className="text-gray-700">Publikacja:</span> {a.publishedAt ? formatDate(a.publishedAt) : "-"}</div>
                            <div className="mt-1 font-medium"><span className="text-gray-700 font-normal">Termin:</span> {a.bidsDeadline ? formatDate(a.bidsDeadline) : "-"}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                              {statusLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <span className="text-sm text-gray-600">
                Strona {page} z {totalPages}
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/ogloszenia?${new URLSearchParams({ ...resolvedParams as Record<string, string>, page: String(page - 1) }).toString()}`}
                    className="p-2 rounded border hover:bg-gray-50"
                    aria-label="Poprzednia strona"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/ogloszenia?${new URLSearchParams({ ...resolvedParams as Record<string, string>, page: String(page + 1) }).toString()}`}
                    className="p-2 rounded border hover:bg-gray-50"
                    aria-label="Następna strona"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
