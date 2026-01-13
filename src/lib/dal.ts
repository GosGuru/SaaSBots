import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import type { Database } from "@/types/database.types";

type User = Database["public"]["Tables"]["users"]["Row"];
type Tenant = Database["public"]["Tables"]["tenants"]["Row"];

export interface RequiredUserData {
  user: NonNullable<Awaited<ReturnType<Awaited<ReturnType<typeof createServerClient<Database>>>["auth"]["getUser"]>>["data"]["user"]>;
  profile: User;
  tenant: Tenant;
}

export interface UserWithTenant extends User {
  tenant: Tenant | null;
}

/**
 * Data Access Layer (DAL) for authentication
 * 
 * This module provides secure, cached functions for verifying sessions
 * and fetching user data. It follows Next.js 16 best practices:
 * 
 * 1. Use server-only to prevent client-side imports
 * 2. Use React cache() to deduplicate requests within a render pass
 * 3. Perform auth checks close to data source, not just in proxy
 * 4. Return minimal user data (DTO pattern)
 */

/**
 * Creates a Supabase client for server-side operations
 * Uses cookies for session management
 */
async function createClient() {
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
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}

/**
 * Verifies the current session and returns session info
 * Redirects to login if no valid session exists
 * 
 * Uses React cache() to deduplicate calls within a single render pass
 */
export const verifySession = cache(async () => {
  const supabase = await createClient();
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return {
    isAuth: true,
    userId: user.id,
    email: user.email,
  };
});

/**
 * Gets the current user with their tenant information
 * Returns null if not authenticated (does not redirect)
 * 
 * Uses React cache() to deduplicate calls within a single render pass
 */
export const getUser = cache(async (): Promise<UserWithTenant | null> => {
  const supabase = await createClient();

  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return null;
  }

  // Fetch user profile with tenant data
  const { data: user, error: userError } = await supabase
    .from("users")
    .select(`
      id,
      email,
      full_name,
      avatar_url,
      role,
      tenant_id,
      is_active,
      created_at,
      updated_at,
      tenant:tenants (
        id,
        name,
        slug,
        industry,
        subscription_status,
        subscription_tier,
        settings,
        n8n_workflow_id,
        whatsapp_phone_number,
        created_at,
        updated_at
      )
    `)
    .eq("id", authUser.id)
    .single();

  if (userError || !user) {
    return null;
  }

  return user as UserWithTenant;
});

/**
 * Gets the current user or redirects to login
 * Combines getUser with redirect behavior
 * 
 * Returns user data in format { user, profile, tenant }
 */
export const requireUser = cache(async (): Promise<RequiredUserData> => {
  const supabase = await createClient();

  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profileData, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  // If no profile exists, user is new - redirect to onboarding
  if (profileError || !profileData) {
    redirect("/onboarding");
  }

  const profile = profileData as User;

  // If user has no tenant, redirect to onboarding
  if (!profile.tenant_id) {
    redirect("/onboarding");
  }

  // Fetch tenant data
  const { data: tenantData, error: tenantError } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", profile.tenant_id)
    .single();

  if (tenantError || !tenantData) {
    redirect("/onboarding");
  }

  const tenant = tenantData as Tenant;

  return {
    user: authUser,
    profile,
    tenant,
  };
});

/**
 * Checks if the current user has a specific role
 */
export const checkRole = cache(async (requiredRole: "owner" | "admin" | "viewer") => {
  const { profile } = await requireUser();
  
  const roleHierarchy: Record<string, number> = {
    owner: 3,
    admin: 2,
    viewer: 1,
  };

  const userRole = profile?.role || "viewer";
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
});

/**
 * Gets the current user's tenant ID
 * Throws if user has no tenant
 */
export const requireTenantId = cache(async (): Promise<string> => {
  const { profile } = await requireUser();
  
  if (!profile?.tenant_id) {
    redirect("/onboarding");
  }

  return profile.tenant_id;
});

/**
 * Checks if user has completed onboarding
 */
export const checkOnboarding = cache(async () => {
  const user = await getUser();
  
  if (!user) {
    return { completed: false, reason: "not_authenticated" } as const;
  }

  if (!user.tenant_id) {
    return { completed: false, reason: "no_tenant" } as const;
  }

  if (!user.tenant?.n8n_workflow_id) {
    return { completed: false, reason: "no_workflow" } as const;
  }

  return { completed: true, user } as const;
});
