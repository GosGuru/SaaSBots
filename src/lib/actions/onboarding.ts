"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { z } from "zod";
import type { Database } from "@/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

type TypedSupabase = SupabaseClient<Database>;
type Tenant = Database["public"]["Tables"]["tenants"]["Row"];
type TenantInsert = Database["public"]["Tables"]["tenants"]["Insert"];
type UserRow = Database["public"]["Tables"]["users"]["Row"];
type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

const onboardingSchema = z.object({
  company_name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  industry: z.string().optional(),
});

export type OnboardingState = {
  errors?: {
    company_name?: string[];
    industry?: string[];
  };
  message?: string;
  success?: boolean;
} | undefined;

/**
 * Complete the onboarding process by creating a tenant for the user
 */
export async function completeOnboarding(
  prevState: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Validate form data
  const validatedFields = onboardingSchema.safeParse({
    company_name: formData.get("company_name"),
    industry: formData.get("industry"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { company_name, industry } = validatedFields.data;

  // Generate slug from company name
  const slug = company_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 50);

  // Check if user already has a profile
  const { data: existingProfileData } = await supabase
    .from("users")
    .select("id, tenant_id")
    .eq("id", user.id)
    .single();

  const existingProfile = existingProfileData as Pick<UserRow, "id" | "tenant_id"> | null;

  // If user already has a tenant, just redirect
  if (existingProfile?.tenant_id) {
    redirect("/dashboard");
  }

  // Use service client to bypass RLS for onboarding operations
  const serviceClient = createServiceClient();

  // Create the tenant using service client (bypasses RLS)
  const { data: tenantData, error: tenantError } = await serviceClient
    .from("tenants")
    .insert({
      name: company_name,
      slug: `${slug}-${Date.now().toString(36)}`,
      business_type: industry || "other",
      status: "trial",
      subscription_plan: "free",
    })
    .select()
    .single();

  if (tenantError || !tenantData) {
    console.error("Error creating tenant:", tenantError);
    return {
      message: "Error al crear la empresa. Por favor intenta de nuevo.",
    };
  }

  const tenant = tenantData as Tenant;

  // Check if user profile exists
  if (existingProfile) {
    // Update existing profile with tenant using service client
    const { error: updateError } = await serviceClient
      .from("users")
      .update({
        tenant_id: tenant.id,
        role: "owner",
        onboarding_completed: true,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating user:", updateError);
      // Rollback tenant creation
      await serviceClient.from("tenants").delete().eq("id", tenant.id);
      return {
        message: "Error al vincular la empresa. Por favor intenta de nuevo.",
      };
    }
  } else {
    // Create user profile with tenant using service client
    const { error: insertError } = await serviceClient.from("users").insert({
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario",
      tenant_id: tenant.id,
      role: "owner",
      onboarding_completed: true,
    });

    if (insertError) {
      console.error("Error creating user profile:", insertError);
      // Rollback tenant creation
      await serviceClient.from("tenants").delete().eq("id", tenant.id);
      return {
        message: "Error al crear el perfil. Por favor intenta de nuevo.",
      };
    }
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
