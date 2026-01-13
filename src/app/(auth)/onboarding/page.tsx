"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Building2, Rocket } from "lucide-react";
import { completeOnboarding } from "@/lib/actions/onboarding";

const industries = [
  { value: "ecommerce", label: "E-commerce" },
  { value: "services", label: "Servicios" },
  { value: "healthcare", label: "Salud" },
  { value: "education", label: "Educación" },
  { value: "finance", label: "Finanzas" },
  { value: "realestate", label: "Inmobiliaria" },
  { value: "hospitality", label: "Hostelería" },
  { value: "technology", label: "Tecnología" },
  { value: "other", label: "Otro" },
];

export default function OnboardingPage() {
  const [state, action, pending] = useActionState(completeOnboarding, undefined);
  const [industry, setIndustry] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Rocket className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">¡Bienvenido a SASbot!</CardTitle>
          <CardDescription className="text-base">
            Configura tu empresa para empezar a crear chatbots de WhatsApp
          </CardDescription>
        </CardHeader>

        <form action={action}>
          <CardContent className="space-y-6">
            {/* Error message */}
            {state?.message && !state.success && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {state.message}
              </div>
            )}

            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="company_name">
                <Building2 className="w-4 h-4 inline mr-2" />
                Nombre de tu empresa
              </Label>
              <Input
                id="company_name"
                name="company_name"
                type="text"
                placeholder="Mi Empresa S.A."
                required
                disabled={pending}
              />
              {state?.errors?.company_name && (
                <p className="text-sm text-destructive">
                  {state.errors.company_name[0]}
                </p>
              )}
            </div>

            {/* Industry */}
            <div className="space-y-2">
              <Label htmlFor="industry">Industria</Label>
              <Select
                name="industry"
                value={industry}
                onValueChange={setIndustry}
                disabled={pending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu industria" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((ind) => (
                    <SelectItem key={ind.value} value={ind.value}>
                      {ind.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="industry" value={industry} />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Configurando...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Comenzar
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Podrás cambiar esta información más tarde en la configuración
            </p>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
