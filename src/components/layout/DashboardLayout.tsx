import * as React from "react"
import { Header } from "./Header"
import { Footer } from "./Footer"
import { Sidebar, type SidebarItem } from "./Sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
  sidebarItems: SidebarItem[]
}

export function DashboardLayout({ children, sidebarItems }: DashboardLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F3F4F6]">
      <Header />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar items={sidebarItems} />
        <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
