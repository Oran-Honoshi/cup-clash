import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ── Guests CAN access these (browse/try without account) ──────────────────────
// /dashboard    — guest mode, welcome banner, explore groups CTA
// /predictions  — guest mode, localStorage picks, modal on save
// /leaderboard  — public view
// /standings    — genuinely public: competition picker + WC26 group tables
//                 (app shell chrome, same guest-mode pattern as /dashboard)
// /scores       — genuinely public: competition picker + WC26 match list,
//                 "coming soon" for the other 6 (app shell chrome)
// /bracket      — public view
// /trivia       — public view
// /schedule     — public match schedule
// /join/[code]  — can preview group before signing up
// /groups       — guest sees empty state with auth-gated CTAs
//
// ── Fully public, no app shell (marketing/aggregator pages) ───────────────────
// /news         — aggregated news feed, lightweight public header
// /leagues      — "follow your leagues" picker, lightweight public header

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

  // Treat soft-deleted users as logged out — check before any other logic
  let activeUser = user;
  if (user) {
    const { data: softDeletedCheck } = await supabase
      .from("profiles")
      .select("is_deleted")
      .eq("id", user.id)
      .single();
    if ((softDeletedCheck as { is_deleted: boolean } | null)?.is_deleted) {
      activeUser = null;
      if (!pathname.startsWith("/signin")) {
        const url = new URL("/signin", request.url);
        url.searchParams.set("error", "account_deactivated");
        return NextResponse.redirect(url);
      }
    }
  }

  // Block access to protected routes for unauthenticated users
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (isProtected && !activeUser) {
    const url = new URL("/signup", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));
  if (isAuthRoute && activeUser) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};