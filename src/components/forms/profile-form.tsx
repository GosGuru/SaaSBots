"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Upload } from "lucide-react";

import { profileSchema, type ProfileFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  onSubmit: (data: ProfileFormData) => Promise<void>;
}

export function ProfileForm({ initialData, onSubmit }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bot_name: initialData?.bot_name || "",
      description: initialData?.description || "",
      age: initialData?.age || undefined,
      height: initialData?.height || undefined,
      measurements: initialData?.measurements || "",
      location: initialData?.location || "",
      availability_text: initialData?.availability_text || "",
      profile_photo_url: initialData?.profile_photo_url || "",
    },
  });

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
      <Card>
        <CardHeader>
          <CardTitle>Información básica</CardTitle>
          <CardDescription>
            Datos principales que el bot usará para presentarse
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bot_name">Nombre del bot *</Label>
            <Input
              id="bot_name"
              placeholder="Ej: Andrea, Clínica Dental Sonrisas"
              {...register("bot_name")}
            />
            {errors.bot_name && (
              <p className="text-sm text-destructive">{errors.bot_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe brevemente tu negocio o servicio..."
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Características físicas</CardTitle>
          <CardDescription>
            Información adicional para servicios de acompañantes (opcional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="age">Edad</Label>
              <Input
                id="age"
                type="number"
                min={18}
                max={99}
                placeholder="Ej: 25"
                {...register("age", { valueAsNumber: true })}
              />
              {errors.age && (
                <p className="text-sm text-destructive">{errors.age.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                min={140}
                max={220}
                placeholder="Ej: 165"
                {...register("height", { valueAsNumber: true })}
              />
              {errors.height && (
                <p className="text-sm text-destructive">{errors.height.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="measurements">Medidas</Label>
            <Input
              id="measurements"
              placeholder="Ej: 90-60-90"
              {...register("measurements")}
            />
            {errors.measurements && (
              <p className="text-sm text-destructive">{errors.measurements.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ubicación y disponibilidad</CardTitle>
          <CardDescription>
            Información sobre dónde operas y cuándo estás disponible
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              placeholder="Ej: Madrid Centro, Salamanca"
              {...register("location")}
            />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability_text">Horario de disponibilidad</Label>
            <Textarea
              id="availability_text"
              placeholder="Ej: Lunes a Viernes de 10:00 a 22:00. Fines de semana con cita previa."
              rows={2}
              {...register("availability_text")}
            />
            {errors.availability_text && (
              <p className="text-sm text-destructive">{errors.availability_text.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Foto de perfil</CardTitle>
          <CardDescription>
            Imagen principal que se mostrará en el bot
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile_photo_url">URL de la foto</Label>
            <div className="flex gap-2">
              <Input
                id="profile_photo_url"
                type="url"
                placeholder="https://..."
                {...register("profile_photo_url")}
              />
              <Button type="button" variant="outline" disabled>
                <Upload className="mr-2 h-4 w-4" />
                Subir
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Próximamente podrás subir fotos directamente
            </p>
            {errors.profile_photo_url && (
              <p className="text-sm text-destructive">{errors.profile_photo_url.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

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
              Guardar cambios
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
