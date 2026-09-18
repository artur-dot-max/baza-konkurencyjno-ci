import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { NewsForm } from "@/components/admin/news-form";

export default function NewNewsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <nav className="flex items-center text-sm text-gray-700" aria-label="Okruszki">
        <Link href="/admin/aktualnosci" className="hover:underline">Aktualności</Link>
        <ChevronRight className="mx-1 h-4 w-4" aria-hidden="true" />
        <span>Nowa aktualność</span>
      </nav>
      <div>
        <h1 className="text-3xl font-bold text-navy-900">Nowa aktualność</h1>
        <p className="mt-1 text-gray-700">Utwórz szkic, opublikuj wpis od razu lub ustaw termin publikacji.</p>
      </div>
      <NewsForm />
    </div>
  );
}
