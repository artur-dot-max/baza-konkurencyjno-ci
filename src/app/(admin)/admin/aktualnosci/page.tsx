"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/lib/utils";
import type { NewsStatus } from "@/lib/news";

interface NewsRow {
  id: string;
  title: string;
  status: NewsStatus;
  publishedAt: string | null;
  updatedAt: string;
}

interface NewsResponse {
  data: NewsRow[];
  pagination: { page: number; total: number; totalPages: number };
  error?: string;
}

const statusLabels: Record<NewsStatus, string> = { DRAFT: "Szkic", PUBLISHED: "Opublikowana", SCHEDULED: "Zaplanowana" };
const statusClasses: Record<NewsStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PUBLISHED: "bg-green-100 text-green-800",
  SCHEDULED: "bg-blue-100 text-blue-800",
};

export default function AdminNewsPage() {
  const [items, setItems] = useState<NewsRow[]>([]);
  const [status, setStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ scope: "admin", page: String(page) });
      if (status) params.set("status", status);
      if (search) params.set("search", search);
      const response = await fetch(`/api/news?${params}`, { cache: "no-store" });
      const result = await response.json() as NewsResponse;
      if (!response.ok) throw new Error(result.error || "Nie udało się pobrać aktualności");
      setItems(result.data);
      setTotal(result.pagination.total);
      setTotalPages(result.pagination.totalPages);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Nie udało się pobrać aktualności");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => { void load(); }, [load]);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  async function remove(item: NewsRow) {
    if (!window.confirm(`Usunąć aktualność „${item.title}”? Tej operacji nie można cofnąć.`)) return;
    setDeleting(item.id);
    setError("");
    try {
      const response = await fetch(`/api/news/${item.id}`, { method: "DELETE" });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Nie udało się usunąć aktualności");
      }
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Nie udało się usunąć aktualności");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Aktualności</h1>
          <p className="mt-1 text-gray-700">Twórz, planuj i publikuj informacje widoczne w serwisie.</p>
        </div>
        <Button asChild><Link href="/admin/aktualnosci/nowa"><Plus className="mr-2 h-4 w-4" aria-hidden="true" />Nowa aktualność</Link></Button>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 shadow-sm sm:flex-row">
        <form onSubmit={submitSearch} className="flex flex-1 gap-2">
          <Input aria-label="Szukaj aktualności" placeholder="Szukaj po tytule..." value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
          <Button type="submit" variant="outline"><Search className="h-4 w-4" aria-hidden="true" /><span className="sr-only">Szukaj</span></Button>
        </form>
        <select aria-label="Filtr statusu" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
          <option value="">Wszystkie statusy</option>
          <option value="DRAFT">Szkice</option>
          <option value="PUBLISHED">Opublikowane</option>
          <option value="SCHEDULED">Zaplanowane</option>
        </select>
      </div>

      {error && <div role="alert" className="rounded-md border border-red-300 bg-red-50 p-3 text-red-800">{error}</div>}

      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-700">Tytuł</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-700">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-700">Publikacja</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-700">Ostatnia zmiana</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-700">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-700">Ładowanie...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-700">Nie znaleziono aktualności.</td></tr>
            ) : items.map((item) => (
              <tr key={item.id}>
                <td className="max-w-md px-5 py-4 font-medium text-gray-900">{item.title}</td>
                <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[item.status]}`}>{statusLabels[item.status]}</span></td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">{item.publishedAt ? formatDateTime(item.publishedAt) : "—"}</td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">{formatDateTime(item.updatedAt)}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild><Link href={`/admin/aktualnosci/${item.id}/podglad`} aria-label={`Podgląd: ${item.title}`}><Eye className="h-4 w-4" /></Link></Button>
                    <Button variant="ghost" size="icon" asChild><Link href={`/admin/aktualnosci/${item.id}/edycja`} aria-label={`Edytuj: ${item.title}`}><Pencil className="h-4 w-4" /></Link></Button>
                    <Button variant="ghost" size="icon" onClick={() => void remove(item)} disabled={deleting === item.id} aria-label={`Usuń: ${item.title}`} className="text-red-700 hover:text-red-800"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-700">
        <p>Liczba wpisów: {total}</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((value) => value - 1)} disabled={page <= 1}>Poprzednia</Button>
          <span>Strona {page} z {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((value) => value + 1)} disabled={page >= totalPages}>Następna</Button>
        </div>
      </div>
    </div>
  );
}
