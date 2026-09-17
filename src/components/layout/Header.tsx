import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu } from "lucide-react"
import { auth, signOut } from "@/auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export async function Header() {
  const session = await auth()

  return (
    <header className="w-full bg-[#145447] text-white">
      <div className="h-1 bg-[#B8DB8F] w-full" aria-hidden="true" />
      <div className="container mx-auto max-w-6xl px-4 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">
            <span className="hidden sm:block font-bold text-lg leading-tight">
              Baza Konkurencyjności
            </span>
            <Image
              src="/logo-fundusz-sprawiedliwosci-biale.png"
              alt="Fundusz Sprawiedliwości"
              width={230}
              height={92}
              priority
              className="h-12 w-auto"
            />
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6" aria-label="Nawigacja główna">
          <Link href="/ogloszenia" className="text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded px-2 py-1">
            Ogłoszenia
          </Link>
          <Link href="/aktualnosci" className="text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded px-2 py-1">
            Aktualności
          </Link>
          <Link href="/o-systemie" className="text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded px-2 py-1">
            O Systemie
          </Link>
          <Link href="/faq" className="text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded px-2 py-1">
            FAQ
          </Link>
          <Link href="/kontakt" className="text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded px-2 py-1">
            Kontakt
          </Link>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                  Moje konto
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Zalogowano jako {session.user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={session?.user.role === "ADMIN" ? "/admin" : "/panel"}>{session?.user.role === "ADMIN" ? "Panel administratora" : "Panel zamawiającego"}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/panel/profil">Ustawienia</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action={async () => {
                    "use server"
                    await signOut()
                  }}>
                    <button type="submit" className="w-full text-left">Wyloguj się</button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                <Link href="/logowanie">Zaloguj się</Link>
              </Button>
              <Button asChild className="bg-[#B8DB8F] hover:bg-[#A7CC7D] text-[#123F36] border-none">
                <Link href="/rejestracja">Załóż konto</Link>
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Nav Trigger */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white" aria-label="Menu główne">
                <Menu className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem asChild>
                <Link href="/ogloszenia" className="w-full">Ogłoszenia</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/aktualnosci" className="w-full">Aktualności</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/o-systemie" className="w-full">O Systemie</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/faq" className="w-full">FAQ</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/kontakt" className="w-full">Kontakt</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {session ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={session?.user.role === "ADMIN" ? "/admin" : "/panel"} className="w-full">{session?.user.role === "ADMIN" ? "Panel administratora" : "Panel zamawiającego"}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <form action={async () => {
                      "use server"
                      await signOut()
                    }} className="w-full">
                      <button type="submit" className="w-full text-left">Wyloguj się</button>
                    </form>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/logowanie" className="w-full">Zaloguj się</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/rejestracja" className="w-full">Załóż konto</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
