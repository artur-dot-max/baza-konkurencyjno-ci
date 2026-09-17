"use client"

import * as React from "react"
import Link from "next/link"
import { LucideIcon, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface SidebarItem {
  href: string
  label: string
  icon: LucideIcon
  active?: boolean
}

interface SidebarProps {
  items: SidebarItem[]
}

export function Sidebar({ items }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const toggleSidebar = () => setIsOpen(!isOpen)

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden p-4 bg-[#0A2B5C] text-white flex justify-between items-center">
        <span className="font-semibold">Menu Panelu</span>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-white hover:bg-white/10" aria-label="Przełącz menu">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar Content */}
      <div className={cn(
        "bg-[#0A2B5C] text-white w-64 flex-shrink-0 flex-col md:flex",
        "fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="space-y-1 px-3" aria-label="Nawigacja w panelu">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                  item.active
                    ? "bg-white/10 text-white"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                )}
                aria-current={item.active ? "page" : undefined}
                onClick={() => setIsOpen(false)}
              >
                <item.icon
                  className={cn(
                    "mr-3 flex-shrink-0 h-5 w-5",
                    item.active ? "text-white" : "text-gray-400 group-hover:text-gray-300"
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
