import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Autenticación",
  description: "Inicia sesión o regístrate en SASbot",
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
      
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-xl font-bold text-primary-foreground">S</span>
        </div>
        <span className="text-2xl font-bold">SASbot</span>
      </div>

      {/* Card Container */}
      <div className="w-full max-w-md px-4">
        {children}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>© 2026 SASbot. Todos los derechos reservados.</p>
      </div>
    </div>
  );
}
