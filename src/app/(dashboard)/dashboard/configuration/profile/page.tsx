import { redirect } from "next/navigation";

import { getUserWithTenant } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/forms/profile-form";
import type { ProfileFormData } from "@/lib/validations";
import type { Json } from "@/types/database.types";

export const metadata = {
  title: "Perfil del Bot | SASbot",
};

export default async function ProfilePage() {
  const user = await getUserWithTenant();
  if (!user) redirect("/login");

  // TODO: Fetch existing bot configuration
  const initialData: Partial<ProfileFormData> = {
    bot_name: "",
    description: "",
  };

  async function handleSubmit(data: ProfileFormData) {
    "use server";
    
    const { createServiceClient } = await import("@/lib/supabase/service");
    const supabase = createServiceClient();
    
    const currentUser = await getUserWithTenant();
    if (!currentUser?.profile?.tenant_id) {
      throw new Error("No tenant found");
    }

    const { error } = await supabase
      .from("bot_configurations")
      .upsert({
        tenant_id: currentUser.profile.tenant_id,
        category: "profile" as const,
        config_key: "profile",
        config_value: data as unknown as Json,
      }, {
        onConflict: "tenant_id,config_key",
      });

    if (error) {
      throw new Error(error.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Perfil del Bot</h1>
        <p className="text-muted-foreground">
          Configura la información básica de tu bot
        </p>
      </div>

      <ProfileForm initialData={initialData} onSubmit={handleSubmit} />
    </div>
  );
}
