import { requireUser } from "@/lib/dal";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  // requireUser redirige automáticamente si no hay usuario autenticado
  // También redirige a /onboarding si el usuario no tiene tenant
  const { profile, tenant } = await requireUser();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar tenant={tenant} user={profile} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header user={profile} tenant={tenant} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
