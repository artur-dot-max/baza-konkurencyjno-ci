"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const form = e.currentTarget; const data = Object.fromEntries(new FormData(form));
    setBusy(true); setError(""); setIsSubmitted(false);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await res.json(); if (!res.ok) throw new Error(result.error); setIsSubmitted(true); form.reset();
    } catch (error) { setError(error instanceof Error ? error.message : "Nie udało się wysłać wiadomości"); }
    finally { setBusy(false); }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-[#145447] mb-8">Kontakt</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <div className="bg-[#E5F2ED] p-8 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-[#145447] mb-6">Dane kontaktowe</h2>

            <div className="space-y-4 text-gray-700">
              <div className="flex items-start gap-4">
                <MapPin className="text-[#145447] mt-1 shrink-0" />
                <div>
                  <p className="font-semibold">Fundusz Sprawiedliwości</p>
                  <p>Al. Ujazdowskie 11</p>
                  <p>00-567 Warszawa</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Phone className="text-[#145447] shrink-0" />
                <p>+48 22 123 45 67</p>
              </div>

              <div className="flex items-center gap-4">
                <Mail className="text-[#145447] shrink-0" />
                <p>kontakt@bazakonkurencyjnosci.gov.pl</p>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="text-[#145447] mt-1 shrink-0" />
                <div>
                  <p className="font-semibold">Godziny pracy</p>
                  <p>Poniedziałek - Piątek: 8:00 - 16:00</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center text-gray-700">
            [Mapa Google / OpenStreetMap]
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#145447] mb-6">Napisz do nas</h2>

          {isSubmitted && (
            <div className="bg-[#B8DB8F]/30 text-[#145447] p-4 rounded-md mb-6 border border-[#B8DB8F]">
              Dziękujemy za wiadomość. Skontaktujemy się z Tobą najszybciej jak to możliwe.
            </div>
          )}

          {error && <p role="alert" className="text-red-700 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Imię i nazwisko</label>
              <Input id="name" name="name" required placeholder="Jan Kowalski" />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Adres e-mail</label>
              <Input id="email" name="email" type="email" required placeholder="jan.kowalski@example.com" />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Temat</label>
              <Input id="subject" name="subject" required placeholder="Temat wiadomości" />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Wiadomość</label>
              <Textarea id="message" name="message" rows={6} required placeholder="Treść wiadomości..." />
            </div>

            <Button disabled={busy} type="submit" className="w-full bg-[#145447] hover:bg-[#0f3d34] text-white">
              Wyślij wiadomość
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
