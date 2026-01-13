import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy function for Next.js 16+
 * Replaces the deprecated middleware.ts convention
 * 
 * This runs on every route and handles:
 * - Session refresh for Supabase auth
 * - Route protection (redirect unauthenticated users)
 * - Auth route redirection (redirect authenticated users away from login)
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if expired - this is an optimistic check
  // The actual session validation should happen in the DAL (Data Access Layer)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public routes (no authentication required)
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/verify-email",
    "/reset-password",
    "/pricing",
    "/about",
    "/privacy",
    "/terms",
    "/contact",
  ];
  
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/api/webhooks")
  );

  // Auth routes (login, register, etc.)
  const authRoutes = ["/login", "/register", "/forgot-password"];
  const isAuthRoute = authRoutes.includes(pathname);

  // Dashboard routes (require authentication)
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // Redirect authenticated users away from auth routes to dashboard
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users from protected routes to login
  if (!user && isDashboardRoute) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

// Export the proxy function as default as well for compatibility
export default proxy;

// Routes Proxy should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - handled separately
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public folder assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
