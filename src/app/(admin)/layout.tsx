import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/logowanie");
  if (session.user.role !== "ADMIN") redirect("/");
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <AdminSidebar />
        <main id="main-content" className="flex-1 min-w-0 p-4 pt-24 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
