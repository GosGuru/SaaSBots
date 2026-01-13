"use client";

import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, RefreshCw, CheckCircle2, ArrowLeft } from "lucide-react";
import { resendConfirmationEmail } from "@/lib/actions/auth";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [isPending, startTransition] = useTransition();
  const [resent, setResent] = useState(false);
  const { toast } = useToast();

  const handleResend = () => {
    if (!email) return;
    
    startTransition(async () => {
      const result = await resendConfirmationEmail(email);
      
      if (result.success) {
        setResent(true);
        toast({
          title: "Email enviado",
          description: "Hemos reenviado el email de confirmación.",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudo reenviar el email.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Verifica tu email</CardTitle>
        <CardDescription className="text-base">
          Hemos enviado un enlace de confirmación a:
          <br />
          <span className="font-medium text-foreground">{email || "tu correo"}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Revisa tu bandeja de entrada y haz clic en el enlace de confirmación.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Si no lo encuentras, revisa tu carpeta de spam.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              El enlace expira en 24 horas.
            </p>
          </div>
        </div>

        {resent && (
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-3">
            <p className="text-sm text-green-700 dark:text-green-400 text-center">
              ✓ Email reenviado exitosamente
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleResend}
          disabled={isPending || !email}
        >
          {isPending ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Reenviando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reenviar email de confirmación
            </>
          )}
        </Button>
        
        <Link href="/login" className="w-full">
          <Button variant="ghost" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio de sesión
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
