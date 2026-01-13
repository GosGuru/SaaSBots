import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * API Endpoint para n8n: Identificar Tenant por número de WhatsApp
 * 
 * GET /api/n8n/identify-tenant?whatsapp_number=+5491234567890
 * 
 * Headers requeridos:
 * - x-api-key: API key secreta para autenticar n8n
 */

// API Key para autenticar requests de n8n (debe estar en .env)
const N8N_API_KEY = process.env.N8N_API_KEY || "sasbot-n8n-secret-key";

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

    // Obtener número de WhatsApp del query
    const searchParams = request.nextUrl.searchParams;
    const whatsappNumber = searchParams.get("whatsapp_number");

    if (!whatsappNumber) {
      return NextResponse.json(
        { error: "Bad Request", message: "whatsapp_number is required" },
        { status: 400 }
      );
    }

    // Normalizar número (remover espacios, asegurar formato)
    const normalizedNumber = whatsappNumber
      .replace(/\s+/g, "")
      .replace(/[^\d+]/g, "");

    const supabase = createServiceClient();

    // Buscar tenant por número de WhatsApp
    const { data: tenant, error } = await supabase
      .from("tenants")
      .select(`
        id,
        name,
        slug,
        business_type,
        whatsapp_number,
        whatsapp_phone_number_id,
        n8n_workflow_id,
        n8n_webhook_url,
        n8n_workflow_active,
        redis_session_prefix,
        status,
        subscription_plan,
        timezone,
        locale
      `)
      .eq("whatsapp_number", normalizedNumber)
      .is("deleted_at", null)
      .single();

    if (error || !tenant) {
      // Intentar buscar sin el + inicial
      const numberWithoutPlus = normalizedNumber.replace(/^\+/, "");
      const { data: tenant2, error: error2 } = await supabase
        .from("tenants")
        .select(`
          id,
          name,
          slug,
          business_type,
          whatsapp_number,
          whatsapp_phone_number_id,
          n8n_workflow_id,
          n8n_webhook_url,
          n8n_workflow_active,
          redis_session_prefix,
          status,
          subscription_plan,
          timezone,
          locale
        `)
        .or(`whatsapp_number.eq.${normalizedNumber},whatsapp_number.eq.+${numberWithoutPlus},whatsapp_number.eq.${numberWithoutPlus}`)
        .is("deleted_at", null)
        .single();

      if (error2 || !tenant2) {
        return NextResponse.json(
          { 
            error: "Not Found", 
            message: "No tenant found for this WhatsApp number",
            whatsapp_number: normalizedNumber
          },
          { status: 404 }
        );
      }

      // Verificar que el tenant esté activo
      if (tenant2.status === "suspended" || tenant2.status === "cancelled") {
        return NextResponse.json(
          { 
            error: "Forbidden", 
            message: "Tenant is not active",
            status: tenant2.status
          },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        tenant_id: tenant2.id,
        tenant_name: tenant2.name,
        tenant_slug: tenant2.slug,
        business_type: tenant2.business_type,
        redis_prefix: tenant2.redis_session_prefix || `tenant_${tenant2.slug}`,
        is_active: tenant2.status === "active" || tenant2.status === "trial",
        status: tenant2.status,
        subscription_plan: tenant2.subscription_plan,
        timezone: tenant2.timezone,
        locale: tenant2.locale,
        n8n_workflow_active: tenant2.n8n_workflow_active
      });
    }

    // Verificar que el tenant esté activo
    if (tenant.status === "suspended" || tenant.status === "cancelled") {
      return NextResponse.json(
        { 
          error: "Forbidden", 
          message: "Tenant is not active",
          status: tenant.status
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      tenant_id: tenant.id,
      tenant_name: tenant.name,
      tenant_slug: tenant.slug,
      business_type: tenant.business_type,
      redis_prefix: tenant.redis_session_prefix || `tenant_${tenant.slug}`,
      is_active: tenant.status === "active" || tenant.status === "trial",
      status: tenant.status,
      subscription_plan: tenant.subscription_plan,
      timezone: tenant.timezone,
      locale: tenant.locale,
      n8n_workflow_active: tenant.n8n_workflow_active
    });

  } catch (error) {
    console.error("Error in identify-tenant:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
