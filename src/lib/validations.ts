import { z } from "zod";

// ============================================
// Auth Schemas
// ============================================
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Ingresa un email válido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "El nombre es requerido")
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(100, "El nombre es muy largo"),
    email: z
      .string()
      .min(1, "El email es requerido")
      .email("Ingresa un email válido"),
    password: z
      .string()
      .min(1, "La contraseña es requerida")
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
      ),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Ingresa un email válido"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "La contraseña es requerida")
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
      ),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// ============================================
// Tenant Schemas
// ============================================
export const createTenantSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre del negocio es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es muy largo"),
  businessType: z.enum(["escort", "dental", "retail", "restaurant", "other"], {
    required_error: "Selecciona un tipo de negocio",
  }),
  templateId: z.string().uuid().optional(),
});

// ============================================
// Bot Configuration Schemas
// ============================================
export const profileSchema = z.object({
  bot_name: z
    .string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre es muy largo"),
  description: z
    .string()
    .max(500, "La descripción no puede superar 500 caracteres")
    .optional(),
  age: z.coerce
    .number()
    .min(18, "La edad mínima es 18")
    .max(99, "La edad máxima es 99")
    .optional(),
  height: z.coerce
    .number()
    .min(140, "La altura mínima es 140cm")
    .max(220, "La altura máxima es 220cm")
    .optional(),
  measurements: z
    .string()
    .max(20, "Las medidas son muy largas")
    .optional(),
  location: z
    .string()
    .max(100, "La ubicación es muy larga")
    .optional(),
  availability_text: z
    .string()
    .max(500, "El texto de disponibilidad es muy largo")
    .optional(),
  profile_photo_url: z.string().url("Ingresa una URL válida").optional().or(z.literal("")),
});

export const personalitySchema = z.object({
  tone: z.enum(
    ["profesional", "amigable", "seductor", "formal", "casual", "custom"],
    {
      required_error: "Selecciona un tono de voz",
    }
  ),
  tone_custom: z.string().max(200).optional(),
  language: z.enum(["es", "en", "pt", "fr", "it"], {
    required_error: "Selecciona un idioma",
  }),
  emoji_style: z.enum(["ninguno", "minimo", "moderado", "abundante"], {
    required_error: "Selecciona un estilo de emojis",
  }),
  greeting_message: z.string().max(500, "El mensaje de saludo es muy largo").optional(),
  farewell_message: z.string().max(500, "El mensaje de despedida es muy largo").optional(),
  custom_phrases: z.array(z.string()).optional(),
});

export const serviceSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre del servicio es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre es muy largo"),
  description: z
    .string()
    .max(500, "La descripción es muy larga")
    .optional(),
  price: z.coerce
    .number()
    .positive("El precio debe ser positivo")
    .optional(),
  currency: z.string().default("UYU"),
  duration_minutes: z.coerce.number().positive().optional(),
  is_active: z.boolean().default(true),
});

export const availabilitySchema = z.object({
  day_of_week: z.coerce.number().min(0).max(6),
  is_available: z.boolean(),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
});

export const rulesSchema = z.object({
  temas_prohibidos: z.string().max(500).optional(), // Separados por comas
  palabras_escalacion: z.string().max(500).optional(), // Separadas por comas
  comportamiento_desconocido: z.enum(["disculparse", "escalar", "generico"]),
  auto_respuesta_fuera_horario: z
    .string()
    .max(500, "El mensaje es muy largo")
    .optional(),
});

// ============================================
// Conversation Schemas
// ============================================
export const updateConversationSchema = z.object({
  status: z.enum(["active", "closed", "archived"]).optional(),
  contact_name: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
});

export const blockNumberSchema = z.object({
  phone_number: z
    .string()
    .min(1, "El número es requerido")
    .regex(/^\+?[1-9]\d{1,14}$/, "Ingresa un número de teléfono válido"),
  reason: z.string().max(200).optional(),
});

// ============================================
// Image Upload Schema
// ============================================
export const imageUploadSchema = z.object({
  url: z.string().url("URL inválida"),
  caption: z.string().max(200).optional(),
  alt_text: z.string().max(100).optional(),
});

// ============================================
// API Key Schema
// ============================================
export const createApiKeySchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(50, "El nombre es muy largo"),
  permissions: z.array(z.enum(["read", "write", "admin"])).min(1),
  expires_at: z.string().datetime().optional(),
});

// ============================================
// Type Exports
// ============================================
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type CreateTenantFormData = z.infer<typeof createTenantSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type PersonalityFormData = z.infer<typeof personalitySchema>;
export type ServiceFormData = z.infer<typeof serviceSchema>;
export type AvailabilityFormData = z.infer<typeof availabilitySchema>;
export type RulesFormData = z.infer<typeof rulesSchema>;
export type BlockNumberFormData = z.infer<typeof blockNumberSchema>;
export type ImageUploadFormData = z.infer<typeof imageUploadSchema>;
export type CreateApiKeyFormData = z.infer<typeof createApiKeySchema>;
