"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { registerOrganizationSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Building2 } from "lucide-react";
import { VOIVODESHIPS } from "@/lib/utils";

type RegisterForm = z.infer<typeof registerOrganizationSchema>;

export default function RegisterPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerOrganizationSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Wystąpił błąd podczas rejestracji");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Wystąpił nieoczekiwany błąd");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 bg-[#F1F5F2]">
        <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-lg border border-gray-200 text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Rejestracja pomyślna</h2>
          <p className="text-gray-600">
            Rejestracja przebiegła pomyślnie. Twoje konto oczekuje na aktywację przez administratora systemu.
            Otrzymasz powiadomienie e-mail, gdy proces zostanie zakończony.
          </p>
          <div className="pt-4">
            <Link href="/" className="inline-block bg-[#145447] text-white px-6 py-2 rounded-md font-medium hover:bg-[#0D4036] transition-colors">
              Wróć na stronę główną
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-[#F1F5F2] min-h-screen">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-10 rounded-xl shadow-lg border border-gray-200">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b">
          <div className="bg-[#145447] p-3 rounded-full shrink-0">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              Rejestracja organizacji
            </h1>
            <p className="text-gray-600 mt-1">
              Wypełnij formularz, aby dołączyć do Bazy Konkurencyjności jako Zamawiający.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-[#DC2626] p-4 mb-8">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Dane organizacji */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#145447]">1. Dane rejestrowe</h2>

            <div>
              <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-1">Pełna nazwa organizacji *</label>
              <input id="organizationName" type="text" autoComplete="organization" className={`w-full px-4 py-2 border rounded-md focus:ring-[#145447] focus:border-[#145447] ${errors.organizationName ? 'border-red-500' : 'border-gray-300'}`} {...register("organizationName")} />
              {errors.organizationName && <p className="mt-1 text-xs text-red-500">{errors.organizationName.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="nip" className="block text-sm font-medium text-gray-700 mb-1">NIP *</label>
                <input id="nip" type="text" inputMode="numeric" className={`w-full px-4 py-2 border rounded-md focus:ring-[#145447] focus:border-[#145447] ${errors.nip ? 'border-red-500' : 'border-gray-300'}`} {...register("nip")} />
                {errors.nip && <p className="mt-1 text-xs text-red-500">{errors.nip.message}</p>}
              </div>
              <div>
                <label htmlFor="regon" className="block text-sm font-medium text-gray-700 mb-1">REGON *</label>
                <input id="regon" type="text" inputMode="numeric" className={`w-full px-4 py-2 border rounded-md focus:ring-[#145447] focus:border-[#145447] ${errors.regon ? 'border-red-500' : 'border-gray-300'}`} {...register("regon")} />
                {errors.regon && <p className="mt-1 text-xs text-red-500">{errors.regon.message}</p>}
              </div>
              <div>
                <label htmlFor="krs" className="block text-sm font-medium text-gray-700 mb-1">KRS (opcjonalnie)</label>
                <input id="krs" type="text" inputMode="numeric" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#145447] focus:border-[#145447]" {...register("krs")} />
              </div>
            </div>
          </div>

          <hr />

          {/* Dane adresowe */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#145447]">2. Dane adresowe</h2>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Ulica i numer *</label>
              <input id="address" type="text" autoComplete="street-address" className={`w-full px-4 py-2 border rounded-md focus:ring-[#145447] focus:border-[#145447] ${errors.address ? 'border-red-500' : 'border-gray-300'}`} {...register("address")} />
              {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">Kod pocztowy *</label>
                <input id="postalCode" type="text" autoComplete="postal-code" placeholder="XX-XXX" className={`w-full px-4 py-2 border rounded-md focus:ring-[#145447] focus:border-[#145447] ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`} {...register("postalCode")} />
                {errors.postalCode && <p className="mt-1 text-xs text-red-500">{errors.postalCode.message}</p>}
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Miejscowość *</label>
                <input id="city" type="text" autoComplete="address-level2" className={`w-full px-4 py-2 border rounded-md focus:ring-[#145447] focus:border-[#145447] ${errors.city ? 'border-red-500' : 'border-gray-300'}`} {...register("city")} />
                {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
              </div>
              <div>
                <label htmlFor="voivodeship" className="block text-sm font-medium text-gray-700 mb-1">Województwo *</label>
                <select id="voivodeship" autoComplete="address-level1" className={`w-full px-4 py-2 border rounded-md focus:ring-[#145447] focus:border-[#145447] bg-white ${errors.voivodeship ? 'border-red-500' : 'border-gray-300'}`} {...register("voivodeship")}>
                  <option value="">Wybierz...</option>
                  {(VOIVODESHIPS || []).map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
                {errors.voivodeship && <p className="mt-1 text-xs text-red-500">{errors.voivodeship.message}</p>}
              </div>
            </div>
          </div>

          <hr />

          {/* Dane kontaktowe i logowania */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#145447]">3. Konto administratora organizacji</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="registration-email" className="block text-sm font-medium text-gray-700 mb-1">Adres e-mail (login) *</label>
                <input id="registration-email" type="email" autoComplete="email" className={`w-full px-4 py-2 border rounded-md focus:ring-[#145447] focus:border-[#145447] ${errors.email ? 'border-red-500' : 'border-gray-300'}`} {...register("email")} />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telefon kontaktowy *</label>
                <input id="phone" type="tel" autoComplete="tel" className={`w-full px-4 py-2 border rounded-md focus:ring-[#145447] focus:border-[#145447] ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} {...register("phone")} />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="registration-password" className="block text-sm font-medium text-gray-700 mb-1">Hasło *</label>
                <input id="registration-password" type="password" autoComplete="new-password" className={`w-full px-4 py-2 border rounded-md focus:ring-[#145447] focus:border-[#145447] ${errors.password ? 'border-red-500' : 'border-gray-300'}`} {...register("password")} />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Powtórz hasło *</label>
                <input id="confirmPassword" type="password" autoComplete="new-password" className={`w-full px-4 py-2 border rounded-md focus:ring-[#145447] focus:border-[#145447] ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`} {...register("confirmPassword")} />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Masz już konto? <Link href="/logowanie" className="font-medium text-[#145447] hover:underline">Zaloguj się</Link>
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 bg-[#145447] hover:bg-[#0D4036] text-white font-medium rounded-md shadow-sm transition-colors disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#145447]"
            >
              {loading ? "Wysyłanie..." : "Zarejestruj organizację"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
