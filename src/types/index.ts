import type { Tables, InsertTables, UpdateTables, Enums } from "./database.types";

// ============================================
// Re-exports de Database Types
// ============================================
export type { Database, Json, Tables, InsertTables, UpdateTables, Enums } from "./database.types";

// ============================================
// Entity Types (Aliases más simples)
// ============================================
export type Tenant = Tables<"tenants">;
export type TenantInsert = InsertTables<"tenants">;
export type TenantUpdate = UpdateTables<"tenants">;

export type User = Tables<"users">;
export type UserInsert = InsertTables<"users">;
export type UserUpdate = UpdateTables<"users">;

export type IndustryTemplate = Tables<"industry_templates">;
export type IndustryTemplateInsert = InsertTables<"industry_templates">;

export type BotConfiguration = Tables<"bot_configurations">;
export type BotConfigurationInsert = InsertTables<"bot_configurations">;
export type BotConfigurationUpdate = UpdateTables<"bot_configurations">;

export type Service = Tables<"services">;
export type ServiceInsert = InsertTables<"services">;
export type ServiceUpdate = UpdateTables<"services">;

export type Image = Tables<"images">;
export type ImageInsert = InsertTables<"images">;

export type Conversation = Tables<"conversations">;
export type ConversationInsert = InsertTables<"conversations">;
export type ConversationUpdate = UpdateTables<"conversations">;

export type Message = Tables<"messages">;
export type MessageInsert = InsertTables<"messages">;

export type BlockedNumber = Tables<"blocked_numbers">;
export type BlockedNumberInsert = InsertTables<"blocked_numbers">;

export type AvailabilitySchedule = Tables<"availability_schedules">;
export type AvailabilityScheduleInsert = InsertTables<"availability_schedules">;

export type AuditLog = Tables<"audit_logs">;
export type AuditLogInsert = InsertTables<"audit_logs">;

export type ApiKey = Tables<"api_keys">;
export type ApiKeyInsert = InsertTables<"api_keys">;

// ============================================
// Enum Types
// ============================================
export type BusinessType = Enums<"business_type">;
export type UserRole = Enums<"user_role">;
export type TenantStatus = Enums<"tenant_status">;
export type SubscriptionPlan = Enums<"subscription_plan">;
export type ConversationStatus = Enums<"conversation_status">;
export type MessageDirection = Enums<"message_direction">;
export type MessageType = Enums<"message_type">;
export type MessageStatus = Enums<"message_status">;
export type ConfigCategory = Enums<"config_category">;

// ============================================
// Extended Types (con relaciones)
// ============================================
export interface UserWithTenant {
  user: { id: string; email?: string } | null;
  profile: User | null;
  tenant: Tenant | null;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export interface TenantWithConfigurations extends Tenant {
  bot_configurations: BotConfiguration[];
  services: Service[];
  images: Image[];
}

// ============================================
// API Response Types
// ============================================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================
// Auth Types
// ============================================
export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
}

export interface Session {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// ============================================
// Bot Configuration Types
// ============================================
export interface ProfileConfig {
  nombre: string;
  descripcion_corta?: string;
  descripcion_larga?: string;
  edad?: number;
  altura?: string;
  ubicacion?: string;
  foto_url?: string;
}

export interface PersonalityConfig {
  tono: string;
  idioma: string;
  modismos?: string;
  nivel_emojis: "ninguno" | "poco" | "moderado" | "muchos";
  frases_clave?: string[];
}

export interface AvailabilityConfig {
  dia: number; // 0-6 (Domingo-Sábado)
  activo: boolean;
  inicio?: string; // HH:mm
  fin?: string; // HH:mm
}

export interface RulesConfig {
  temas_prohibidos?: string[];
  palabras_escalacion?: string[];
  comportamiento_desconocido: "disculparse" | "escalar" | "generico";
  auto_respuesta_fuera_horario?: string;
}

// ============================================
// n8n Types
// ============================================
export interface N8nWorkflow {
  id: string;
  name: string;
  nodes: N8nNode[];
  connections: Record<string, unknown>;
  settings: Record<string, unknown>;
  staticData: Record<string, unknown>;
  active: boolean;
}

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, unknown>;
  credentials?: Record<string, unknown>;
  disabled?: boolean;
}

export interface WorkflowCreationResult {
  workflowId: string;
  webhookUrl: string;
  redisSessionPrefix: string;
}

// ============================================
// Dashboard Stats Types
// ============================================
export interface DashboardStats {
  totalMessages: number;
  todayMessages: number;
  activeConversations: number;
  responseRate: number;
  avgResponseTime: number;
  botActive: boolean;
}

export interface MessagesByDay {
  date: string;
  inbound: number;
  outbound: number;
}

export interface HourlyActivity {
  hour: number;
  count: number;
}

// ============================================
// Form Types
// ============================================
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  fullName: string;
}

export interface OnboardingFormData {
  businessName: string;
  businessType: BusinessType;
  templateId?: string;
}
