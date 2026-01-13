import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirigir al dashboard o a la página especificada
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // Si hay un error, redirigir a login con mensaje de error
  return NextResponse.redirect(
    new URL("/login?error=auth_callback_error", requestUrl.origin)
  );
}
