import { redirect } from "next/navigation";

import { getUserWithTenant } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { ProfileForm } from "@/components/forms/profile-form";
import type { ProfileFormData } from "@/lib/validations";

export const metadata = {
  title: "Perfil del Bot | SASbot",
};

export default async function ProfilePage() {
  const user = await getUserWithTenant();
  if (!user) redirect("/login");

  const tenantId = user.profile?.tenant_id;
  if (!tenantId) redirect("/onboarding");

  const supabase = createServiceClient();

  // Cargar datos existentes del bot_profiles y tenant
  const [{ data: botProfile }, { data: tenant }] = await Promise.all([
    supabase
      .from("bot_profiles")
      .select("*")
      .eq("tenant_id", tenantId)
      .single(),
    supabase
      .from("tenants")
      .select("address, address_instructions, business_type")
      .eq("id", tenantId)
      .single(),
  ]);

  const initialData: Partial<ProfileFormData> = {
    bot_name: (botProfile as any)?.bot_name || "",
    bot_age: (botProfile as any)?.bot_age || undefined,
    bot_nationality: (botProfile as any)?.bot_nationality || "",
    bot_gender: (botProfile as any)?.bot_gender || "female",
    physical_description: (botProfile as any)?.physical_description || "",
    personality_traits: (botProfile as any)?.personality_traits || "",
    tone_description: (botProfile as any)?.tone_description || "",
    communication_style: (botProfile as any)?.communication_style || "informal",
    role_description: (botProfile as any)?.role_description || "",
    address: (tenant as any)?.address || "",
    address_instructions: (tenant as any)?.address_instructions || "",
  };

  async function handleSubmit(data: ProfileFormData) {
    "use server";

    const { createServiceClient } = await import("@/lib/supabase/service");
    const supabase = createServiceClient();

    const currentUser = await getUserWithTenant();
    if (!currentUser?.profile?.tenant_id) {
      throw new Error("No tenant found");
    }

    const tid = currentUser.profile.tenant_id;

    // Upsert bot_profiles
    const { error: profileError } = await (supabase as any)
      .from("bot_profiles")
      .upsert(
        {
          tenant_id: tid,
          bot_name: data.bot_name,
          bot_age: data.bot_age || null,
          bot_nationality: data.bot_nationality || null,
          bot_gender: data.bot_gender,
          physical_description: data.physical_description || null,
          personality_traits: data.personality_traits || null,
          tone_description: data.tone_description || null,
          communication_style: data.communication_style,
          role_description: data.role_description || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "tenant_id" }
      );

    if (profileError) {
      throw new Error(profileError.message);
    }

    // Actualizar dirección en tenant
    const { error: tenantError } = await supabase
      .from("tenants")
      .update({
        address: data.address || null,
        address_instructions: data.address_instructions || null,
      })
      .eq("id", tid);

    if (tenantError) {
      throw new Error(tenantError.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Perfil del Bot</h1>
        <p className="text-muted-foreground">
          Configura la identidad y personalidad de tu bot
        </p>
      </div>

      <ProfileForm 
        initialData={initialData} 
        onSubmit={handleSubmit}
        businessType={(tenant as any)?.business_type}
      />
    </div>
  );
}
