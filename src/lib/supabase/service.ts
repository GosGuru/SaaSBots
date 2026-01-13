import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Cliente de Supabase con Service Role Key
 * SOLO para uso en el servidor (API Routes, Edge Functions)
 * 
 * ⚠️ ADVERTENCIA: Este cliente bypasea RLS y tiene acceso total a la base de datos
 * Nunca exponer en el cliente ni en código que se ejecute en el navegador
 */
export function createServiceClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined");
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Singleton para reutilizar la conexión
let serviceClient: ReturnType<typeof createServiceClient> | null = null;

export function getServiceClient() {
  if (!serviceClient) {
    serviceClient = createServiceClient();
  }
  return serviceClient;
}
