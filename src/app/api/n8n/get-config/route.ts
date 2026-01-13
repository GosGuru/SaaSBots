import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * API Endpoint para n8n: Obtener configuración completa del bot
 * 
 * GET /api/n8n/get-config?tenant_id=uuid
 * 
 * Retorna:
 * - System prompt construido dinámicamente
 * - Servicios del tenant
 * - Imágenes disponibles
 * - Horarios de disponibilidad
 * - Reglas y configuraciones
 */

const N8N_API_KEY = process.env.N8N_API_KEY || "sasbot-n8n-secret-key";

// Tipo para las configuraciones
interface BotConfig {
  category: string;
  config_key: string;
  config_value: unknown;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  currency: string;
  duration_minutes: number | null;
}

interface Image {
  id: string;
  url: string;
  caption: string | null;
  alt_text: string | null;
}

interface Schedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export async function GET(request: NextRequest) {
  try {
    // Validar API Key
    const apiKey = request.headers.get("x-api-key");
    if (apiKey !== N8N_API_KEY) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid API key" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get("tenant_id");

    if (!tenantId) {
      return NextResponse.json(
        { error: "Bad Request", message: "tenant_id is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Obtener datos en paralelo para mayor eficiencia
    const [
      tenantResult,
      configsResult,
      servicesResult,
      imagesResult,
      schedulesResult
    ] = await Promise.all([
      // Información del tenant
      supabase
        .from("tenants")
        .select("*")
        .eq("id", tenantId)
        .single(),
      
      // Configuraciones del bot
      supabase
        .from("bot_configurations")
        .select("category, config_key, config_value")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("display_order"),
      
      // Servicios
      supabase
        .from("services")
        .select("id, name, description, price, currency, duration_minutes")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("display_order"),
      
      // Imágenes
      supabase
        .from("images")
        .select("id, url, caption, alt_text")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("display_order"),
      
      // Horarios
      supabase
        .from("availability_schedules")
        .select("day_of_week, start_time, end_time, is_available")
        .eq("tenant_id", tenantId)
        .order("day_of_week")
    ]);

    if (tenantResult.error || !tenantResult.data) {
      return NextResponse.json(
        { error: "Not Found", message: "Tenant not found" },
        { status: 404 }
      );
    }

    const tenant = tenantResult.data;
    const configs = (configsResult.data || []) as BotConfig[];
    const services = (servicesResult.data || []) as Service[];
    const images = (imagesResult.data || []) as Image[];
    const schedules = (schedulesResult.data || []) as Schedule[];

    // Organizar configuraciones por categoría
    const configsByCategory: Record<string, Record<string, unknown>> = {};
    for (const config of configs) {
      if (!configsByCategory[config.category]) {
        configsByCategory[config.category] = {};
      }
      configsByCategory[config.category][config.config_key] = config.config_value;
    }

    // Construir el system prompt dinámico
    const systemPrompt = buildSystemPrompt(tenant, configsByCategory, services, schedules);

    // Construir texto de disponibilidad
    const availabilityText = buildAvailabilityText(schedules);

    // Construir lista de servicios formateada
    const servicesText = buildServicesText(services);

    return NextResponse.json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        business_type: tenant.business_type,
        timezone: tenant.timezone,
        locale: tenant.locale
      },
      system_prompt: systemPrompt,
      configs: configsByCategory,
      services: services,
      services_text: servicesText,
      images: images,
      availability: schedules,
      availability_text: availabilityText,
      redis_prefix: tenant.redis_session_prefix || `tenant_${tenant.slug}`
    });

  } catch (error) {
    console.error("Error in get-config:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

/**
 * Construye el system prompt dinámico basado en la configuración del tenant
 */
function buildSystemPrompt(
  tenant: Record<string, unknown>,
  configs: Record<string, Record<string, unknown>>,
  services: Service[],
  schedules: Schedule[]
): string {
  const profile = configs.profile || {};
  const personality = configs.personality || {};
  const rules = configs.rules || {};

  // Template base del system prompt
  let prompt = `Eres un asistente virtual para ${tenant.name}.

=== PERFIL ===
`;

  // Agregar información del perfil
  if (profile.nombre) prompt += `Nombre: ${profile.nombre}\n`;
  if (profile.descripcion) prompt += `Descripción: ${profile.descripcion}\n`;
  if (profile.ubicacion) prompt += `Ubicación: ${profile.ubicacion}\n`;
  if (profile.edad) prompt += `Edad: ${profile.edad}\n`;

  // Personalidad
  prompt += `\n=== PERSONALIDAD ===\n`;
  if (personality.tono) prompt += `Tono: ${personality.tono}\n`;
  if (personality.estilo) prompt += `Estilo: ${personality.estilo}\n`;
  if (personality.idioma) prompt += `Idioma: ${personality.idioma || tenant.locale || 'es'}\n`;

  // Servicios
  if (services.length > 0) {
    prompt += `\n=== SERVICIOS DISPONIBLES ===\n`;
    for (const service of services) {
      prompt += `- ${service.name}`;
      if (service.price) prompt += `: ${service.price} ${service.currency}`;
      if (service.duration_minutes) prompt += ` (${service.duration_minutes} min)`;
      prompt += `\n`;
      if (service.description) prompt += `  ${service.description}\n`;
    }
  }

  // Horarios
  const availabilityText = buildAvailabilityText(schedules);
  if (availabilityText) {
    prompt += `\n=== HORARIOS DE DISPONIBILIDAD ===\n${availabilityText}\n`;
  }

  // Reglas
  prompt += `\n=== REGLAS DE COMPORTAMIENTO ===\n`;
  if (rules.instrucciones_generales) {
    prompt += `${rules.instrucciones_generales}\n`;
  }
  if (rules.palabras_prohibidas) {
    prompt += `\nPalabras/temas a evitar: ${JSON.stringify(rules.palabras_prohibidas)}\n`;
  }
  if (rules.respuestas_automaticas) {
    prompt += `\nRespuestas automáticas configuradas: Sí\n`;
  }

  // Instrucciones finales
  prompt += `
=== INSTRUCCIONES FINALES ===
- Responde siempre en ${(personality.idioma as string) || (tenant.locale as string) || 'español'}
- Mantén un tono ${(personality.tono as string) || 'profesional y amigable'}
- Si te preguntan algo que no sabes, indica que consultarás y responderás pronto
- Nunca inventes información sobre precios o servicios que no estén listados
`;

  return prompt;
}

/**
 * Construye texto legible de disponibilidad
 */
function buildAvailabilityText(schedules: Schedule[]): string {
  if (schedules.length === 0) return "Horarios no configurados";

  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const lines: string[] = [];

  for (const schedule of schedules) {
    const dayName = days[schedule.day_of_week] || `Día ${schedule.day_of_week}`;
    if (schedule.is_available) {
      lines.push(`${dayName}: ${schedule.start_time} - ${schedule.end_time}`);
    } else {
      lines.push(`${dayName}: No disponible`);
    }
  }

  return lines.join("\n");
}

/**
 * Construye texto formateado de servicios
 */
function buildServicesText(services: Service[]): string {
  if (services.length === 0) return "No hay servicios configurados";

  return services.map(s => {
    let text = `• ${s.name}`;
    if (s.price) text += ` - ${s.price} ${s.currency}`;
    if (s.duration_minutes) text += ` (${s.duration_minutes} min)`;
    if (s.description) text += `\n  ${s.description}`;
    return text;
  }).join("\n");
}
