"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import type { NewsStatus } from "@/lib/news";

export interface NewsFormData {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  status: NewsStatus;
  publishedAt: string;
}

const emptyForm: NewsFormData = { title: "", content: "", excerpt: "", status: "DRAFT", publishedAt: "" };

export function NewsForm({ initialData = emptyForm }: { initialData?: NewsFormData }) {
  const router = useRouter();
  const [form, setForm] = useState(() => {
    if (!initialData.publishedAt.endsWith("Z")) return initialData;
    const date = new Date(initialData.publishedAt);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
    return { ...initialData, publishedAt: local };
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEditing = Boolean(form.id);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(isEditing ? `/api/news/${form.id}` : "/api/news", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          excerpt: form.excerpt || null,
          status: form.status,
          publishedAt: form.status === "SCHEDULED" && form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Nie udało się zapisać aktualności");
      router.push("/admin/aktualnosci");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Nie udało się zapisać aktualności");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && <div role="alert" className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      <div className="rounded-lg border bg-white p-5 shadow-sm space-y-5">
        <div className="space-y-2">
          <Label htmlFor="news-title">Tytuł</Label>
          <Input id="news-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} maxLength={200} required />
          <p className="text-xs text-gray-600">{form.title.length}/200 znaków</p>
        </div>
        <div className="space-y-2">
          <Label>Treść</Label>
          <RichTextEditor content={form.content} onChange={(content) => setForm({ ...form, content })} placeholder="Napisz treść aktualności..." ariaLabel="Treść aktualności" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="news-excerpt">Opis SEO i skrót</Label>
          <textarea id="news-excerpt" className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} maxLength={300} placeholder="Opcjonalny opis na liście aktualności i w wynikach wyszukiwania" />
          <p className="text-xs text-gray-600">{form.excerpt.length}/300 znaków. Bez opisu system utworzy skrót z treści.</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm space-y-4">
        <div className="space-y-2">
          <Label htmlFor="news-status">Status</Label>
          <select id="news-status" className="flex h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as NewsStatus })}>
            <option value="DRAFT">Szkic</option>
            <option value="PUBLISHED">Opublikuj teraz</option>
            <option value="SCHEDULED">Zaplanuj publikację</option>
          </select>
        </div>
        {form.status === "SCHEDULED" && (
          <div className="space-y-2">
            <Label htmlFor="news-published-at">Termin publikacji</Label>
            <Input id="news-published-at" type="datetime-local" className="max-w-sm" value={form.publishedAt} onChange={(event) => setForm({ ...form, publishedAt: event.target.value })} required />
            <p className="text-xs text-gray-600">Data jest interpretowana według lokalnej strefy czasowej.</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}><Save className="mr-2 h-4 w-4" aria-hidden="true" />{saving ? "Zapisywanie..." : "Zapisz aktualność"}</Button>
        {form.id && <Button type="button" variant="outline" asChild><Link href={`/admin/aktualnosci/${form.id}/podglad`}><Eye className="mr-2 h-4 w-4" aria-hidden="true" />Podgląd</Link></Button>}
        <Button type="button" variant="ghost" asChild><Link href="/admin/aktualnosci">Anuluj</Link></Button>
      </div>
    </form>
  );
}
