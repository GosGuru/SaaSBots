import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * API Endpoint para n8n: Obtener configuración completa del bot
 * 
 * GET /api/n8n/get-config?tenant_id=uuid
 * 
 * Retorna:
 * - System prompt construido dinámicamente desde bot_profiles + prompt_templates
 * - Servicios del tenant (tarifas)
 * - Imágenes disponibles
 * - Horarios de disponibilidad
 * - Números bloqueados
 */

const N8N_API_KEY = process.env.N8N_WEBHOOK_SECRET || "sasbot-n8n-webhook-secret-change-me";

// Tipos
interface BotProfile {
  bot_name: string;
  bot_age: number | null;
  bot_nationality: string | null;
  bot_gender: string;
  physical_description: string | null;
  personality_traits: string | null;
  tone_description: string | null;
  communication_style: string | null;
  role_description: string | null;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  currency: string;
  duration_minutes: number | null;
  short_name: string | null;
}

interface Image {
  id: string;
  url: string;
  caption: string | null;
  alt_text: string | null;
  file_name: string | null;
}

interface Schedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface BlockedNumber {
  phone_number: string;
}

interface PromptTemplate {
  system_prompt_template: string;
  user_prompt_template: string | null;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  business_type: string;
  timezone: string;
  locale: string;
  address: string | null;
  address_instructions: string | null;
  address_image_url: string | null;
  redis_session_prefix: string | null;
  prompt_template_id: string | null;
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
    // Nota: Usamos 'as any' temporalmente hasta regenerar los tipos de Supabase
    const [
      tenantResult,
      profileResult,
      servicesResult,
      imagesResult,
      schedulesResult,
      blockedResult
    ] = await Promise.all([
      // Información del tenant (incluye nuevos campos de dirección)
      (supabase as any)
        .from("tenants")
        .select("id, name, slug, business_type, timezone, locale, address, address_instructions, address_image_url, redis_session_prefix, prompt_template_id")
        .eq("id", tenantId)
        .single(),
      
      // Perfil del bot (nueva tabla)
      (supabase as any)
        .from("bot_profiles")
        .select("*")
        .eq("tenant_id", tenantId)
        .single(),
      
      // Servicios (tarifas) - incluye short_name
      (supabase as any)
        .from("services")
        .select("id, name, description, price, currency, duration_minutes, short_name")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("display_order"),
      
      // Imágenes
      (supabase as any)
        .from("images")
        .select("id, url, caption, alt_text, file_name")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("display_order"),
      
      // Horarios
      (supabase as any)
        .from("availability_schedules")
        .select("day_of_week, start_time, end_time, is_available")
        .eq("tenant_id", tenantId)
        .order("day_of_week"),
      
      // Números bloqueados
      (supabase as any)
        .from("blocked_numbers")
        .select("phone_number")
        .eq("tenant_id", tenantId)
    ]);

    if (tenantResult.error || !tenantResult.data) {
      return NextResponse.json(
        { error: "Not Found", message: "Tenant not found" },
        { status: 404 }
      );
    }

    const tenant = tenantResult.data as Tenant;
    const profile = (profileResult.data || null) as BotProfile | null;
    const services = (servicesResult.data || []) as Service[];
    const images = (imagesResult.data || []) as Image[];
    const schedules = (schedulesResult.data || []) as Schedule[];
    const blockedNumbers = (blockedResult.data || []) as BlockedNumber[];

    // Obtener template de prompt si existe
    let promptTemplate: PromptTemplate | null = null;
    if (tenant.prompt_template_id) {
      const { data } = await (supabase as any)
        .from("prompt_templates")
        .select("system_prompt_template, user_prompt_template")
        .eq("id", tenant.prompt_template_id)
        .single();
      promptTemplate = data as PromptTemplate | null;
    }

    // Si no hay template específico, buscar el default para el business_type
    if (!promptTemplate) {
      const { data } = await (supabase as any)
        .from("prompt_templates")
        .select("system_prompt_template, user_prompt_template")
        .eq("business_type", tenant.business_type)
        .eq("is_default", true)
        .eq("is_active", true)
        .single();
      promptTemplate = data as PromptTemplate | null;
    }

    // Construir el system prompt dinámico
    const systemPrompt = buildSystemPrompt(tenant, profile, services, promptTemplate);

    // Construir lista de servicios/tarifas formateada
    const servicesText = buildServicesText(services);

    // Construir lista de números bloqueados
    const blockedList = blockedNumbers.map(b => b.phone_number);

    return NextResponse.json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        business_type: tenant.business_type,
        timezone: tenant.timezone,
        locale: tenant.locale,
        address: tenant.address,
        address_instructions: tenant.address_instructions,
        address_image_url: tenant.address_image_url
      },
      profile: profile ? {
        bot_name: profile.bot_name,
        bot_age: profile.bot_age,
        nationality: profile.bot_nationality,
        gender: profile.bot_gender,
        physical_description: profile.physical_description,
        personality: profile.personality_traits,
        tone: profile.tone_description,
        style: profile.communication_style,
        role: profile.role_description
      } : null,
      system_prompt: systemPrompt,
      services: services,
      services_text: servicesText,
      images: images,
      availability: schedules,
      blocked_numbers: blockedList,
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
 * Construye el system prompt dinámico
 * Si hay un template, reemplaza los placeholders
 * Si no, construye uno básico
 */
function buildSystemPrompt(
  tenant: Tenant,
  profile: BotProfile | null,
  services: Service[],
  template: PromptTemplate | null
): string {
  
  // Si hay template, reemplazar placeholders
  if (template?.system_prompt_template) {
    let prompt = template.system_prompt_template;
    
    // Reemplazar placeholders del perfil
    if (profile) {
      prompt = prompt.replace(/\{\{bot_name\}\}/g, profile.bot_name || 'Asistente');
      prompt = prompt.replace(/\{\{bot_age\}\}/g, String(profile.bot_age || ''));
      prompt = prompt.replace(/\{\{nationality\}\}/g, profile.bot_nationality || '');
      prompt = prompt.replace(/\{\{personality_traits\}\}/g, profile.personality_traits || '');
      prompt = prompt.replace(/\{\{role_description\}\}/g, profile.role_description || '');
      prompt = prompt.replace(/\{\{physical_description\}\}/g, profile.physical_description || '');
      prompt = prompt.replace(/\{\{tone_description\}\}/g, profile.tone_description || '');
    }
    
    // Reemplazar placeholders del tenant
    prompt = prompt.replace(/\{\{address\}\}/g, tenant.address || '');
    prompt = prompt.replace(/\{\{address_instructions\}\}/g, tenant.address_instructions || '');
    
    // Reemplazar servicios/tarifas
    const servicesText = buildServicesText(services);
    prompt = prompt.replace(/\{\{services_list\}\}/g, servicesText);
    
    return prompt;
  }
  
  // Si no hay template, construir uno básico
  return buildBasicPrompt(tenant, profile, services);
}

/**
 * Construye un prompt básico si no hay template
 */
function buildBasicPrompt(
  tenant: Tenant,
  profile: BotProfile | null,
  services: Service[]
): string {
  const botName = profile?.bot_name || 'Asistente';
  const personality = profile?.personality_traits || 'amigable y profesional';
  
  let prompt = `Eres ${botName}, un asistente virtual para ${tenant.name}. Eres ${personality}.

`;

  if (profile?.role_description) {
    prompt += `${profile.role_description}\n\n`;
  }

  // Servicios
  if (services.length > 0) {
    prompt += `TARIFAS\n`;
    for (const service of services) {
      const duration = service.short_name || 
        (service.duration_minutes ? `${service.duration_minutes}min` : '');
      prompt += `${duration} = ${service.price} ${service.currency}.\n`;
    }
    prompt += `\n`;
  }

  // Dirección
  if (tenant.address) {
    prompt += `DIRECCIÓN\nLa dirección es: "${tenant.address}"\n`;
    if (tenant.address_instructions) {
      prompt += `Instrucciones: "${tenant.address_instructions}"\n`;
    }
    prompt += `\n`;
  }

  prompt += `INSTRUCCIONES
- Responde siempre en ${tenant.locale === 'es' ? 'español' : tenant.locale}
- Mantén un tono ${profile?.tone_description || 'profesional y amigable'}
- Si te preguntan algo que no sabes, indica que consultarás
- Nunca inventes información sobre precios o servicios
`;

  return prompt;
}

/**
 * Construye texto formateado de servicios/tarifas
 */
function buildServicesText(services: Service[]): string {
  if (services.length === 0) return "No hay tarifas configuradas";

  return services.map(s => {
    const duration = s.short_name || 
      (s.duration_minutes ? `${s.duration_minutes}min` : s.name);
    return `${duration} = ${s.price} ${s.currency || 'euros'}.`;
  }).join("\n");
}
