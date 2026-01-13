"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  MessageSquare,
  BarChart3,
  Ban,
  Bot,
  User,
  Palette,
  Package,
  Clock,
  Image,
  Shield,
  Plug,
  ChevronDown,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Tenant, User as UserType } from "@/types";
import { useState } from "react";

interface SidebarProps {
  tenant: Tenant | null;
  user: UserType | null;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Configuración",
    href: "/dashboard/configuration",
    icon: Bot,
    children: [
      {
        title: "Perfil",
        href: "/dashboard/configuration/profile",
        icon: User,
      },
      {
        title: "Personalidad",
        href: "/dashboard/configuration/personality",
        icon: Palette,
      },
      {
        title: "Servicios",
        href: "/dashboard/configuration/services",
        icon: Package,
      },
      {
        title: "Disponibilidad",
        href: "/dashboard/configuration/availability",
        icon: Clock,
      },
      {
        title: "Imágenes",
        href: "/dashboard/configuration/images",
        icon: Image,
      },
      {
        title: "Reglas",
        href: "/dashboard/configuration/rules",
        icon: Shield,
      },
      {
        title: "Integraciones",
        href: "/dashboard/configuration/integrations",
        icon: Plug,
      },
    ],
  },
  {
    title: "Conversaciones",
    href: "/dashboard/conversations",
    icon: MessageSquare,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Bloqueados",
    href: "/dashboard/blocked-numbers",
    icon: Ban,
  },
  {
    title: "Ajustes",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar({ tenant, user }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(["/dashboard/configuration"]);

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((item) => item !== href) : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r bg-card lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">S</span>
            </div>
            <span className="text-lg font-semibold">SASbot</span>
          </Link>
        </div>

        {/* Tenant Info */}
        {tenant && (
          <div className="border-b px-4 py-3">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm font-medium truncate">{tenant.name}</p>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    tenant.n8n_workflow_active ? "bg-success" : "bg-muted-foreground"
                  )}
                />
                <span className="text-xs text-muted-foreground">
                  {tenant.n8n_workflow_active ? "Bot activo" : "Bot inactivo"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navigationItems.map((item) => (
              <li key={item.href}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.href)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive(item.href)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          expandedItems.includes(item.href) && "rotate-180"
                        )}
                      />
                    </button>
                    {expandedItems.includes(item.href) && (
                      <ul className="mt-1 ml-4 space-y-1 border-l pl-4">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                                pathname === child.href
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              )}
                            >
                              <child.icon className="h-4 w-4" />
                              {child.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                    {item.badge && (
                      <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">
              {tenant?.status === "trial" ? (
                <>
                  Período de prueba
                  <br />
                  <span className="font-medium text-foreground">
                    {tenant.trial_ends_at
                      ? `Expira: ${new Date(tenant.trial_ends_at).toLocaleDateString("es-ES")}`
                      : "14 días restantes"}
                  </span>
                </>
              ) : (
                <>
                  Plan {tenant?.subscription_plan || "Basic"}
                  <br />
                  <span className="font-medium text-foreground">Activo</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
