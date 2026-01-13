import { createClient } from "@/lib/supabase/server";
import { createSession } from "@/lib/session";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");
  const next = searchParams.get("next") ?? "/dashboard";

  // Handle errors from Supabase
  if (error) {
    console.error("Auth callback error:", error, error_description);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error_description || error)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Exchange code error:", exchangeError);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent("Error al confirmar email. Intenta nuevamente.")}`
      );
    }

    if (data.user) {
      // Create custom session
      await createSession(data.user.id);
      
      // Redirect to email confirmed success page first, then to dashboard
      return NextResponse.redirect(`${origin}/email-confirmed?next=${encodeURIComponent(next)}`);
    }
  }

  // No code provided, redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
