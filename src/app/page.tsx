import Link from "next/link";
import {
  Bot,
  MessageSquare,
  Zap,
  Shield,
  Clock,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">S</span>
            </div>
            <span className="text-lg font-semibold">SASbot</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">
              Características
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Precios
            </Link>
            <Link href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground">
              Testimonios
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Comenzar gratis</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center rounded-full border px-4 py-1.5 text-sm">
              <Star className="mr-2 h-4 w-4 text-yellow-500" />
              Más de 100 negocios confían en nosotros
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Chatbots de WhatsApp
              <span className="text-primary"> con IA</span> para tu negocio
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Automatiza la atención al cliente, agenda citas y vende más. 
              Configura tu bot en minutos, sin código.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg">
                <Link href="/register">
                  Prueba gratis 14 días
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#demo">Ver demostración</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Sin tarjeta de crédito • Cancela cuando quieras
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-t bg-muted/50 py-24">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Todo lo que necesitas para automatizar tu negocio
              </h2>
              <p className="mt-4 text-muted-foreground">
                Potentes herramientas para crear chatbots que realmente funcionan
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Bot className="h-6 w-6" />}
                title="IA Conversacional"
                description="Powered by GPT-4. Tu bot entiende el contexto y responde de forma natural."
              />
              <FeatureCard
                icon={<MessageSquare className="h-6 w-6" />}
                title="Multi-canal"
                description="WhatsApp Business, Instagram y Facebook Messenger en un solo lugar."
              />
              <FeatureCard
                icon={<Clock className="h-6 w-6" />}
                title="24/7 Disponible"
                description="Tu bot nunca duerme. Atiende clientes a cualquier hora del día."
              />
              <FeatureCard
                icon={<Zap className="h-6 w-6" />}
                title="Configuración rápida"
                description="Listo en minutos. Sin programación. Solo configura y publica."
              />
              <FeatureCard
                icon={<Shield className="h-6 w-6" />}
                title="Seguro y privado"
                description="Tus datos están protegidos. Cumplimos con GDPR y regulaciones locales."
              />
              <FeatureCard
                icon={<BarChart3 className="h-6 w-6" />}
                title="Analytics detallado"
                description="Métricas en tiempo real. Conoce a tus clientes y mejora tu servicio."
              />
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-24">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Perfecto para cualquier tipo de negocio
              </h2>
              <p className="mt-4 text-muted-foreground">
                Templates pre-configurados para diferentes industrias
              </p>
            </div>
            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <UseCaseCard
                emoji="💋"
                title="Escorts & Acompañantes"
                description="Agenda citas, responde consultas y comparte fotos automáticamente."
              />
              <UseCaseCard
                emoji="🦷"
                title="Clínicas Dentales"
                description="Gestiona citas, resuelve dudas y envía recordatorios."
              />
              <UseCaseCard
                emoji="🛒"
                title="E-commerce"
                description="Catálogo de productos, consultas de stock y tracking de pedidos."
              />
              <UseCaseCard
                emoji="🍽️"
                title="Restaurantes"
                description="Reservas, menú del día y pedidos a domicilio."
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="border-t bg-muted/50 py-24">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Planes simples y transparentes
              </h2>
              <p className="mt-4 text-muted-foreground">
                Elige el plan que mejor se adapte a tu negocio
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <PricingCard
                name="Basic"
                price="$29"
                description="Perfecto para empezar"
                features={[
                  "1 número de WhatsApp",
                  "1,000 mensajes/mes",
                  "Soporte por email",
                  "Analytics básico",
                ]}
              />
              <PricingCard
                name="Pro"
                price="$79"
                description="Para negocios en crecimiento"
                features={[
                  "3 números de WhatsApp",
                  "10,000 mensajes/mes",
                  "Soporte prioritario",
                  "Analytics avanzado",
                  "Integraciones API",
                  "Google Calendar",
                ]}
                popular
              />
              <PricingCard
                name="Enterprise"
                price="Contactar"
                description="Soluciones personalizadas"
                features={[
                  "Números ilimitados",
                  "Mensajes ilimitados",
                  "Soporte dedicado 24/7",
                  "SLA garantizado",
                  "Custom integrations",
                  "On-premise disponible",
                ]}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container">
            <div className="mx-auto max-w-3xl rounded-2xl bg-primary p-8 text-center text-primary-foreground md:p-16">
              <h2 className="text-3xl font-bold tracking-tight">
                Comienza a automatizar tu negocio hoy
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Únete a cientos de negocios que ya están ahorrando tiempo y dinero
                con SASbot.
              </p>
              <Button asChild size="lg" variant="secondary" className="mt-8">
                <Link href="/register">
                  Prueba gratis 14 días
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">S</span>
              </div>
              <span className="font-semibold">SASbot</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 SASbot. Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacidad
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Términos
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

function UseCaseCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <Card className="text-center">
      <CardHeader>
        <div className="mx-auto text-4xl">{emoji}</div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

function PricingCard({
  name,
  price,
  description,
  features,
  popular = false,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}) {
  return (
    <Card className={popular ? "border-primary shadow-lg" : ""}>
      {popular && (
        <div className="bg-primary px-4 py-1 text-center text-sm font-medium text-primary-foreground">
          Más popular
        </div>
      )}
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <div className="mt-2">
          <span className="text-4xl font-bold">{price}</span>
          {price !== "Contactar" && <span className="text-muted-foreground">/mes</span>}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          asChild
          className="mt-6 w-full"
          variant={popular ? "default" : "outline"}
        >
          <Link href="/register">
            {price === "Contactar" ? "Contactar ventas" : "Comenzar ahora"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
