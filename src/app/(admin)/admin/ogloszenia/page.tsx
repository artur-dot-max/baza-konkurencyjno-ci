"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const query = statusFilter ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/announcements${query}`);
      const data = await res.json();
      if (data.data) {
        setAnnouncements(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const deleteAnnouncement = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć to ogłoszenie?")) return;
    try {
      await fetch(`/api/announcements/${id}`, {
        method: "DELETE",
      });
      fetchAnnouncements();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredAnnouncements = announcements.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.procedureNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-navy-900">Zarządzanie ogłoszeniami</h1>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Szukaj po tytule lub numerze..."
          className="border p-2 rounded w-full max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border p-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Wszystkie statusy</option>
          <option value="DRAFT">Szkic</option>
          <option value="PUBLISHED">Opublikowane</option>
          <option value="RESOLVED">Rozstrzygnięte</option>
          <option value="CANCELLED">Anulowane</option>
        </select>
      </div>

      <div className="bg-white rounded-md shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tytuł</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organizacja</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data publ.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akcje</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-4">Ładowanie...</td></tr>
            ) : filteredAnnouncements.map((a) => (
              <tr key={a.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{a.number}</td>
                <td className="px-6 py-4 text-sm truncate max-w-xs">{a.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{a.organization?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {a.status}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{a.publishDate ? formatDate(a.publishDate) : "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/ogloszenie/${a.id}`}>Podgląd</Link>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteAnnouncement(a.id)}>
                    Usuń
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
