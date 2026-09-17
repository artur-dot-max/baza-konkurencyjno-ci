import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/logowanie");
  if (session.user.role !== "ORGANIZATION") redirect("/");
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <DashboardSidebar />
        <main id="main-content" className="flex-1 min-w-0 p-4 pt-24 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
