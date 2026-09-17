import { Metadata } from "next"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export const metadata: Metadata = {
  title: "FAQ | Baza Konkurencyjności",
  description: "Najczęściej zadawane pytania dotyczące systemu Baza Konkurencyjności.",
}

export default function FAQPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-[#145447] mb-8">Często zadawane pytania (FAQ)</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-[#145447] mb-4">Ogólne</h2>
          <Accordion type="single" collapsible className="w-full bg-white rounded-lg border px-4">
            <AccordionItem value="general-1">
              <AccordionTrigger>Kto może korzystać z systemu?</AccordionTrigger>
              <AccordionContent className="text-gray-700">
                System przeznaczony jest dla beneficjentów Funduszu Sprawiedliwości (do publikacji ogłoszeń),
                wykonawców (do składania ofert) oraz wszystkich obywateli, którzy chcą przeglądać opublikowane ogłoszenia.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="general-2">
              <AccordionTrigger>Czy korzystanie z Bazy jest płatne?</AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Nie, korzystanie z Bazy Konkurencyjności jest całkowicie bezpłatne zarówno dla zamawiających, jak i wykonawców.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="general-3">
              <AccordionTrigger>Czym jest zasada konkurencyjności?</AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Zasada konkurencyjności to wymóg prowadzenia postępowań o udzielenie zamówienia w sposób zapewniający
                przejrzystość oraz równe traktowanie potencjalnych wykonawców.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-[#145447] mb-4">Rejestracja</h2>
          <Accordion type="single" collapsible className="w-full bg-white rounded-lg border px-4">
            <AccordionItem value="reg-1">
              <AccordionTrigger>Jak się zarejestrować?</AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Aby się zarejestrować, kliknij przycisk "Załóż konto" w prawym górnym rogu strony, wypełnij formularz rejestracyjny
                i potwierdź adres e-mail. Po weryfikacji konta przez administratora będziesz mógł w pełni korzystać z systemu.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="reg-2">
              <AccordionTrigger>Jak długo trwa aktywacja konta?</AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Weryfikacja konta organizacji przez administratora trwa zazwyczaj do 2 dni roboczych.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="reg-3">
              <AccordionTrigger>Zapomniałem hasła. Co zrobić?</AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Skorzystaj z opcji "Odzyskaj hasło" dostępnej na stronie logowania. Na podany adres e-mail otrzymasz link do resetowania hasła.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-[#145447] mb-4">Ogłoszenia</h2>
          <Accordion type="single" collapsible className="w-full bg-white rounded-lg border px-4">
            <AccordionItem value="ann-1">
              <AccordionTrigger>Jak opublikować ogłoszenie?</AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Po zalogowaniu się na aktywne konto organizacji, przejdź do Panelu Zamawiającego i kliknij "Dodaj ogłoszenie".
                Wypełnij wszystkie wymagane pola formularza i opublikuj.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="ann-2">
              <AccordionTrigger>Czy mogę edytować opublikowane ogłoszenie?</AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Tak, ogłoszenie można edytować do momentu upływu terminu składania ofert. Należy jednak pamiętać,
                że istotne zmiany mogą wymagać wydłużenia terminu składania ofert.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="ann-3">
              <AccordionTrigger>Jak opublikować rozstrzygnięcie postępowania?</AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Po upływie terminu składania ofert, w Panelu Zamawiającego przejdź do szczegółów danego ogłoszenia i wybierz
                opcję "Dodaj rozstrzygnięcie". Podaj dane wybranego wykonawcy i uzasadnienie.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-[#145447] mb-4">Techniczne</h2>
          <Accordion type="single" collapsible className="w-full bg-white rounded-lg border px-4">
            <AccordionItem value="tech-1">
              <AccordionTrigger>Jakie formaty plików są akceptowane?</AccordionTrigger>
              <AccordionContent className="text-gray-700">
                System akceptuje pliki w formatach: PDF, DOC, DOCX, XLS, XLSX, ZIP. Maksymalny rozmiar pojedynczego pliku to 50 MB.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="tech-2">
              <AccordionTrigger>Jak usunąć konto?</AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Aby usunąć konto, skontaktuj się z administratorem systemu poprzez formularz na stronie Kontakt lub bezpośrednio
                na adres e-mail wsparcia technicznego.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </div>
  )
}
