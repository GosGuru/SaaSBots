"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  LogOut,
  Menu,
  Settings,
  User,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tenant, User as UserType } from "@/types";

interface HeaderProps {
  user: UserType | null;
  tenant: Tenant | null;
}

export function Header({ user, tenant }: HeaderProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      {/* Left side - Mobile menu & Breadcrumb */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>

        {/* Status badge */}
        {tenant && (
          <div className="hidden items-center gap-2 sm:flex">
            <span
              className={`h-2 w-2 rounded-full ${
                tenant.n8n_workflow_active
                  ? "bg-success animate-pulse"
                  : "bg-muted-foreground"
              }`}
            />
            <span className="text-sm text-muted-foreground">
              {tenant.n8n_workflow_active ? "Bot activo" : "Bot inactivo"}
            </span>
          </div>
        )}
      </div>

      {/* Right side - Notifications & User menu */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notificaciones</span>
          {/* Notification badge */}
          {/* <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" /> */}
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar_url || undefined} alt={user?.full_name || "Usuario"} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user?.full_name ? getInitials(user.full_name) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start text-left md:flex">
                <span className="text-sm font-medium">
                  {user?.full_name || "Usuario"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.full_name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings/account" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Mi cuenta
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
