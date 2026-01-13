import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

type Tenant = Database["public"]["Tables"]["tenants"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];

export interface UserWithTenant {
  user: Awaited<ReturnType<Awaited<ReturnType<typeof createServerClient<Database>>>["auth"]["getUser"]>>["data"]["user"];
  profile: User | null;
  tenant: Tenant | null;
}

/**
 * Cliente de Supabase para uso en el servidor (Server Components, API Routes)
 * Maneja las cookies automáticamente para la sesión del usuario
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // El método `set` se llama desde un Server Component
            // Esto puede ser ignorado si hay middleware para refrescar cookies
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // El método `remove` se llama desde un Server Component
            // Esto puede ser ignorado si hay middleware para refrescar cookies
          }
        },
      },
    }
  );
}

/**
 * Obtiene el usuario actual desde el servidor
 */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Obtiene la sesión actual desde el servidor
 */
export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    return null;
  }

  return session;
}

/**
 * Obtiene el usuario con su perfil y tenant
 */
export async function getUserWithTenant(): Promise<UserWithTenant | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  // Obtener el perfil del usuario
  const { data: profileData, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profileData) {
    return { user, profile: null, tenant: null };
  }

  const profile: User = profileData;

  // Si tiene tenant_id, obtener el tenant
  let tenant: Tenant | null = null;
  if (profile.tenant_id) {
    const { data: tenantData } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", profile.tenant_id)
      .single();
    tenant = tenantData;
  }

  return {
    user,
    profile,
    tenant,
  };
}
