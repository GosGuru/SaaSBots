"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Pencil, Trash2, GripVertical } from "lucide-react";

import { serviceSchema, type ServiceFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number | null;
  is_active: boolean;
}

interface ServicesFormProps {
  services: Service[];
  onAdd: (data: ServiceFormData) => Promise<void>;
  onUpdate: (id: string, data: ServiceFormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReorder?: (services: Service[]) => Promise<void>;
}

export function ServicesForm({
  services,
  onAdd,
  onUpdate,
  onDelete,
}: ServicesFormProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Servicios</CardTitle>
            <CardDescription>
              Lista de servicios que ofreces. El bot los mostrará a los clientes.
            </CardDescription>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar servicio
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isAdding && (
            <ServiceFormCard
              onSubmit={async (data) => {
                await onAdd(data);
                setIsAdding(false);
                toast({
                  title: "Servicio agregado",
                  description: "El servicio se ha creado correctamente.",
                });
              }}
              onCancel={() => setIsAdding(false)}
            />
          )}

          {services.length === 0 && !isAdding ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">
                No tienes servicios configurados todavía.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar tu primer servicio
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((service) => (
                <div key={service.id}>
                  {editingId === service.id ? (
                    <ServiceFormCard
                      initialData={service}
                      onSubmit={async (data) => {
                        await onUpdate(service.id, data);
                        setEditingId(null);
                        toast({
                          title: "Servicio actualizado",
                          description: "Los cambios se han guardado.",
                        });
                      }}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <ServiceCard
                      service={service}
                      onEdit={() => setEditingId(service.id)}
                      onDelete={async () => {
                        if (confirm("¿Estás seguro de eliminar este servicio?")) {
                          await onDelete(service.id);
                          toast({
                            title: "Servicio eliminado",
                            description: "El servicio ha sido eliminado.",
                          });
                        }
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ServiceCard({
  service,
  onEdit,
  onDelete,
}: {
  service: Service;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-lg border p-4 ${
        service.is_active ? "" : "opacity-50"
      }`}
    >
      <div className="cursor-grab text-muted-foreground">
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{service.name}</h4>
          {!service.is_active && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
              Inactivo
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{service.description}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold">${service.price}</p>
        {service.duration_minutes && (
          <p className="text-sm text-muted-foreground">
            {service.duration_minutes} min
          </p>
        )}
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

function ServiceFormCard({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: Partial<Service>;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      duration_minutes: initialData?.duration_minutes || undefined,
      is_active: initialData?.is_active ?? true,
    },
  });

  async function handleFormSubmit(data: ServiceFormData) {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error saving service:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-lg border bg-muted/50 p-4">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del servicio *</Label>
            <Input
              id="name"
              placeholder="Ej: Consulta general, Masaje 1 hora"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio ($) *</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step={0.01}
                placeholder="0.00"
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duración (min)</Label>
              <Input
                id="duration_minutes"
                type="number"
                min={1}
                placeholder="60"
                {...register("duration_minutes", { valueAsNumber: true })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            placeholder="Describe el servicio en detalle..."
            rows={2}
            {...register("description")}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            className="h-4 w-4 rounded border-input"
            {...register("is_active")}
          />
          <Label htmlFor="is_active" className="font-normal">
            Servicio activo (visible para clientes)
          </Label>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {initialData ? "Actualizar" : "Agregar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
