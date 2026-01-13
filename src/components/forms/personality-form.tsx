"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Plus, X } from "lucide-react";

import { personalitySchema, type PersonalityFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface PersonalityFormProps {
  initialData?: Partial<PersonalityFormData>;
  onSubmit: (data: PersonalityFormData) => Promise<void>;
}

const TONE_OPTIONS = [
  { value: "profesional" as const, label: "Profesional", emoji: "💼" },
  { value: "amigable" as const, label: "Amigable", emoji: "😊" },
  { value: "seductor" as const, label: "Seductor", emoji: "😏" },
  { value: "formal" as const, label: "Formal", emoji: "🎩" },
  { value: "casual" as const, label: "Casual", emoji: "👋" },
];

const EMOJI_STYLE_OPTIONS = [
  { value: "abundante" as const, label: "Abundante", description: "Muchos emojis en cada mensaje" },
  { value: "moderado" as const, label: "Moderado", description: "Algunos emojis ocasionalmente" },
  { value: "minimo" as const, label: "Mínimo", description: "Solo emojis esenciales" },
  { value: "ninguno" as const, label: "Ninguno", description: "Sin emojis" },
];

export function PersonalityForm({ initialData, onSubmit }: PersonalityFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [customPhrases, setCustomPhrases] = useState<string[]>(
    initialData?.custom_phrases || []
  );
  const [newPhrase, setNewPhrase] = useState("");
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<PersonalityFormData>({
    resolver: zodResolver(personalitySchema),
    defaultValues: {
      tone: initialData?.tone || "amigable",
      language: initialData?.language || "es",
      emoji_style: initialData?.emoji_style || "moderado",
      greeting_message: initialData?.greeting_message || "",
      farewell_message: initialData?.farewell_message || "",
      custom_phrases: initialData?.custom_phrases || [],
    },
  });

  const selectedTone = watch("tone");
  const selectedEmojiStyle = watch("emoji_style");

  function addPhrase() {
    if (newPhrase.trim()) {
      const updated = [...customPhrases, newPhrase.trim()];
      setCustomPhrases(updated);
      setValue("custom_phrases", updated, { shouldDirty: true });
      setNewPhrase("");
    }
  }

  function removePhrase(index: number) {
    const updated = customPhrases.filter((_, i) => i !== index);
    setCustomPhrases(updated);
    setValue("custom_phrases", updated, { shouldDirty: true });
  }

  async function handleFormSubmit(data: PersonalityFormData) {
    setIsLoading(true);
    try {
      await onSubmit({ ...data, custom_phrases: customPhrases });
      toast({
        title: "Personalidad guardada",
        description: "Los cambios se han guardado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la personalidad. Intenta de nuevo.",
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
          <CardTitle>Tono de comunicación</CardTitle>
          <CardDescription>
            Define cómo se comunicará tu bot con los clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {TONE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setValue("tone", option.value, { shouldDirty: true })}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                  selectedTone === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <span className="text-2xl">{option.emoji}</span>
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
          <input type="hidden" {...register("tone")} />
          {errors.tone && (
            <p className="mt-2 text-sm text-destructive">{errors.tone.message}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Idioma y emojis</CardTitle>
          <CardDescription>
            Configura el idioma principal y el uso de emojis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="language">Idioma principal</Label>
            <select
              id="language"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              {...register("language")}
            >
              <option value="es">Español</option>
              <option value="en">Inglés</option>
              <option value="pt">Portugués</option>
              <option value="fr">Francés</option>
              <option value="it">Italiano</option>
            </select>
          </div>

          <div className="space-y-3">
            <Label>Estilo de emojis</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {EMOJI_STYLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setValue("emoji_style", option.value, { shouldDirty: true })}
                  className={`flex flex-col items-start rounded-lg border-2 p-4 text-left transition-colors ${
                    selectedEmojiStyle === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="font-medium">{option.label}</span>
                  <span className="text-sm text-muted-foreground">{option.description}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mensajes personalizados</CardTitle>
          <CardDescription>
            Define cómo saluda y se despide tu bot
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="greeting_message">Mensaje de saludo</Label>
            <Textarea
              id="greeting_message"
              placeholder="Ej: ¡Hola! Soy Andrea, ¿en qué puedo ayudarte hoy? 😊"
              rows={2}
              {...register("greeting_message")}
            />
            {errors.greeting_message && (
              <p className="text-sm text-destructive">{errors.greeting_message.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="farewell_message">Mensaje de despedida</Label>
            <Textarea
              id="farewell_message"
              placeholder="Ej: ¡Gracias por escribirme! Espero verte pronto 💋"
              rows={2}
              {...register("farewell_message")}
            />
            {errors.farewell_message && (
              <p className="text-sm text-destructive">{errors.farewell_message.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frases personalizadas</CardTitle>
          <CardDescription>
            Frases que el bot debe usar frecuentemente para mantener su personalidad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Escribe una frase característica..."
              value={newPhrase}
              onChange={(e) => setNewPhrase(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addPhrase();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addPhrase}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {customPhrases.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {customPhrases.map((phrase, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-sm"
                >
                  <span>{phrase}</span>
                  <button
                    type="button"
                    onClick={() => removePhrase(index)}
                    className="ml-1 rounded-full p-0.5 hover:bg-background"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Ejemplos: "¡Qué emoción!", "Te va a encantar", "Con mucho gusto"
          </p>
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
