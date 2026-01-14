"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, User, MapPin, MessageCircle, Briefcase } from "lucide-react";

import { profileSchema, type ProfileFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  businessType?: string;
}

export function ProfileForm({ initialData, onSubmit, businessType }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bot_name: initialData?.bot_name || "",
      bot_age: initialData?.bot_age || undefined,
      bot_nationality: initialData?.bot_nationality || "",
      bot_gender: initialData?.bot_gender || "female",
      physical_description: initialData?.physical_description || "",
      personality_traits: initialData?.personality_traits || "",
      tone_description: initialData?.tone_description || "",
      communication_style: initialData?.communication_style || "informal",
      role_description: initialData?.role_description || "",
      address: initialData?.address || "",
      address_instructions: initialData?.address_instructions || "",
    },
  });

  const isEscort = businessType === "escort";

  async function handleFormSubmit(data: ProfileFormData) {
    setIsLoading(true);
    try {
      await onSubmit(data);
      toast({
        title: "Perfil guardado",
        description: "Los cambios se han guardado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el perfil. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Identidad del Bot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Identidad del Bot
          </CardTitle>
          <CardDescription>
            Datos básicos que definen quién es tu bot
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bot_name">Nombre del bot *</Label>
              <Input
                id="bot_name"
                placeholder="Ej: Andreia, María, Asistente"
                {...register("bot_name")}
              />
              {errors.bot_name && (
                <p className="text-sm text-destructive">{errors.bot_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bot_gender">Género</Label>
              <Select
                value={watch("bot_gender")}
                onValueChange={(value) => setValue("bot_gender", value as "female" | "male" | "neutral", { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Femenino</SelectItem>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="neutral">Neutro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bot_age">Edad</Label>
              <Input
                id="bot_age"
                type="number"
                min={18}
                max={99}
                placeholder="Ej: 28"
                {...register("bot_age", { valueAsNumber: true })}
              />
              {errors.bot_age && (
                <p className="text-sm text-destructive">{errors.bot_age.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bot_nationality">Nacionalidad</Label>
              <Input
                id="bot_nationality"
                placeholder="Ej: española, portuguesa"
                {...register("bot_nationality")}
              />
              {errors.bot_nationality && (
                <p className="text-sm text-destructive">{errors.bot_nationality.message}</p>
              )}
            </div>
          </div>

          {/* Descripción física - solo para escort */}
          {isEscort && (
            <div className="space-y-2">
              <Label htmlFor="physical_description">Descripción física</Label>
              <Textarea
                id="physical_description"
                placeholder="Ej: 160 cm, 56 kg, cabello platinado, ojos café..."
                rows={2}
                {...register("physical_description")}
              />
              <p className="text-xs text-muted-foreground">
                Esta información se usará en el perfil del bot
              </p>
              {errors.physical_description && (
                <p className="text-sm text-destructive">{errors.physical_description.message}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personalidad y Comunicación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Personalidad y Comunicación
          </CardTitle>
          <CardDescription>
            Define cómo se comunica tu bot con los clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="personality_traits">Rasgos de personalidad</Label>
            <Textarea
              id="personality_traits"
              placeholder="Ej: elegante, educada, sofisticada, cercana..."
              rows={2}
              {...register("personality_traits")}
            />
            <p className="text-xs text-muted-foreground">
              Describe cómo es la personalidad del bot
            </p>
            {errors.personality_traits && (
              <p className="text-sm text-destructive">{errors.personality_traits.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone_description">Tono de comunicación</Label>
            <Textarea
              id="tone_description"
              placeholder="Ej: cercano pero sofisticado, coqueto y seductor, profesional..."
              rows={2}
              {...register("tone_description")}
            />
            {errors.tone_description && (
              <p className="text-sm text-destructive">{errors.tone_description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="communication_style">Estilo de comunicación</Label>
            <Select
              value={watch("communication_style")}
              onValueChange={(value) => setValue("communication_style", value as "informal" | "formal" | "mixto", { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona estilo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="informal">Informal (tuteo)</SelectItem>
                <SelectItem value="formal">Formal (usted)</SelectItem>
                <SelectItem value="mixto">Mixto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rol y Trabajo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Rol y Descripción
          </CardTitle>
          <CardDescription>
            Describe qué hace tu bot y cuál es su función
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role_description">Descripción del rol</Label>
            <Textarea
              id="role_description"
              placeholder="Ej: Trabajas ofreciendo compañía íntima y encuentros personalizados. Buscas crear conexiones genuinas con personas..."
              rows={4}
              {...register("role_description")}
            />
            <p className="text-xs text-muted-foreground">
              Describe en primera persona qué hace el bot y cuál es su trabajo
            </p>
            {errors.role_description && (
              <p className="text-sm text-destructive">{errors.role_description.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ubicación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Ubicación
          </CardTitle>
          <CardDescription>
            Dirección y cómo llegar al lugar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              placeholder="Ej: Calle Pedro Muguruza 6, Madrid"
              {...register("address")}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_instructions">Instrucciones de llegada</Label>
            <Textarea
              id="address_instructions"
              placeholder="Ej: Cuando llegues avísame y abre la puerta blanca, no llames al timbre"
              rows={2}
              {...register("address_instructions")}
            />
            <p className="text-xs text-muted-foreground">
              Instrucciones que el bot dará cuando confirme una cita
            </p>
            {errors.address_instructions && (
              <p className="text-sm text-destructive">{errors.address_instructions.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isLoading || !isDirty}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar perfil
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
