"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
export function PasswordForm({ reset = false }: { reset?: boolean }) {
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (reset) { setToken(new URLSearchParams(window.location.hash.slice(1)).get("token") || ""); window.history.replaceState(null, "", window.location.pathname); }
  }, [reset]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const data = new FormData(event.currentTarget);
    if (reset && data.get("password") !== data.get("confirm")) { setError("Hasła muszą być identyczne."); setBusy(false); return; }
    try {
      const response = await fetch(`/api/password/${reset ? "reset" : "forgot"}`, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reset ? { token, password: data.get("password") } : { email: data.get("email") }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error); setMessage(result.message);
    } catch (error) { setError(error instanceof Error ? error.message : "Nie udało się wykonać operacji"); } finally { setBusy(false); }
  }
  return <section className="max-w-lg mx-auto my-12 p-6 bg-white border rounded-lg">
    <h1 className="text-2xl font-bold mb-6">{reset ? "Ustaw nowe hasło" : "Odzyskaj hasło"}</h1>
    <form onSubmit={submit} className="space-y-4">
      {reset ? <><p id="password-help">8–72 znaki, co najmniej jedna wielka litera i cyfra.</p>
        <label className="block" htmlFor="new-password">Nowe hasło</label><input id="new-password" name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={72} aria-describedby="password-help" className="w-full p-2 border rounded" />
        <label className="block" htmlFor="confirm-password">Powtórz hasło</label><input id="confirm-password" name="confirm" type="password" autoComplete="new-password" required minLength={8} maxLength={72} className="w-full p-2 border rounded" /></> : <><label className="block" htmlFor="reset-email">Adres e-mail</label><input id="reset-email" name="email" type="email" autoComplete="email" required className="w-full p-2 border rounded" /></>}
      {error && <p role="alert" className="text-red-700">{error}</p>}{message && <p role="status" className="text-green-800">{message}</p>}
      <button disabled={busy || !!message} className="bg-[#145447] text-white px-4 py-2 rounded disabled:opacity-60">{busy ? "Proszę czekać…" : reset ? "Zmień hasło" : "Wyślij link"}</button>
    </form><Link href="/logowanie" className="block mt-6 underline">Wróć do logowania</Link>
  </section>;
}
