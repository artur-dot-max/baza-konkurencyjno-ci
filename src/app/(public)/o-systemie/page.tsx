import { Metadata } from "next"

export const metadata: Metadata = {
  title: "O Systemie | Baza Konkurencyjności",
  description: "Informacje o systemie Baza Konkurencyjności Funduszu Sprawiedliwości, jego celach i zasadach działania.",
}

export default function AboutSystemPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-[#145447] mb-8">O Systemie</h1>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-[#145447] mb-4">Czym jest Baza Konkurencyjności?</h2>
        <p className="text-gray-700 mb-4">
          Baza Konkurencyjności to platforma informatyczna przeznaczona do publikacji ogłoszeń o zamówieniach
          przez beneficjentów Funduszu Sprawiedliwości. Głównym celem systemu jest zapewnienie maksymalnej
          przejrzystości oraz konkurencyjności przy wydatkowaniu środków publicznych.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-[#145447] mb-4">Dla kogo jest system?</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li><strong>Beneficjenci (Organizacje)</strong> - podmioty realizujące projekty finansowane ze środków Funduszu Sprawiedliwości, poszukujące wykonawców.</li>
          <li><strong>Wykonawcy</strong> - firmy i osoby fizyczne zainteresowane realizacją zamówień dla beneficjentów Funduszu.</li>
          <li><strong>Społeczeństwo</strong> - każdy obywatel, który chce mieć wgląd w to, jak wydatkowane są środki publiczne (transparentność).</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-[#145447] mb-4">Jak to działa?</h2>
        <ol className="list-decimal pl-6 text-gray-700 space-y-2">
          <li><strong>Rejestracja</strong> - organizacja rejestruje się w systemie podając swoje dane.</li>
          <li><strong>Zatwierdzenie</strong> - administrator weryfikuje i akceptuje konto.</li>
          <li><strong>Publikacja ogłoszeń</strong> - beneficjent publikuje zapytanie ofertowe, określając termin składania ofert.</li>
          <li><strong>Otrzymywanie pytań</strong> - potencjalni wykonawcy mogą zadawać pytania do ogłoszenia, na które beneficjent odpowiada w systemie.</li>
          <li><strong>Rozstrzygnięcie</strong> - po upływie terminu składania ofert, beneficjent wybiera najkorzystniejszą ofertę i publikuje wynik postępowania.</li>
        </ol>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-[#145447] mb-4">Podstawa prawna</h2>
        <p className="text-gray-700">
          Funkcjonowanie Bazy opiera się na tzw. <strong>zasadzie konkurencyjności</strong>, która
          jest podstawowym wymogiem przy wydatkowaniu funduszy unijnych i krajowych. Ma ona na celu
          zapewnienie równego dostępu do zamówień, przejrzystości postępowania oraz wyboru najkorzystniejszej
          oferty z zachowaniem zasad uczciwej konkurencji.
        </p>
      </section>
    </div>
  )
}
