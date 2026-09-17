import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate, STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ArchivePage() {
  const session = await auth();
  if (!session?.user?.organizationId) {
    redirect("/logowanie");
  }

  const archiveAnnouncements = await prisma.announcement.findMany({
    where: {
      organizationId: session.user.organizationId,
      status: { in: ["COMPLETED", "CANCELLED", "RESOLVED"] }
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-900">Archiwum postępowań</h1>

      <Card>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3">Numer</th>
                  <th className="px-4 py-3">Tytuł</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Data zakończenia</th>
                  <th className="px-4 py-3 text-right">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {archiveAnnouncements.map((ann) => (
                  <tr key={ann.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{ann.procedureNumber}</td>
                    <td className="px-4 py-3 max-w-md truncate" title={ann.title}>{ann.title}</td>
                    <td className="px-4 py-3">
                      <Badge className={STATUS_COLORS[ann.status as keyof typeof STATUS_COLORS] || "bg-gray-100 text-gray-800"}>
                        {STATUS_LABELS[ann.status as keyof typeof STATUS_LABELS] || ann.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{formatDate(ann.updatedAt)}</td>
                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/ogloszenia/${ann.id}`}>Zobacz szczegóły</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
                {archiveAnnouncements.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                      Brak archiwalnych ogłoszeń.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
