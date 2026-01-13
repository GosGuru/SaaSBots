"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

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
import { login } from "@/lib/actions/auth";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [state, action, pending] = useActionState(login, undefined);

  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const errorFromUrl = searchParams.get("error");

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Iniciar sesión</CardTitle>
        <CardDescription className="text-center">
          Ingresa tus credenciales para acceder a tu cuenta
        </CardDescription>
      </CardHeader>
      <form action={action}>
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <CardContent className="space-y-4">
          {/* Error message from URL (callback errors) */}
          {errorFromUrl && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {decodeURIComponent(errorFromUrl)}
            </div>
          )}

          {/* Error message from form state */}
          {state?.message && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {state.message}
            </div>
          )}

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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={pending}
                aria-describedby="password-error"
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
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Iniciar sesión
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Regístrate
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
