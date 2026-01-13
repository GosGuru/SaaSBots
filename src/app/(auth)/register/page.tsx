"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Check, CheckCircle } from "lucide-react";

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
import { signup } from "@/lib/actions/auth";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [state, action, pending] = useActionState(signup, undefined);

  // Password strength indicators
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  // If signup was successful, show success message
  if (state?.success) {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">¡Cuenta creada!</CardTitle>
          <CardDescription className="text-center">
            {state.message}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col space-y-4">
          <Button asChild className="w-full" variant="outline">
            <Link href="/login">Ir a iniciar sesión</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Crear cuenta</CardTitle>
        <CardDescription className="text-center">
          Completa tus datos para empezar a usar SASbot
        </CardDescription>
      </CardHeader>
      <form action={action}>
        <CardContent className="space-y-4">
          {/* Error message */}
          {state?.message && !state.success && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {state.message}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre completo</Label>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              placeholder="Juan Pérez"
              autoComplete="name"
              disabled={pending}
              aria-describedby="full_name-error"
            />
            {state?.errors?.full_name && (
              <p id="full_name-error" className="text-sm text-destructive">
                {state.errors.full_name[0]}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              disabled={pending}
              aria-describedby="email-error"
            />
            {state?.errors?.email && (
              <p id="email-error" className="text-sm text-destructive">
                {state.errors.email[0]}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={pending}
                aria-describedby="password-error"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {state?.errors?.password && (
              <p id="password-error" className="text-sm text-destructive">
                {state.errors.password[0]}
              </p>
            )}

            {/* Password Requirements */}
            {password && (
              <div className="mt-2 space-y-1">
                <PasswordRequirement met={hasMinLength}>
                  Al menos 8 caracteres
                </PasswordRequirement>
                <PasswordRequirement met={hasUppercase}>
                  Una letra mayúscula
                </PasswordRequirement>
                <PasswordRequirement met={hasLowercase}>
                  Una letra minúscula
                </PasswordRequirement>
                <PasswordRequirement met={hasNumber}>
                  Un número
                </PasswordRequirement>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={pending}
                aria-describedby="confirmPassword-error"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {state?.errors?.confirmPassword && (
              <p id="confirmPassword-error" className="text-sm text-destructive">
                {state.errors.confirmPassword[0]}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear cuenta
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Inicia sesión
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground">
            Al registrarte, aceptas nuestros{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              Términos de Servicio
            </Link>{" "}
            y{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              Política de Privacidad
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

function PasswordRequirement({
  met,
  children,
}: {
  met: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div
        className={`h-4 w-4 rounded-full flex items-center justify-center ${
          met ? "bg-success text-success-foreground" : "bg-muted"
        }`}
      >
        {met && <Check className="h-3 w-3" />}
      </div>
      <span className={met ? "text-success" : "text-muted-foreground"}>
        {children}
      </span>
    </div>
  );
}
