"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function QuestionForm({ announcementId }: { announcementId: string }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [success, setSuccess] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); setBusy(true); setError(""); setSuccess(false);
    try {
      const response = await fetch(`/api/announcements/${announcementId}/questions`, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName: data.get("name"), authorEmail: data.get("email"), content: data.get("content") }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error); form.reset(); setSuccess(true); router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Nie udało się wysłać pytania"); } finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="space-y-3 max-w-xl">
    <p className="text-sm">Treść pytania zostanie opublikowana. Dane kontaktowe są widoczne tylko dla zamawiającego i administratora.</p>
    <label htmlFor="question-name" className="block">Imię i nazwisko / Nazwa firmy</label><input id="question-name" name="name" maxLength={200} className="w-full p-2 border rounded" />
    <label htmlFor="question-email" className="block">E-mail</label><input id="question-email" type="email" name="email" required className="w-full p-2 border rounded" />
    <label htmlFor="question-content" className="block">Treść pytania</label><textarea id="question-content" name="content" required minLength={10} maxLength={10000} rows={4} className="w-full p-2 border rounded" />
    {error && <p role="alert" className="text-red-700">{error}</p>}{success && <p role="status">Pytanie zostało zapisane.</p>}
    <button disabled={busy} className="bg-[#145447] text-white px-4 py-2 rounded disabled:opacity-60">{busy ? "Wysyłanie…" : "Wyślij pytanie"}</button>
  </form>;
}
