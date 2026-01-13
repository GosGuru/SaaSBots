export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          permissions: string[] | null
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          permissions?: string[] | null
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          permissions?: string[] | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown
          new_value: Json | null
          old_value: Json | null
          tenant_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          old_value?: Json | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          old_value?: Json | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_schedules: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string | null
          id: string
          is_available: boolean | null
          specific_date: string | null
          start_time: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time?: string | null
          id?: string
          is_available?: boolean | null
          specific_date?: string | null
          start_time?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string | null
          id?: string
          is_available?: boolean | null
          specific_date?: string | null
          start_time?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_schedules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_numbers: {
        Row: {
          blocked_at: string | null
          blocked_by: string | null
          id: string
          phone_number: string
          reason: string | null
          tenant_id: string
        }
        Insert: {
          blocked_at?: string | null
          blocked_by?: string | null
          id?: string
          phone_number: string
          reason?: string | null
          tenant_id: string
        }
        Update: {
          blocked_at?: string | null
          blocked_by?: string | null
          id?: string
          phone_number?: string
          reason?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_numbers_blocked_by_fkey"
            columns: ["blocked_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_numbers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_configurations: {
        Row: {
          category: string
          config_key: string
          config_value: Json
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          category: string
          config_key: string
          config_value: Json
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          config_key?: string
          config_value?: Json
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bot_configurations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          assigned_to: string | null
          contact_name: string | null
          created_at: string | null
          first_message_at: string | null
          id: string
          last_message_at: string | null
          message_count: number | null
          phone_number: string
          status: string | null
          tags: string[] | null
          tenant_id: string
          unread_count: number | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          contact_name?: string | null
          created_at?: string | null
          first_message_at?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          phone_number: string
          status?: string | null
          tags?: string[] | null
          tenant_id: string
          unread_count?: number | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          contact_name?: string | null
          created_at?: string | null
          first_message_at?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          phone_number?: string
          status?: string | null
          tags?: string[] | null
          tenant_id?: string
          unread_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      images: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string | null
          display_order: number | null
          file_name: string | null
          file_size: number | null
          id: string
          is_active: boolean | null
          mime_type: string | null
          tenant_id: string
          url: string
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          mime_type?: string | null
          tenant_id: string
          url: string
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          mime_type?: string | null
          tenant_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "images_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_templates: {
        Row: {
          business_type: string
          created_at: string | null
          default_configurations: Json
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          n8n_template_workflow_id: string
          n8n_workflow_json: Json | null
          name: string
          system_prompt_template: string | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          business_type: string
          created_at?: string | null
          default_configurations?: Json
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          n8n_template_workflow_id: string
          n8n_workflow_json?: Json | null
          name: string
          system_prompt_template?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          business_type?: string
          created_at?: string | null
          default_configurations?: Json
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          n8n_template_workflow_id?: string
          n8n_workflow_json?: Json | null
          name?: string
          system_prompt_template?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          ai_processed: boolean | null
          ai_response_time_ms: number | null
          ai_tokens_used: number | null
          content: string | null
          conversation_id: string
          created_at: string | null
          delivered_at: string | null
          direction: string
          error_message: string | null
          id: string
          media_url: string | null
          message_type: string
          read_at: string | null
          sent_at: string | null
          status: string | null
          tenant_id: string
          whatsapp_message_id: string | null
        }
        Insert: {
          ai_processed?: boolean | null
          ai_response_time_ms?: number | null
          ai_tokens_used?: number | null
          content?: string | null
          conversation_id: string
          created_at?: string | null
          delivered_at?: string | null
          direction: string
          error_message?: string | null
          id?: string
          media_url?: string | null
          message_type: string
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          tenant_id: string
          whatsapp_message_id?: string | null
        }
        Update: {
          ai_processed?: boolean | null
          ai_response_time_ms?: number | null
          ai_tokens_used?: number | null
          content?: string | null
          conversation_id?: string
          created_at?: string | null
          delivered_at?: string | null
          direction?: string
          error_message?: string | null
          id?: string
          media_url?: string | null
          message_type?: string
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          tenant_id?: string
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          display_order: number | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          name: string
          price: number | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          display_order?: number | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          display_order?: number | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          business_type: string
          created_at: string | null
          deleted_at: string | null
          id: string
          industry_template_id: string | null
          locale: string | null
          n8n_webhook_url: string | null
          n8n_workflow_active: boolean | null
          n8n_workflow_id: string | null
          name: string
          redis_session_prefix: string | null
          slug: string
          status: string | null
          subscription_plan: string | null
          subscription_started_at: string | null
          timezone: string | null
          trial_ends_at: string | null
          updated_at: string | null
          whatsapp_api_token: string | null
          whatsapp_business_account_id: string | null
          whatsapp_number: string | null
          whatsapp_phone_number_id: string | null
        }
        Insert: {
          business_type: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          industry_template_id?: string | null
          locale?: string | null
          n8n_webhook_url?: string | null
          n8n_workflow_active?: boolean | null
          n8n_workflow_id?: string | null
          name: string
          redis_session_prefix?: string | null
          slug: string
          status?: string | null
          subscription_plan?: string | null
          subscription_started_at?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          whatsapp_api_token?: string | null
          whatsapp_business_account_id?: string | null
          whatsapp_number?: string | null
          whatsapp_phone_number_id?: string | null
        }
        Update: {
          business_type?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          industry_template_id?: string | null
          locale?: string | null
          n8n_webhook_url?: string | null
          n8n_workflow_active?: boolean | null
          n8n_workflow_id?: string | null
          name?: string
          redis_session_prefix?: string | null
          slug?: string
          status?: string | null
          subscription_plan?: string | null
          subscription_started_at?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          whatsapp_api_token?: string | null
          whatsapp_business_account_id?: string | null
          whatsapp_number?: string | null
          whatsapp_phone_number_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_industry_template_id_fkey"
            columns: ["industry_template_id"]
            isOneToOne: false
            referencedRelation: "industry_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          last_login_at: string | null
          locale: string | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          role: string | null
          tenant_id: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          last_login_at?: string | null
          locale?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          role?: string | null
          tenant_id?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          locale?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          role?: string | null
          tenant_id?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_unique_slug: { Args: { input_name: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
