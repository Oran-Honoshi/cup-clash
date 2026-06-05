import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ── Guests CAN access these (browse/try without account) ──────────────────────
// /dashboard    — guest mode, welcome banner, explore groups CTA
// /predictions  — guest mode, localStorage picks, modal on save
// /leaderboard  — public view
// /standings    — public view
// /bracket      — public view
// /trivia       — public view
// /schedule     — public match schedule
// /join/[code]  — can preview group before signing up
// /groups       — guest sees empty state with auth-gated CTAs

// ── Fully protected (must be signed in) ───────────────────────────────────────
const PROTECTED_PREFIXES = [
  "/admin",
  "/create-group",
  "/profile",
  "/testing",
  "/notifications",
];

const AUTH_ROUTES = ["/signin", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }: { name: string; value: string }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options?: Record<string, unknown> }) =>
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Block access to protected routes for unauthenticated users
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (isProtected && !user) {
    const url = new URL("/signup", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};