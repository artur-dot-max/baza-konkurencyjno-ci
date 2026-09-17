import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FileText, CheckCircle, Send, BarChart3 } from "lucide-react";
import Link from "next/link";
import { formatDate, STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.organizationId) {
    redirect("/logowanie");
  }

  const organizationId = session.user.organizationId;

  const [activeCount, completedCount, totalCount, recentAnnouncements] = await Promise.all([
    prisma.announcement.count({
      where: { organizationId, status: { in: ["PUBLISHED", "IN_PROGRESS"] } },
    }),
    prisma.announcement.count({
      where: { organizationId, status: { in: ["RESOLVED", "COMPLETED"] } },
    }),
    prisma.announcement.count({
      where: { organizationId, status: "PUBLISHED" },
    }),
    prisma.announcement.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-900">Pulpit</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-4 bg-navy-100 text-navy-800 rounded-full">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Aktywne postępowania</p>
              <h3 className="text-2xl font-bold">{activeCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-4 bg-green-100 text-green-700 rounded-full">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Zakończone postępowania</p>
              <h3 className="text-2xl font-bold">{completedCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-4 bg-blue-100 text-blue-700 rounded-full">
              <Send className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Złożone oferty</p>
              <h3 className="text-2xl font-bold">0</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-4 bg-purple-100 text-purple-700 rounded-full">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Opublikowane ogłoszenia</p>
              <h3 className="text-2xl font-bold">{totalCount}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ostatnie ogłoszenia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3">Numer</th>
                  <th className="px-4 py-3">Tytuł</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Data dodania</th>
                  <th className="px-4 py-3 text-right">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {recentAnnouncements.map((ann) => (
                  <tr key={ann.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{ann.procedureNumber}</td>
                    <td className="px-4 py-3 truncate max-w-xs" title={ann.title}>{ann.title}</td>
                    <td className="px-4 py-3">
                      <Badge className={STATUS_COLORS[ann.status as keyof typeof STATUS_COLORS] || "bg-gray-100 text-gray-800"}>
                        {STATUS_LABELS[ann.status as keyof typeof STATUS_LABELS] || ann.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{formatDate(ann.createdAt)}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/ogloszenia/${ann.id}`}>Podgląd</Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/panel/ogloszenia/${ann.id}/edycja`}>Edytuj</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
                {recentAnnouncements.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Brak ogłoszeń.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-center">
            <Button asChild variant="link">
              <Link href="/panel/ogloszenia">Zobacz wszystkie</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
