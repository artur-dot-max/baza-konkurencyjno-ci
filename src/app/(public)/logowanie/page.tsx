"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setError("Nieprawidłowy email lub hasło. Upewnij się, że konto zostało aktywowane przez administratora.");
      } else {
        router.push("/panel");
        router.refresh();
      }
    } catch (err) {
      setError("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F1F5F2]">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-200">
        <div className="flex flex-col items-center">
          <Image
            src="/logo-fundusz-sprawiedliwosci.png"
            alt="Fundusz Sprawiedliwości"
            width={280}
            height={112}
            priority
            className="mb-5 h-auto w-56"
          />
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Logowanie
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Baza Konkurencyjności Funduszu Sprawiedliwości
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-[#DC2626] p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#DC2626] mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Adres e-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#145447] focus:border-transparent outline-none ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                {...register("email")}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Hasło
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#145447] focus:border-transparent outline-none ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                {...register("password")}
              />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#145447] hover:bg-[#0D4036] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#145447] disabled:opacity-70 transition-colors"
            >
              {loading ? "Logowanie..." : "Zaloguj się"}
            </button>
          </div>
        </form>

        <Link href="/odzyskaj-haslo" className="block text-center underline mt-6">Odzyskaj hasło</Link>
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Nie masz konta?{" "}
            <Link href="/rejestracja" className="font-medium text-[#145447] hover:underline">
              Zarejestruj się
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
