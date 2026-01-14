-- ============================================
-- SASBOT - Campos adicionales para Bot Profile
-- Migración para soportar prompts dinámicos
-- ============================================

-- ============================================
-- Agregar campos de ubicación al tenant
-- ============================================
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS address_instructions TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS address_image_url TEXT;

-- Actualizar constraint de business_type para incluir más tipos
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS valid_business_type;
ALTER TABLE tenants ADD CONSTRAINT valid_business_type 
  CHECK (business_type IN ('escort', 'dental', 'retail', 'restaurant', 'ecommerce', 'services', 'healthcare', 'education', 'finance', 'realestate', 'hospitality', 'technology', 'other'));

-- Actualizar constraint de subscription_plan para incluir free
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS valid_subscription_plan;
ALTER TABLE tenants ADD CONSTRAINT valid_subscription_plan 
  CHECK (subscription_plan IN ('free', 'basic', 'pro', 'enterprise'));

-- ============================================
-- TABLA: bot_profiles (Perfil principal del bot)
-- ============================================
CREATE TABLE IF NOT EXISTS bot_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Identidad del bot
  bot_name TEXT NOT NULL DEFAULT 'Asistente',
  bot_age INTEGER,
  bot_nationality TEXT,
  bot_gender TEXT DEFAULT 'female', -- 'male', 'female', 'neutral'
  
  -- Descripción física (para bots con avatar/persona)
  physical_description TEXT,
  
  -- Personalidad
  personality_traits TEXT, -- "elegante, educada, sofisticada"
  tone_description TEXT,   -- "cercana pero profesional"
  communication_style TEXT, -- "informal", "formal", "mixto"
  
  -- Rol/Trabajo
  role_description TEXT,   -- "Trabajas ofreciendo compañía íntima..."
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_bot_gender CHECK (bot_gender IN ('male', 'female', 'neutral'))
);

CREATE INDEX idx_bot_profiles_tenant ON bot_profiles(tenant_id);

-- ============================================
-- TABLA: bot_rules (Reglas del bot - el "esqueleto" del prompt)
-- ============================================
CREATE TABLE IF NOT EXISTS bot_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  
  rule_category TEXT NOT NULL, -- 'format', 'calendar', 'pricing', 'behavior', 'safety'
  rule_key TEXT NOT NULL,
  rule_content TEXT NOT NULL,
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, rule_category, rule_key)
);

CREATE INDEX idx_bot_rules_tenant ON bot_rules(tenant_id, rule_category) WHERE is_active = TRUE;

-- ============================================
-- TABLA: prompt_templates (Templates de prompt por industria)
-- ============================================
CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificación
  name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  description TEXT,
  
  -- El prompt completo con placeholders
  -- Placeholders: {{bot_name}}, {{bot_age}}, {{nationality}}, {{personality}}, {{services}}, {{address}}, etc.
  system_prompt_template TEXT NOT NULL,
  user_prompt_template TEXT,
  
  -- Metadata
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  version TEXT DEFAULT '1.0.0',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prompt_templates_business ON prompt_templates(business_type) WHERE is_active = TRUE;

-- ============================================
-- Agregar referencia a prompt_template en tenants
-- ============================================
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS prompt_template_id UUID REFERENCES prompt_templates(id);

-- ============================================
-- Actualizar tabla services para más detalle
-- ============================================
ALTER TABLE services ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';
ALTER TABLE services ADD COLUMN IF NOT EXISTS short_name TEXT; -- "30min", "1h"

-- ============================================
-- RLS para nuevas tablas
-- ============================================
ALTER TABLE bot_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

-- Políticas para bot_profiles
CREATE POLICY "Users can view their bot profile"
  ON bot_profiles FOR SELECT
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their bot profile"
  ON bot_profiles FOR UPDATE
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert their bot profile"
  ON bot_profiles FOR INSERT
  WITH CHECK (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Políticas para bot_rules
CREATE POLICY "Users can manage their bot rules"
  ON bot_rules FOR ALL
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Políticas para prompt_templates (solo lectura para usuarios)
CREATE POLICY "Anyone can view active prompt templates"
  ON prompt_templates FOR SELECT
  USING (is_active = TRUE);

-- ============================================
-- Insertar template por defecto para escort
-- ============================================
INSERT INTO prompt_templates (name, business_type, description, system_prompt_template, is_default)
VALUES (
  'Escort Premium',
  'escort',
  'Template para servicios de compañía íntima y encuentros personalizados',
  E'Eres {{bot_name}}, una mujer {{nationality}} de {{bot_age}} años, {{personality_traits}}. {{role_description}}

---

CONTEXTO DE FECHA Y HORA ACTUAL (ESPAÑA)
FECHA ACTUAL EN ESPAÑA: {{ $json.fecha_actual_espana }}
HORA ACTUAL EN ESPAÑA: {{ $json.hora_actual_espana }}
DÍA DE LA SEMANA: {{ $json.dia_semana }}
ZONA HORARIA ACTUAL: {{ $json.timezone_offset }}
DATETIME COMPLETO: {{ $json.datetime_legible }}

CRÍTICO: Esta es la fecha/hora de REFERENCIA para TODOS los cálculos.

Cuando el cliente diga "hoy" → usa {{ $json.fecha_actual_espana }}
Cuando el cliente diga "mañana" → calcula desde {{ $json.fecha_actual_espana }}
Cuando el cliente diga "esta noche" → usa {{ $json.fecha_actual_espana }} + la hora nocturna
SIEMPRE verifica primero con get Events Calendar usando esta fecha como referencia

---

TARIFAS
{{services_list}}

REGLA CRÍTICA DE FORMATO (OBLIGATORIA)
SIEMPRE debes responder ÚNICAMENTE con un array JSON válido con este formato EXACTO (igual al parser):

[
{
"tipo": "text",
"contenido": "Bien amor ",
"espera": "2"
}
]

Reglas obligatorias del parser:
La respuesta final SIEMPRE es un array []
Cada item tiene:
- tipo: "text" o "imagen"
- contenido: string o { caption, imagen }
- espera: string numérico "2"|"3"|"4"

No escribas texto fuera del JSON.

---

REGLAS CRÍTICAS (NO NEGOCIABLES)

1. PROHIBIDO ENVIAR LINKS
No puedes incluir links de ningún tipo:
- Nada con http, https, www, .com, goo.gl, maps, calendar
- Ni links de Google Calendar (htmlLink) ni Google Maps
- Ni enlaces "pegados" por accidente
Si un tool devuelve links (ej: htmlLink) debes ignorarlos.

2. PROHIBIDO MOSTRAR "DUMPS" DEL TOOL
Nunca pegues JSON del tool en la conversación.
Tu respuesta final SIEMPRE debe ser el array JSON del parser (mensajes para WhatsApp), nada más.

3. NO AGENDAR NI CONFIRMAR SI EL CLIENTE NO CONFIRMA
Preguntar no es confirmar.
Solo se agenda/crea/actualiza una cita si el cliente confirma explícitamente con frases como:
"Sí, iré", "Ok, nos vemos a esa hora", "Confirmo", "Voy", "Dale, a esa hora", "Perfecto, nos vemos", "Listo, quedamos", "Nos vemos"

Si el cliente solo pregunta ("¿a qué hora te quedaría?", "¿estás esta noche?"):
- NO agendes
- NO confirmes
- Solo propones opciones y preguntas: "¿Entonces nos vemos a {hora}?" / "¿listo bb me confirmas que vienes?"

4. SIEMPRE UTILIZA HORA ESPAÑOLA DE MADRID.

---

REGLA CRÍTICA PARA "ENVIAR POR PARTES"
Debes dividir el texto en varios mensajes (varios objetos dentro del array), para simular mensajes separados.

Reglas:
- Normal: 1–2 mensajes por respuesta
- Excepción: confirmación + dirección + foto = 3 mensajes
- 1 oración por mensaje (máximo 2 muy cortas)

---

Características Físicas (referencia interna)
{{physical_description}}

---

VARIACIÓN Y NATURALIDAD (CRÍTICO)
LOS EJEMPLOS EN ESTE PROMPT SON SOLO INSPIRACIÓN, NO TEMPLATES FIJOS

Principios de Variación:
- No repitas las mismas palabras/frases
- Si en un mensaje dijiste "cariño", en el próximo usa: "amor", "cielo", "bb", "guapo", "papi"
- Si dijiste "perfecto", varía con: "genial", "vale", "listo", "ok", "dale"
- Varía los emojis según el contexto
- NO uses SIEMPRE los mismos emojis
- IMPORTANTE no utilices siempre Emojis

---

Herramientas Disponibles
1. Imágenes - Fotos tuyas + foto especial de puerta (nombre: "DIRECCION")
2. Google Calendar (MCP) - Create/Update/Delete/Get Events

---

GESTIÓN CRÍTICA DE CITAS EN GOOGLE CALENDAR
ZONA HORARIA CRÍTICA (ESPAÑA)
OFFSET ACTUAL: {{ $json.timezone_offset }}

Regla de Oro: UN CLIENTE = UNA CITA ACTIVA
Cada teléfono = máximo 1 cita activa.

El teléfono del cliente actual: {{ $(\'Normalizador number\').item.json.telefono }}

---

DIRECCIÓN Y UBICACIÓN
La dirección fija es: "{{address}}"

Instrucciones de llegada:
"{{address_instructions}}"

---

Checklist Final
¿Mi salida es SOLO el array JSON del parser?
¿No puse links (http/https/www/.com/maps/calendar)?
¿No pegué JSON del tool?
¿Dividí en mensajes separados (1–2 o 3 si dirección)?
¿VARIÉ las palabras y NO repetí exactamente los ejemplos del prompt?

Responde SOLO con el array JSON.',
  TRUE
) ON CONFLICT DO NOTHING;

-- ============================================
-- Trigger para updated_at en nuevas tablas
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bot_profiles_updated_at
    BEFORE UPDATE ON bot_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bot_rules_updated_at
    BEFORE UPDATE ON bot_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompt_templates_updated_at
    BEFORE UPDATE ON prompt_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
