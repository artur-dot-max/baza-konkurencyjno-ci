"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  FileEdit,
  Archive,
  Building2,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { href: "/panel", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/panel/ogloszenia", icon: FileText, label: "Moje ogłoszenia" },
  { href: "/panel/nowe-ogloszenie", icon: PlusCircle, label: "Dodaj ogłoszenie" },
  { href: "/panel/szkice", icon: FileEdit, label: "Szkice" },
  { href: "/panel/archiwum", icon: Archive, label: "Archiwum" },
  { href: "/panel/profil", icon: Building2, label: "Profil organizacji" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <div className="md:hidden p-4 bg-navy-800 text-white flex justify-between items-center w-full absolute z-20">
        <span className="font-bold">Panel Organizacji</span>
        <Button variant="ghost" size="icon" aria-label="Menu panelu" aria-expanded={isOpen} onClick={() => setIsOpen(!isOpen)} className="text-white">
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-navy-800 text-white w-64 flex-shrink-0 flex-col transition-transform duration-300 md:translate-x-0 md:static md:flex",
          "fixed inset-y-0 left-0 z-10 pt-16 md:pt-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 hidden md:block border-b border-navy-700">
          <h2 className="text-xl font-bold tracking-tight">Panel Organizacji</h2>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  isActive
                    ? "bg-navy-700 text-white"
                    : "text-gray-300 hover:bg-navy-700 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-0 md:hidden pt-16"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
