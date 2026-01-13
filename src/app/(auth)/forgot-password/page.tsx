"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { forgotPassword } from "@/lib/actions/auth";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(forgotPassword, undefined);

  // Si se envió el email exitosamente
  if (state?.success) {
    return (
      <Card className="text-center">
        <CardHeader className="space-y-1">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Revisa tu email</CardTitle>
          <CardDescription>
            Hemos enviado las instrucciones para restablecer tu contraseña.
            <br />
            <span className="text-sm text-muted-foreground mt-2 block">
              Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {state.message}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a inicio de sesión
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">
          Recuperar contraseña
        </CardTitle>
        <CardDescription className="text-center">
          Ingresa tu email y te enviaremos instrucciones para restablecer tu
          contraseña
        </CardDescription>
      </CardHeader>
      <form action={action}>
        <CardContent className="space-y-4">
          {/* Error general del formulario */}
          {state?.message && !state.success && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {state.message}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              disabled={pending}
              error={!!state?.errors?.email}
            />
            {state?.errors?.email && (
              <p className="text-sm text-destructive">{state.errors.email[0]}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar instrucciones
          </Button>

          <Button asChild variant="ghost" className="w-full">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a inicio de sesión
            </Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
