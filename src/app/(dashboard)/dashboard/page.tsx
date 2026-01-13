import Link from "next/link";
import {
  MessageSquare,
  Users,
  Clock,
  Bot,
  TrendingUp,
  ArrowRight,
  Settings,
} from "lucide-react";

import { getUserWithTenant } from "@/lib/supabase/server";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const userData = await getUserWithTenant();
  const tenant = userData?.tenant;
  const hasWorkflow = !!tenant?.n8n_workflow_id;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido de vuelta, {userData?.profile?.full_name?.split(" ")[0] || "Usuario"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasWorkflow ? (
            <Button asChild variant={tenant?.n8n_workflow_active ? "outline" : "default"}>
              <Link href="/dashboard/configuration">
                <Settings className="mr-2 h-4 w-4" />
                {tenant?.n8n_workflow_active ? "Editar configuración" : "Activar bot"}
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/dashboard/configuration/profile">
                <Bot className="mr-2 h-4 w-4" />
                Configurar mi bot
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Onboarding Banner */}
      {!hasWorkflow && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              ¡Configura tu primer chatbot!
            </CardTitle>
            <CardDescription>
              Sigue estos pasos para tener tu bot funcionando en minutos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <OnboardingStep
                step={1}
                title="Perfil"
                description="Nombre, descripción y foto"
                href="/dashboard/configuration/profile"
                completed={false}
              />
              <OnboardingStep
                step={2}
                title="Servicios"
                description="Agrega tus productos o servicios"
                href="/dashboard/configuration/services"
                completed={false}
              />
              <OnboardingStep
                step={3}
                title="Horarios"
                description="Define tu disponibilidad"
                href="/dashboard/configuration/availability"
                completed={false}
              />
              <OnboardingStep
                step={4}
                title="WhatsApp"
                description="Conecta tu número"
                href="/dashboard/settings/whatsapp"
                completed={false}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Mensajes hoy"
          value="0"
          description="desde ayer"
          icon={<MessageSquare className="h-4 w-4" />}
          trend={{ value: 0, isPositive: true }}
        />
        <StatsCard
          title="Conversaciones activas"
          value="0"
          description="en las últimas 24h"
          icon={<Users className="h-4 w-4" />}
        />
        <StatsCard
          title="Tiempo promedio de respuesta"
          value="--"
          description="segundos promedio"
          icon={<Clock className="h-4 w-4" />}
        />
        <StatsCard
          title="Tasa de respuesta"
          value="--"
          description="mensajes respondidos"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Conversations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Conversaciones recientes</CardTitle>
              <CardDescription>
                Últimas conversaciones con tus clientes
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/conversations">
                Ver todas
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<MessageSquare className="h-8 w-8 text-muted-foreground" />}
              title="Sin conversaciones aún"
              description="Las conversaciones aparecerán aquí cuando tu bot comience a recibir mensajes"
            />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones rápidas</CardTitle>
            <CardDescription>
              Tareas comunes para gestionar tu bot
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <QuickAction
              href="/dashboard/configuration/profile"
              title="Editar perfil del bot"
              description="Actualiza nombre, descripción y foto"
            />
            <QuickAction
              href="/dashboard/configuration/services"
              title="Gestionar servicios"
              description="Agrega, edita o elimina servicios"
            />
            <QuickAction
              href="/dashboard/blocked-numbers"
              title="Números bloqueados"
              description="Gestiona la lista de bloqueo"
            />
            <QuickAction
              href="/dashboard/analytics"
              title="Ver estadísticas"
              description="Analiza el rendimiento de tu bot"
            />
          </CardContent>
        </Card>
      </div>

      {/* Bot Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Estado del Bot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                tenant?.n8n_workflow_active
                  ? "bg-success/10"
                  : "bg-muted"
              }`}
            >
              <span
                className={`h-4 w-4 rounded-full ${
                  tenant?.n8n_workflow_active
                    ? "bg-success animate-pulse"
                    : "bg-muted-foreground"
                }`}
              />
            </div>
            <div>
              <p className="font-medium">
                {tenant?.n8n_workflow_active
                  ? "Tu bot está activo y respondiendo mensajes"
                  : "Tu bot está inactivo"}
              </p>
              <p className="text-sm text-muted-foreground">
                {tenant?.n8n_workflow_active
                  ? `Conectado a ${tenant.whatsapp_number || "WhatsApp"}`
                  : "Configura y activa tu bot para comenzar a recibir mensajes"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OnboardingStep({
  step,
  title,
  description,
  href,
  completed,
}: {
  step: number;
  title: string;
  description: string;
  href: string;
  completed: boolean;
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border p-4 transition-colors hover:border-primary hover:bg-primary/5"
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
            completed
              ? "bg-success text-success-foreground"
              : "bg-primary/10 text-primary"
          }`}
        >
          {step}
        </div>
        <div>
          <p className="font-medium group-hover:text-primary">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Link>
  );
}

function QuickAction({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
    >
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      {icon}
      <p className="mt-2 font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
