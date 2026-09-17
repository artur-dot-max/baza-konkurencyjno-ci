import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Polityka Prywatności | Baza Konkurencyjności",
  description: "Polityka prywatności i informacja o przetwarzaniu danych osobowych.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-[#145447] mb-8">Polityka Prywatności</h1>

      <div className="prose prose-green max-w-none text-gray-700">
        <h2 className="text-xl font-semibold text-[#145447] mt-8 mb-4">1. Administrator danych osobowych</h2>
        <p>Administratorem danych osobowych jest instytucja zarządzająca Funduszem Sprawiedliwości.</p>

        <h2 className="text-xl font-semibold text-[#145447] mt-8 mb-4">2. Cele przetwarzania danych</h2>
        <p>Dane osobowe przetwarzane są w celu:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Rejestracji i obsługi konta w Systemie,</li>
          <li>Publikacji ogłoszeń o zamówieniach,</li>
          <li>Umożliwienia kontaktu pomiędzy Organizacjami a Wykonawcami,</li>
          <li>Zapewnienia bezpieczeństwa Systemu oraz celów archiwizacyjnych.</li>
        </ul>

        <h2 className="text-xl font-semibold text-[#145447] mt-8 mb-4">3. Podstawa prawna przetwarzania</h2>
        <p>Przetwarzanie odbywa się na podstawie zgody użytkownika (art. 6 ust. 1 lit. a RODO) oraz w celu wykonania umowy o świadczenie usług drogą elektroniczną (art. 6 ust. 1 lit. b RODO).</p>

        <h2 className="text-xl font-semibold text-[#145447] mt-8 mb-4">4. Zakres przetwarzanych danych</h2>
        <p>Przetwarzamy następujące dane: imię i nazwisko, adres e-mail, numer telefonu, nazwa i adres organizacji, NIP, stanowisko.</p>

        <h2 className="text-xl font-semibold text-[#145447] mt-8 mb-4">5. Okres przechowywania danych</h2>
        <p>Dane będą przechowywane przez okres aktywności konta w Systemie oraz po jego usunięciu przez czas wymagany przepisami prawa w celach archiwizacyjnych.</p>

        <h2 className="text-xl font-semibold text-[#145447] mt-8 mb-4">6. Prawa osób, których dane dotyczą</h2>
        <p>Użytkownik ma prawo do: dostępu do swoich danych, sprostowania, usunięcia lub ograniczenia przetwarzania, wniesienia sprzeciwu wobec przetwarzania, przenoszenia danych oraz cofnięcia zgody.</p>

        <h2 className="text-xl font-semibold text-[#145447] mt-8 mb-4">7. Pliki cookies</h2>
        <p>System wykorzystuje pliki cookies w celu zapewnienia prawidłowego działania (sesje logowania, preferencje). Użytkownik może zarządzać plikami cookies z poziomu swojej przeglądarki.</p>

        <h2 className="text-xl font-semibold text-[#145447] mt-8 mb-4">8. Zmiany polityki prywatności</h2>
        <p>Polityka może ulegać zmianom, o których będziemy informować w Systemie.</p>

        <h2 className="text-xl font-semibold text-[#145447] mt-8 mb-4">9. Kontakt w sprawie danych osobowych</h2>
        <p>W sprawach związanych z ochroną danych osobowych prosimy o kontakt na adres e-mail: iod@funduszsprawiedliwosci.gov.pl</p>
      </div>
    </div>
  )
}
