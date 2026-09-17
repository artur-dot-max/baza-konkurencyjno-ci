import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Regulamin | Baza Konkurencyjności",
  description: "Regulamin korzystania z systemu Baza Konkurencyjności Funduszu Sprawiedliwości.",
}

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-[#145447] mb-8">Regulamin Systemu</h1>

      <div className="prose prose-green max-w-none text-gray-700">
        <h2 className="text-xl font-semibold text-[#145447] mt-8 mb-4">1. Postanowienia ogólne</h2>
        <p>1.1. Niniejszy regulamin określa zasady funkcjonowania i korzystania z systemu Baza Konkurencyjności.</p>
        <p>1.2. Celem Systemu jest zapewnienie przejrzystości postępowań o udzielenie zamówienia prowadzonych przez beneficjentów Funduszu Sprawiedliwości.</p>

        <h2 className="text-xl font-semibold text-[#145447] mt-8 mb-4">2. Definicje</h2>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>System</strong> - aplikacja internetowa Baza Konkurencyjności.</li>
          <li><strong>Użytkownik</strong> - osoba fizyczna korzystająca z Systemu.</li>
          <li><strong>Organizacja</strong> - podmiot zarejestrowany w Systemie jako beneficjent posiadający uprawnienia do publikacji ogłoszeń.</li>
          <li><strong>Ogłoszenie</strong> - informacja o wszczęciu postępowania o udzielenie zamówienia opublikowana w Systemie.</li>
        </ul>

        <h2 className="text-xl font-semibold text-[#145447] mt-8 mb-4">3. Warunki korzystania z systemu</h2>
        <p>3.1. Korzystanie z Systemu jest bezpłatne.</p>
        <p>3.2. Przeglądanie ogłoszeń nie wymaga posiadania konta.</p>

        <h2 className="text-xl font-semibold text-[#145447] mt-8 mb-4">4. Rejestracja i konto</h2>
        <p>4.1. Rejestracja konta Organizacji wymaga podania prawdziwych i aktualnych danych.</p>
        <p>4.2. Konto podlega procesowi weryfikacji przez Administratora Systemu.</p>

        <h2 className="text-xl font-semibold text-[#145447] mt-8 mb-4">5. Publikacja ogłoszeń</h2>
        <p>5.1. Za treść opublikowanego ogłoszenia odpowiada wyłącznie Organizacja.</p>
        <p>5.2. Ogłoszenia muszą być zgodne z prawem oraz zasadami uczciwej konkurencji.</p>

        <h2 className="text-xl font-semibold text-[#145447] mt-8 mb-4">6. Odpowiedzialność</h2>
        <p>6.1. Administrator nie ponosi odpowiedzialności za treść ogłoszeń zamieszczanych przez Użytkowników.</p>
        <p>6.2. Administrator dokłada wszelkich starań, aby zapewnić bezawaryjne działanie Systemu.</p>

        <h2 className="text-xl font-semibold text-[#145447] mt-8 mb-4">7. Ochrona danych osobowych</h2>
        <p>Szczegółowe informacje dotyczące przetwarzania danych osobowych znajdują się w Polityce Prywatności.</p>

        <h2 className="text-xl font-semibold text-[#145447] mt-8 mb-4">8. Zmiany regulaminu</h2>
        <p>Administrator zastrzega sobie prawo do wprowadzania zmian w Regulaminie. O zmianach Użytkownicy zostaną powiadomieni drogą elektroniczną.</p>

        <h2 className="text-xl font-semibold text-[#145447] mt-8 mb-4">9. Postanowienia końcowe</h2>
        <p>W sprawach nieuregulowanych w niniejszym Regulaminie mają zastosowanie powszechnie obowiązujące przepisy prawa polskiego.</p>
      </div>
    </div>
  )
}
