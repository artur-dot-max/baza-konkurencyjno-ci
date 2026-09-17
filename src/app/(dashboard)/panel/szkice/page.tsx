import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileEdit } from "lucide-react";
import DeleteDraftButton from "./DeleteDraftButton";

export default async function DraftsPage() {
  const session = await auth();
  if (!session?.user?.organizationId) {
    redirect("/logowanie");
  }

  const drafts = await prisma.announcement.findMany({
    where: {
      organizationId: session.user.organizationId,
      status: "DRAFT"
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-navy-900">Szkice ogłoszeń</h1>
      </div>

      <Card>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3">Roboczy tytuł</th>
                  <th className="px-4 py-3">Ostatnia modyfikacja</th>
                  <th className="px-4 py-3 text-right">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {drafts.map((draft) => (
                  <tr key={draft.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium max-w-md truncate">
                      {draft.title || <span className="text-gray-400 italic">Brak tytułu</span>}
                    </td>
                    <td className="px-4 py-3">{formatDate(draft.updatedAt)}</td>
                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/panel/ogloszenia/${draft.id}/edycja`}>
                          <FileEdit className="w-4 h-4 mr-2" />
                          Edytuj
                        </Link>
                      </Button>
                      <DeleteDraftButton id={draft.id} />
                    </td>
                  </tr>
                ))}
                {drafts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center text-gray-500">
                      Brak zapisanych szkiców.
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
