import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Baza Konkurencyjności Funduszu Sprawiedliwości",
    template: "%s | Baza Konkurencyjności FS",
  },
  description:
    "Baza Konkurencyjności Funduszu Sprawiedliwości — portal zamówień publicznych. Przeglądaj ogłoszenia, składaj oferty, zarządzaj postępowaniami.",
  keywords: [
    "Fundusz Sprawiedliwości",
    "zamówienia publiczne",
    "baza konkurencyjności",
    "ogłoszenia",
    "postępowania",
  ],
  authors: [{ name: "Fundusz Sprawiedliwości" }],
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Baza Konkurencyjności Funduszu Sprawiedliwości",
    title: "Baza Konkurencyjności Funduszu Sprawiedliwości",
    description:
      "Portal zamówień publicznych Funduszu Sprawiedliwości. Przeglądaj ogłoszenia i składaj oferty.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <a href="#main-content" className="skip-link">
          Przejdź do treści głównej
        </a>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
