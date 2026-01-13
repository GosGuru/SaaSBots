-- ============================================
-- SASBOT - ESQUEMA DE BASE DE DATOS
-- Multi-Tenant SaaS para Chatbots de WhatsApp
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: industry_templates (Templates por industria)
-- ============================================
CREATE TABLE IF NOT EXISTS industry_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- "Escort Premium", "Clínica Dental", etc.
  business_type TEXT NOT NULL, -- 'escort', 'dental', 'retail', 'restaurant', 'other'
  description TEXT,
  icon TEXT, -- Icono de Lucide o emoji
  
  -- n8n Workflow Template
  n8n_template_workflow_id TEXT NOT NULL, -- ID del workflow maestro en n8n
  n8n_workflow_json JSONB, -- Backup del JSON completo del workflow
  
  -- Configuraciones por defecto
  default_configurations JSONB NOT NULL DEFAULT '{}', -- Configs pre-cargadas al crear tenant
  
  -- System Prompt Template
  system_prompt_template TEXT, -- Prompt con placeholders: {{nombre}}, {{edad}}, etc.
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  version TEXT DEFAULT '1.0.0',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_business_type CHECK (business_type IN ('escort', 'dental', 'retail', 'restaurant', 'other'))
);

CREATE INDEX idx_industry_templates_type ON industry_templates(business_type) WHERE is_active = TRUE;

-- ============================================
-- TABLA: tenants (Clientes del SaaS)
-- ============================================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, -- Para URLs amigables: app.ejemplo.com/t/andrea-escort
  name TEXT NOT NULL, -- "Andrea - Escort Premium"
  business_type TEXT NOT NULL, -- 'escort', 'dental', 'retail', 'restaurant', 'other'
  industry_template_id UUID REFERENCES industry_templates(id),
  
  -- WhatsApp Connection
  whatsapp_number TEXT UNIQUE, -- +598xxxxxxxxx
  whatsapp_business_account_id TEXT,
  whatsapp_phone_number_id TEXT,
  whatsapp_api_token TEXT, -- Encrypted
  
  -- n8n Integration
  n8n_workflow_id TEXT UNIQUE, -- ID del workflow duplicado
  n8n_webhook_url TEXT, -- URL del webhook "Escucha wpp"
  n8n_workflow_active BOOLEAN DEFAULT FALSE,
  
  -- Redis Session
  redis_session_prefix TEXT, -- Prefijo único para separar sessions: "tenant_abc123"
  
  -- Subscription
  status TEXT DEFAULT 'trial', -- 'trial', 'active', 'suspended', 'cancelled'
  subscription_plan TEXT DEFAULT 'basic', -- 'basic', 'pro', 'enterprise'
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  subscription_started_at TIMESTAMPTZ,
  
  -- Settings
  timezone TEXT DEFAULT 'America/Montevideo',
  locale TEXT DEFAULT 'es',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ, -- Soft delete
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('trial', 'active', 'suspended', 'cancelled')),
  CONSTRAINT valid_business_type CHECK (business_type IN ('escort', 'dental', 'retail', 'restaurant', 'other')),
  CONSTRAINT valid_subscription_plan CHECK (subscription_plan IN ('basic', 'pro', 'enterprise'))
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_whatsapp ON tenants(whatsapp_number);
CREATE INDEX idx_tenants_status ON tenants(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenants_business_type ON tenants(business_type);

-- ============================================
-- TABLA: users (Usuarios del dashboard)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'admin', -- 'owner', 'admin', 'viewer'
  
  -- Preferences
  locale TEXT DEFAULT 'es',
  timezone TEXT DEFAULT 'America/Montevideo',
  
  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0,
  
  -- Metadata
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_role CHECK (role IN ('owner', 'admin', 'viewer'))
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- TABLA: bot_configurations (Config dinámica del bot)
-- ============================================
CREATE TABLE IF NOT EXISTS bot_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  
  -- Organización por categorías
  category TEXT NOT NULL, -- 'profile', 'personality', 'services', 'availability', 'images', 'rules', 'integrations'
  config_key TEXT NOT NULL, -- 'nombre', 'edad', 'tono', 'horario_lunes', etc.
  config_value JSONB NOT NULL, -- Flexible: strings, numbers, arrays, objects
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0, -- Para ordenar en el dashboard
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(tenant_id, category, config_key),
  CONSTRAINT valid_category CHECK (category IN ('profile', 'personality', 'services', 'availability', 'images', 'rules', 'integrations'))
);

CREATE INDEX idx_bot_configs_tenant_category ON bot_configurations(tenant_id, category) WHERE is_active = TRUE;
CREATE INDEX idx_bot_configs_tenant ON bot_configurations(tenant_id);

-- ============================================
-- TABLA: services (Servicios del negocio)
-- ============================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  currency TEXT DEFAULT 'UYU',
  duration_minutes INTEGER, -- Duración en minutos
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_tenant ON services(tenant_id) WHERE is_active = TRUE;

-- ============================================
-- TABLA: images (Galería de imágenes)
-- ============================================
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  
  url TEXT NOT NULL,
  caption TEXT,
  alt_text TEXT,
  file_name TEXT,
  file_size INTEGER, -- En bytes
  mime_type TEXT,
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_images_tenant ON images(tenant_id) WHERE is_active = TRUE;

-- ============================================
-- TABLA: conversations (Historial de chats)
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  
  -- Cliente de WhatsApp
  phone_number TEXT NOT NULL, -- Número del cliente que escribió
  contact_name TEXT, -- Nombre del contacto si está guardado
  
  -- Estado
  status TEXT DEFAULT 'active', -- 'active', 'closed', 'archived'
  assigned_to UUID REFERENCES users(id), -- Usuario del dashboard asignado (si hay escalación)
  
  -- Tags y categorías
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Metadata
  first_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  unread_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('active', 'closed', 'archived')),
  UNIQUE(tenant_id, phone_number) -- Una conversación por tenant+phone
);

CREATE INDEX idx_conversations_tenant_status ON conversations(tenant_id, status, last_message_at DESC);
CREATE INDEX idx_conversations_phone ON conversations(phone_number);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- ============================================
-- TABLA: messages (Mensajes individuales)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  
  -- Contenido
  direction TEXT NOT NULL, -- 'inbound' (del cliente), 'outbound' (del bot)
  message_type TEXT NOT NULL, -- 'text', 'audio', 'image', 'video', 'document'
  content TEXT, -- Texto del mensaje o transcripción
  media_url TEXT, -- URL del archivo multimedia si aplica
  
  -- WhatsApp IDs
  whatsapp_message_id TEXT UNIQUE, -- ID único de WhatsApp
  
  -- AI Processing
  ai_processed BOOLEAN DEFAULT FALSE,
  ai_response_time_ms INTEGER, -- Tiempo que tardó la IA en responder
  ai_tokens_used INTEGER, -- Tokens consumidos
  
  -- Status
  status TEXT DEFAULT 'sent', -- 'pending', 'sent', 'delivered', 'read', 'failed'
  error_message TEXT, -- Si falló el envío
  
  -- Metadata
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_direction CHECK (direction IN ('inbound', 'outbound')),
  CONSTRAINT valid_message_type CHECK (message_type IN ('text', 'audio', 'image', 'video', 'document')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed'))
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_tenant_date ON messages(tenant_id, created_at DESC);
CREATE INDEX idx_messages_whatsapp ON messages(whatsapp_message_id);

-- ============================================
-- TABLA: blocked_numbers (Números bloqueados)
-- ============================================
CREATE TABLE IF NOT EXISTS blocked_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  phone_number TEXT NOT NULL,
  reason TEXT,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  blocked_by UUID REFERENCES users(id),
  
  UNIQUE(tenant_id, phone_number)
);

CREATE INDEX idx_blocked_numbers_tenant ON blocked_numbers(tenant_id);
CREATE INDEX idx_blocked_numbers_phone ON blocked_numbers(tenant_id, phone_number);

-- ============================================
-- TABLA: availability_schedules (Horarios de disponibilidad)
-- ============================================
CREATE TABLE IF NOT EXISTS availability_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  
  day_of_week INTEGER NOT NULL, -- 0 = Domingo, 1 = Lunes, etc.
  is_available BOOLEAN DEFAULT TRUE,
  start_time TIME, -- Hora de inicio
  end_time TIME, -- Hora de fin
  
  -- Para días específicos (fechas especiales, feriados, etc.)
  specific_date DATE, -- NULL si es un horario regular de día de semana
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_day_of_week CHECK (day_of_week >= 0 AND day_of_week <= 6)
);

CREATE INDEX idx_availability_tenant ON availability_schedules(tenant_id, day_of_week);

-- ============================================
-- TABLA: audit_logs (Logs de cambios)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  
  action TEXT NOT NULL, -- 'config_updated', 'workflow_activated', 'conversation_escalated', etc.
  entity_type TEXT, -- 'bot_configuration', 'conversation', 'tenant', etc.
  entity_id UUID,
  
  old_value JSONB,
  new_value JSONB,
  
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_tenant_date ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ============================================
-- TABLA: api_keys (API Keys para integraciones)
-- ============================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL, -- "Producción", "Desarrollo", etc.
  key_hash TEXT NOT NULL, -- Hash de la API key
  key_prefix TEXT NOT NULL, -- Primeros 8 caracteres para identificar
  
  permissions TEXT[] DEFAULT ARRAY['read']::TEXT[], -- ['read', 'write', 'admin']
  
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_api_keys_tenant ON api_keys(tenant_id) WHERE is_active = TRUE;
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas multi-tenant
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS: tenants
-- ============================================
CREATE POLICY "Users can view their own tenant"
  ON tenants FOR SELECT
  USING (id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their own tenant"
  ON tenants FOR UPDATE
  USING (id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- ============================================
-- POLÍTICAS RLS: users
-- ============================================
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can view team members"
  ON users FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- ============================================
-- POLÍTICAS RLS: bot_configurations
-- ============================================
CREATE POLICY "Users can view tenant configs"
  ON bot_configurations FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert tenant configs"
  ON bot_configurations FOR INSERT
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin')
  ));

CREATE POLICY "Users can update tenant configs"
  ON bot_configurations FOR UPDATE
  USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin')
  ));

CREATE POLICY "Users can delete tenant configs"
  ON bot_configurations FOR DELETE
  USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- ============================================
-- POLÍTICAS RLS: services
-- ============================================
CREATE POLICY "Users can manage tenant services"
  ON services FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

-- ============================================
-- POLÍTICAS RLS: images
-- ============================================
CREATE POLICY "Users can manage tenant images"
  ON images FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

-- ============================================
-- POLÍTICAS RLS: conversations
-- ============================================
CREATE POLICY "Users can view tenant conversations"
  ON conversations FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update tenant conversations"
  ON conversations FOR UPDATE
  USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

-- ============================================
-- POLÍTICAS RLS: messages
-- ============================================
CREATE POLICY "Users can view tenant messages"
  ON messages FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

-- ============================================
-- POLÍTICAS RLS: blocked_numbers
-- ============================================
CREATE POLICY "Users can manage blocked numbers"
  ON blocked_numbers FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

-- ============================================
-- POLÍTICAS RLS: availability_schedules
-- ============================================
CREATE POLICY "Users can manage availability"
  ON availability_schedules FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

-- ============================================
-- POLÍTICAS RLS: audit_logs
-- ============================================
CREATE POLICY "Users can view tenant audit logs"
  ON audit_logs FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- ============================================
-- POLÍTICAS RLS: api_keys
-- ============================================
CREATE POLICY "Users can manage tenant API keys"
  ON api_keys FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Auto-update de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_tenants_updated_at 
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bot_configurations_updated_at 
  BEFORE UPDATE ON bot_configurations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at 
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at 
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_updated_at 
  BEFORE UPDATE ON availability_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCIÓN: Generar slug único
-- ============================================
CREATE OR REPLACE FUNCTION generate_unique_slug(input_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convertir a slug: "Andrea Escort" -> "andrea-escort"
  base_slug := lower(regexp_replace(input_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  -- Si ya existe, agregar número
  WHILE EXISTS (SELECT 1 FROM tenants WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: Actualizar contador de mensajes
-- ============================================
CREATE OR REPLACE FUNCTION update_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET 
    message_count = message_count + 1,
    last_message_at = NEW.created_at,
    unread_count = CASE 
      WHEN NEW.direction = 'inbound' THEN unread_count + 1 
      ELSE unread_count 
    END
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_message_count
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_message_count();

-- ============================================
-- FUNCIÓN: Crear usuario después de auth signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear usuario automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- DATOS INICIALES: Templates de industria
-- ============================================
INSERT INTO industry_templates (name, business_type, description, icon, n8n_template_workflow_id, default_configurations, system_prompt_template)
VALUES 
  (
    'Escort Premium',
    'escort',
    'Template optimizado para servicios de acompañantes profesionales',
    '💋',
    'aO7XTQho1aB2JAGM',
    '{
      "profile": {
        "descripcion": "Acompañante profesional y discreta",
        "ubicacion": "Madrid, España"
      },
      "personality": {
        "tono": "seductora y coqueta",
        "idioma": "español",
        "nivel_emojis": "moderado"
      },
      "rules": {
        "temas_prohibidos": ["menores", "drogas", "violencia"],
        "escalacion": "Si el cliente se pone agresivo o irrespetuoso"
      }
    }',
    'Eres {{nombre}}, una acompañante profesional de {{edad}} años. Tu estilo es {{tono}}. Ubicación: {{ubicacion}}. Servicios: {{servicios}}. Horarios: {{horarios}}. Reglas: {{reglas}}.'
  ),
  (
    'Clínica Dental',
    'dental',
    'Template para clínicas dentales y consultorios odontológicos',
    '🦷',
    'aO7XTQho1aB2JAGM',
    '{
      "profile": {
        "descripcion": "Clínica dental con tecnología de vanguardia",
        "ubicacion": "Tu ciudad"
      },
      "personality": {
        "tono": "profesional y amigable",
        "idioma": "español",
        "nivel_emojis": "poco"
      },
      "rules": {
        "temas_prohibidos": [],
        "escalacion": "Urgencias dentales o consultas complejas"
      }
    }',
    'Eres el asistente virtual de {{nombre}}. Ayudas a los pacientes a agendar citas, consultar precios y resolver dudas sobre tratamientos dentales. Ubicación: {{ubicacion}}. Servicios: {{servicios}}. Horarios: {{horarios}}.'
  ),
  (
    'Tienda Online',
    'retail',
    'Template para e-commerce y tiendas online',
    '🛒',
    'aO7XTQho1aB2JAGM',
    '{
      "profile": {
        "descripcion": "Tienda online con los mejores productos",
        "ubicacion": "Envíos a todo el país"
      },
      "personality": {
        "tono": "amigable y servicial",
        "idioma": "español",
        "nivel_emojis": "moderado"
      },
      "rules": {
        "temas_prohibidos": [],
        "escalacion": "Problemas con pedidos o devoluciones"
      }
    }',
    'Eres el asistente de ventas de {{nombre}}. Ayudas a los clientes a encontrar productos, consultar stock y realizar pedidos. Catálogo: {{servicios}}. Horarios de atención: {{horarios}}.'
  ),
  (
    'Restaurante',
    'restaurant',
    'Template para restaurantes y servicios de comida',
    '🍽️',
    'aO7XTQho1aB2JAGM',
    '{
      "profile": {
        "descripcion": "Restaurante con la mejor gastronomía",
        "ubicacion": "Tu ciudad"
      },
      "personality": {
        "tono": "cálido y hospitalario",
        "idioma": "español",
        "nivel_emojis": "moderado"
      },
      "rules": {
        "temas_prohibidos": [],
        "escalacion": "Reservas para grupos grandes o eventos especiales"
      }
    }',
    'Eres el asistente de {{nombre}}. Ayudas a los clientes con reservas, menú del día, horarios y pedidos a domicilio. Ubicación: {{ubicacion}}. Menú: {{servicios}}. Horarios: {{horarios}}.'
  )
ON CONFLICT DO NOTHING;
