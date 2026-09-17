import { QuestionForm } from "@/components/question-form";
import { isPublicAnnouncement } from "@/lib/access";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { sanitizeRichText } from "@/lib/sanitize";
import { formatDate, STATUS_COLORS, STATUS_LABELS, ORDER_TYPE_LABELS } from "@/lib/utils";
import { ChevronRight, Download, File, Building2, User, Phone, Mail, Clock, ShieldCheck, HelpCircle } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const announcement = await prisma.announcement.findUnique({ where: { id: resolvedParams.id } });
    if (!announcement || !isPublicAnnouncement(announcement)) return { title: "Nie znaleziono ogłoszenia" };
    return {
      title: `${announcement.procedureNumber} - ${announcement.title}`,
      description: announcement.description?.substring(0, 160) || "Szczegóły ogłoszenia",
    };
  } catch {
    return { title: "Ogłoszenie" };
  }
}

export default async function AnnouncementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  let announcement = null;

  try {
    announcement = await prisma.announcement.findUnique({
      where: { id: resolvedParams.id },
      include: {
        organization: true,
        criteria: true,
        attachments: true,
        questions: { where: { isPublic: true }, include: { answers: true } },
        history: { orderBy: { createdAt: "desc" } },
        result: true
      }
    });
  } catch (e) {
    console.error(e);
  }

  if (!announcement || !isPublicAnnouncement(announcement)) {
    notFound();
  }

  const statusColor = (STATUS_COLORS as Record<string, string>)[announcement.status] || "bg-gray-100 text-gray-800";
  const statusLabel = (STATUS_LABELS as Record<string, string>)[announcement.status] || announcement.status;
  const orderTypeLabel = (ORDER_TYPE_LABELS as Record<string, string>)[announcement.orderType] || announcement.orderType;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-700 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[#0A2B5C] hover:underline">Strona główna</Link>
        <ChevronRight className="w-4 h-4 mx-1" />
        <Link href="/ogloszenia" className="hover:text-[#0A2B5C] hover:underline">Ogłoszenia</Link>
        <ChevronRight className="w-4 h-4 mx-1" />
        <span className="text-gray-900 truncate max-w-xs">{announcement.procedureNumber}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          <div>
            <span className="text-gray-500 text-sm font-medium tracking-wide">{announcement.procedureNumber}</span>
        <h1 className="text-2xl md:text-3xl font-bold text-[#145447] mt-2">{announcement.title}</h1>
          </div>
          <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${statusColor} self-start`}>
            {statusLabel}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 mt-6 pt-6 border-t">
          <Building2 className="w-5 h-5 text-gray-400" />
          <span className="font-medium">{announcement.organization?.name}</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Dane podstawowe */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <h2 className="bg-[#F0F7F4] px-6 py-4 border-b text-lg font-bold text-[#145447]">1. Dane podstawowe</h2>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Rodzaj zamówienia</p>
              <p className="font-medium text-gray-900">{orderTypeLabel}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Miejscowość / Województwo</p>
              <p className="font-medium text-gray-900">{announcement.location || "-"} / {announcement.voivodeship || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Data publikacji</p>
              <p className="font-medium text-gray-900">{announcement.publishedAt ? formatDate(announcement.publishedAt) : "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Termin realizacji</p>
              <p className="font-medium text-gray-900">{announcement.executionTerm || "-"}</p>
            </div>
          </div>
        </section>

        {/* Section 5: Termin składania ofert */}
        <section className="bg-[#E5F2ED] rounded-lg shadow-sm border border-[#B9DBCF] overflow-hidden">
          <div className="p-6 flex items-start gap-4">
            <Clock className="w-8 h-8 text-[#145447] shrink-0" />
            <div>
              <h2 className="text-lg font-bold text-[#145447] mb-2">Termin składania ofert</h2>
              <p className="text-2xl font-black text-gray-900">
                {announcement.bidsDeadline ? formatDate(announcement.bidsDeadline) : "Nie określono"}
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Opis przedmiotu zamówienia */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <h2 className="bg-[#F0F7F4] px-6 py-4 border-b text-lg font-bold text-[#145447]">2. Opis przedmiotu zamówienia</h2>
          <div className="p-6 prose max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(announcement.description || "Brak opisu") }} />
        </section>

        {/* Section 3: Warunki udziału */}
        {announcement.conditions && (
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <h2 className="bg-[#F0F7F4] px-6 py-4 border-b text-lg font-bold text-[#145447]">3. Warunki udziału w postępowaniu</h2>
            <div className="p-6 prose max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(announcement.conditions) }} />
          </section>
        )}

        {/* Section 4: Kryteria oceny */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <h2 className="bg-[#F0F7F4] px-6 py-4 border-b text-lg font-bold text-[#145447]">4. Kryteria oceny ofert</h2>
          <div className="p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 font-semibold text-gray-700">Nazwa kryterium</th>
                  <th className="px-6 py-3 font-semibold text-gray-700 w-24">Waga (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(announcement.criteria as any[])?.length > 0 ? (
                  (announcement.criteria as any[]).map((c) => (
                    <tr key={c.id}>
                      <td className="px-6 py-4">{c.name}</td>
                      <td className="px-6 py-4 font-medium">{c.weight}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-gray-500">Brak określonych kryteriów</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 6: Sposób składania ofert */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <h2 className="bg-[#F0F7F4] px-6 py-4 border-b text-lg font-bold text-[#145447]">Sposób składania ofert</h2>
          <div className="p-6 text-gray-700 whitespace-pre-wrap">
            {announcement.submissionMethod || "Nie określono"}
          </div>
        </section>

        {/* Section 7: Osoba do kontaktu */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <h2 className="bg-[#F0F7F4] px-6 py-4 border-b text-lg font-bold text-[#145447]">Osoba do kontaktu</h2>
          <div className="p-6 space-y-3">
            <div className="flex items-center gap-3 text-gray-700">
              <User className="w-5 h-5 text-gray-400" />
              <span>{announcement.contactPerson || "Nie podano"}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Phone className="w-5 h-5 text-gray-400" />
              <span>{announcement.contactPhone || "Nie podano"}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Mail className="w-5 h-5 text-gray-400" />
              <a href={`mailto:${announcement.contactEmail}`} className="text-[#145447] hover:underline">
                {announcement.contactEmail || "Nie podano"}
              </a>
            </div>
          </div>
        </section>

        {/* Section 8: Załączniki */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <h2 className="bg-[#F0F7F4] px-6 py-4 border-b text-lg font-bold text-[#145447]">Załączniki</h2>
          <div className="p-6">
            {(announcement.attachments as any[])?.length > 0 ? (
              <ul className="space-y-3">
                {(announcement.attachments as any[]).map((file) => (
                  <li key={file.id} className="flex items-center justify-between p-3 gap-3 flex-wrap bg-gray-50 rounded-md border border-gray-200">
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-[#145447]" />
                      <div>
                        <p className="font-medium text-sm text-gray-900 break-all">{file.originalName}</p>
                        <p className="text-xs text-gray-500">{Math.round(file.fileSize / 1024)} KB</p>
                      </div>
                    </div>
                    <a href={file.filePath} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-[#145447] hover:bg-[#F0F7F4] px-3 py-1.5 rounded transition-colors font-medium">
                      <Download className="w-4 h-4" />
                      Pobierz
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">Brak załączników.</p>
            )}
          </div>
        </section>

        {/* Section 11: Wynik postępowania */}
        {announcement.status === "RESOLVED" && (announcement.result || announcement.resolution) && (
          <section className="bg-green-50 rounded-lg shadow-sm border border-green-200 overflow-hidden">
            <h2 className="bg-green-100 px-6 py-4 border-b border-green-200 text-lg font-bold text-green-800 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Wynik postępowania
            </h2>
            <div className="p-6">
              {announcement.result ? <dl className="space-y-3">
                <dt className="font-semibold">Wybrany wykonawca</dt><dd>{announcement.result.contractorName}</dd>
                {announcement.result.contractorNip && <><dt className="font-semibold">NIP</dt><dd>{announcement.result.contractorNip}</dd></>}
                <dt className="font-semibold">Cena</dt><dd>{Number(announcement.result.price).toLocaleString("pl-PL", { style: "currency", currency: "PLN" })}</dd>
                <dt className="font-semibold">Uzasadnienie wyboru</dt><dd className="whitespace-pre-wrap">{announcement.result.justification}</dd>
              </dl> : <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeRichText(announcement.resolution || "") }} />}
            </div>
          </section>
        )}

        {/* Section 12: Informacja o unieważnieniu */}
        {announcement.status === "CANCELLED" && announcement.cancellationReason && (
          <section className="bg-red-50 rounded-lg shadow-sm border border-red-200 overflow-hidden">
            <h2 className="bg-red-100 px-6 py-4 border-b border-red-200 text-lg font-bold text-[#DC2626] flex items-center gap-2">
              <HelpCircle className="w-5 h-5" /> Informacja o unieważnieniu
            </h2>
            <div className="p-6">
              <p className="text-red-900 whitespace-pre-wrap">{announcement.cancellationReason}</p>
            </div>
          </section>
        )}

        {/* Pytania i odpowiedzi */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <h2 className="bg-[#F0F7F4] px-6 py-4 border-b text-lg font-bold text-[#145447] flex items-center gap-2">
            <HelpCircle className="w-5 h-5" /> Pytania i odpowiedzi
          </h2>
          <div className="p-6">
            {(announcement.questions as any[])?.length > 0 ? (
              <div className="space-y-6">
                {(announcement.questions as any[]).map((q) => (
                  <div key={q.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-900">Pytanie</span>
                        <span className="text-xs text-gray-500">{formatDate(q.createdAt)}</span>
                      </div>
                      <p className="text-gray-700">{q.content}</p>
                    </div>
                    {(q.answers as any[])?.length > 0 && (
                      <div className="p-4 bg-blue-50">
                        <span className="font-semibold text-blue-900 mb-2 block">Odpowiedzi:</span>
                        <ul className="space-y-3">
                          {(q.answers as any[]).map((a: any) => (
                            <li key={a.id} className="text-blue-800">
                              <span className="text-xs text-blue-700 block mb-1">{formatDate(a.createdAt)}</span>
                              <p>{a.content}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mb-6">Brak pytań do tego ogłoszenia.</p>
            )}

            <div className="mt-8 border-t pt-6">
              <h3 className="font-bold text-gray-900 mb-4">Zadaj pytanie</h3>
              {["PUBLISHED", "IN_PROGRESS"].includes(announcement.status) && announcement.bidsDeadline && announcement.bidsDeadline > new Date()
                ? <QuestionForm announcementId={announcement.id} /> : <p>Przyjmowanie pytań zakończone.</p>}
            </div>
          </div>
        </section>

        {/* Historia zmian */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <h2 className="bg-[#F0F7F4] px-6 py-4 border-b text-lg font-bold text-[#145447] flex items-center gap-2">
            <Clock className="w-5 h-5" /> Historia zmian
          </h2>
          <div className="p-6">
            {(announcement.history as any[])?.length > 0 ? (
              <ul className="space-y-4">
                {(announcement.history as any[]).map((h) => (
                  <li key={h.id} className="flex flex-col sm:flex-row gap-4">
                    <div className="w-32 shrink-0 text-sm text-gray-500">
                      {formatDate(h.createdAt)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{h.action}</p>
                      {h.details && <p className="text-sm text-gray-600 mt-1">{h.details}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Brak historii zmian dla tego ogłoszenia.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
