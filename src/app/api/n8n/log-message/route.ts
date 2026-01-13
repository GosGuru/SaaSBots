import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * API Endpoint para n8n: Guardar mensaje en historial
 * 
 * POST /api/n8n/log-message
 * 
 * Body:
 * {
 *   "tenant_id": "uuid",
 *   "phone_number": "+5491234567890",
 *   "contact_name": "Juan",
 *   "message_type": "text|image|audio|video",
 *   "content": "Hola...",
 *   "direction": "inbound|outbound",
 *   "whatsapp_message_id": "wamid.xxx"
 * }
 */

const N8N_API_KEY = process.env.N8N_API_KEY || "sasbot-n8n-secret-key";

export async function POST(request: NextRequest) {
  try {
    // Validar API Key
    const apiKey = request.headers.get("x-api-key");
    if (apiKey !== N8N_API_KEY) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid API key" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      tenant_id,
      phone_number,
      contact_name,
      message_type = "text",
      content,
      direction = "inbound",
      whatsapp_message_id,
      metadata
    } = body;

    if (!tenant_id || !phone_number) {
      return NextResponse.json(
        { error: "Bad Request", message: "tenant_id and phone_number are required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Buscar o crear conversación
    let { data: conversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("tenant_id", tenant_id)
      .eq("phone_number", phone_number)
      .single();

    if (!conversation) {
      // Crear nueva conversación
      const { data: newConversation, error: convError } = await supabase
        .from("conversations")
        .insert({
          tenant_id,
          phone_number,
          contact_name: contact_name || null,
          status: "active",
          started_at: new Date().toISOString()
        })
        .select("id")
        .single();

      if (convError) {
        console.error("Error creating conversation:", convError);
        return NextResponse.json(
          { error: "Database Error", message: "Failed to create conversation" },
          { status: 500 }
        );
      }

      conversation = newConversation;
    } else if (contact_name) {
      // Actualizar nombre del contacto si se proporciona
      await supabase
        .from("conversations")
        .update({ 
          contact_name,
          last_message_at: new Date().toISOString()
        })
        .eq("id", conversation.id);
    }

    // Insertar mensaje
    const { data: message, error: msgError } = await supabase
      .from("messages")
      .insert({
        tenant_id,
        conversation_id: conversation.id,
        direction,
        message_type,
        content: content || "",
        whatsapp_message_id: whatsapp_message_id || null,
        metadata: metadata || null,
        sent_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (msgError) {
      console.error("Error creating message:", msgError);
      return NextResponse.json(
        { error: "Database Error", message: "Failed to log message" },
        { status: 500 }
      );
    }

    // Actualizar estadísticas de la conversación
    await supabase
      .from("conversations")
      .update({
        last_message_at: new Date().toISOString()
      })
      .eq("id", conversation.id);

    return NextResponse.json({
      success: true,
      conversation_id: conversation.id,
      message_id: message.id
    });

  } catch (error) {
    console.error("Error in log-message:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
