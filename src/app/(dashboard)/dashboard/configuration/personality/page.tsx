import { redirect } from "next/navigation";

import { getUserWithTenant } from "@/lib/supabase/server";
import { PersonalityForm } from "@/components/forms/personality-form";
import type { PersonalityFormData } from "@/lib/validations";

export const metadata = {
  title: "Personalidad del Bot | SASbot",
};

export default async function PersonalityPage() {
  const user = await getUserWithTenant();
  if (!user) redirect("/login");

  // TODO: Fetch existing personality configuration
  const initialData: Partial<PersonalityFormData> = {
    tone: "amigable",
    language: "es",
    emoji_style: "moderado",
  };

  async function handleSubmit(data: PersonalityFormData) {
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
        category: "personality" as const,
        config_key: "personality",
        config_value: data as unknown as Record<string, unknown>,
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
        <h1 className="text-2xl font-bold tracking-tight">Personalidad</h1>
        <p className="text-muted-foreground">
          Define el tono y estilo de comunicación de tu bot
        </p>
      </div>

      <PersonalityForm initialData={initialData} onSubmit={handleSubmit} />
    </div>
  );
}
