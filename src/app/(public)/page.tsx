import { publicAnnouncementWhere } from "@/lib/access";
import Link from "next/link";
import { Search, FileText, Building2, CheckCircle, Calendar, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate, STATUS_LABELS } from "@/lib/utils";
import { newsExcerpt, publicNewsWhere } from "@/lib/news";

export default async function HomePage() {
  const [announcementsCount, orgCount, finishedCount, latestAnnouncements, latestNews] = await Promise.all([
    prisma.announcement.count({ where: publicAnnouncementWhere() }).catch(() => 0),
    prisma.organization.count().catch(() => 0),
    prisma.announcement.count({ where: { AND: [publicAnnouncementWhere()], status: { in: ["RESOLVED", "COMPLETED", "CANCELLED"] } } }).catch(() => 0),
    prisma.announcement.findMany({
      where: publicAnnouncementWhere(),
      orderBy: { publishedAt: "desc" },
      take: 5,
      include: { organization: true }
    }).catch(() => []),
    prisma.news.findMany({
      where: publicNewsWhere(),
      orderBy: { publishedAt: "desc" },
      take: 3
    }).catch(() => [])
  ]);

  return (
    <div className="flex flex-col gap-12 pb-12 bg-[#F1F5F2]">
      {/* Hero Banner */}
      <section className="bg-[#145447] text-white py-20 px-4">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Baza Konkurencyjności<br />
              <span className="text-[#B8DB8F]">Funduszu Sprawiedliwości</span>
            </h1>
            <p className="text-lg text-[#9AD1BE] max-w-2xl">
              Portal ogłoszeń i postępowań dla beneficjentów Funduszu Sprawiedliwości.
              Przejrzyste, otwarte i konkurencyjne procedury.
            </p>
            <div className="flex gap-4 max-w-md mt-8">
              <form action="/ogloszenia" className="flex w-full">
                <input
                  type="text"
                  name="q"
                  placeholder="Szukaj ogłoszeń..."
                  className="w-full px-4 py-3 rounded-l-md text-gray-900 focus:outline-none"
                />
                <button type="submit" className="bg-[#B8DB8F] hover:bg-[#A7CC7D] px-6 py-3 rounded-r-md transition-colors flex items-center justify-center">
                  <Search className="w-5 h-5 text-[#123F36]" />
                  <span className="sr-only">Szukaj</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-20">
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-[#E5F2ED] rounded-full text-[#145447]">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Ogłoszenia</p>
              <p className="text-3xl font-bold text-gray-900">{announcementsCount}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-[#E5F2ED] rounded-full text-[#145447]">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Organizacje</p>
              <p className="text-3xl font-bold text-gray-900">{orgCount}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-green-50 rounded-full text-green-700">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Zakończone postępowania</p>
              <p className="text-3xl font-bold text-gray-900">{finishedCount}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Announcements */}
      <section className="container mx-auto max-w-6xl px-4">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-[#145447]">Najnowsze ogłoszenia</h2>
          <Link href="/ogloszenia" className="text-[#145447] hover:underline flex items-center gap-1 font-medium">
            Zobacz wszystkie <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Numer i Tytuł</th>
                  <th className="px-6 py-4 font-semibold">Organizacja</th>
                  <th className="px-6 py-4 font-semibold">Termin ofert</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {latestAnnouncements.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Brak najnowszych ogłoszeń</td></tr>
                ) : (
                  latestAnnouncements.map((a: any) => (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/ogloszenia/${a.id}`} className="text-[#145447] font-semibold hover:underline block mb-1">
                          {a.title}
                        </Link>
                        <span className="text-xs text-gray-500">{a.procedureNumber}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{a.organization?.name}</td>
                      <td className="px-6 py-4 text-gray-700">{a.bidsDeadline ? formatDate(a.bidsDeadline) : "-"}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-[#DCEDE7] text-[#145447]">
                          {STATUS_LABELS[a.status] ?? a.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* News Section */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-[#145447]">Aktualności</h2>
            <Link href="/aktualnosci" className="text-sm font-semibold text-[#145447] hover:underline">
              Wszystkie aktualności
            </Link>
          </div>
          <div className="space-y-4">
            {latestNews.length === 0 ? (
              <p className="text-gray-600">Brak aktualności.</p>
            ) : (
              latestNews.map((news: any) => (
                <article key={news.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(news.publishedAt ?? news.createdAt)}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">
                    <Link href={`/aktualnosci/${news.id}`} className="text-gray-900 hover:text-[#145447] hover:underline">
                      {news.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 line-clamp-2">{newsExcerpt(news.content, news.excerpt)}</p>
                  <Link href={`/aktualnosci/${news.id}`} className="inline-flex mt-3 text-sm font-semibold text-[#145447] hover:underline">
                    Czytaj więcej
                  </Link>
                </article>
              ))
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[#E5F2ED] p-8 rounded-xl border border-[#B9DBCF] flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-[#145447] mb-4">Dołącz do systemu</h2>
          <p className="text-gray-700 mb-8 leading-relaxed">
            Jesteś beneficjentem Funduszu Sprawiedliwości? Zarejestruj swoją organizację,
            aby publikować ogłoszenia o zamówieniach i prowadzić postępowania zgodnie z
            zasadą konkurencyjności.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/rejestracja"
              className="bg-[#B8DB8F] hover:bg-[#A7CC7D] text-[#123F36] font-medium px-6 py-3 rounded-md transition-colors"
            >
              Zarejestruj organizację
            </Link>
            <Link
              href="/logowanie"
              className="bg-white hover:bg-[#F0F7F4] text-[#145447] font-medium border border-[#B9DBCF] px-6 py-3 rounded-md transition-colors"
            >
              Zaloguj się
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
