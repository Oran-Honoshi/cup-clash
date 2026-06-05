import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code  = requestUrl.searchParams.get("code");
  const next  = requestUrl.searchParams.get("next") ?? "/dashboard";
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description") ?? "";

  console.log("[callback] URL:", request.url);
  console.log("[callback] code:", !!code, "next:", next);

  // OAuth provider returned an error (e.g. user denied, or email conflict)
  if (error) {
    const desc = errorDescription.toLowerCase();
    if (desc.includes("already") || desc.includes("exists") || desc.includes("registered")) {
      return NextResponse.redirect(new URL("/signin?error=google_conflict", requestUrl.origin));
    }
    return NextResponse.redirect(new URL("/signin?error=oauth_failed", requestUrl.origin));
  }

  // Build the response first so we can write session cookies onto it before returning.
  // Writing to cookieStore (the request store) does NOT forward cookies to a separately
  // constructed NextResponse — this was causing the "guest" dashboard after OAuth.
  const response = NextResponse.redirect(new URL(next, requestUrl.origin));

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: object) {
            response.cookies.set({ name, value, ...options } as Parameters<typeof response.cookies.set>[0]);
          },
          remove(name: string, options: object) {
            response.cookies.set({ name, value: "", ...options } as Parameters<typeof response.cookies.set>[0]);
          },
        },
      }
    );

    const result = await supabase.auth.exchangeCodeForSession(code);
    console.log("[callback] exchange result:", result.error?.message ?? "ok");
    console.log("[callback] redirecting to:", next);

    // Code exchange failed — check if it's an email-conflict error
    if (result.error) {
      const msg = result.error.message?.toLowerCase() ?? "";
      if (msg.includes("already") || msg.includes("exists") || msg.includes("registered")) {
        return NextResponse.redirect(new URL("/signin?error=google_conflict", requestUrl.origin));
      }
    }
  }

  return response;
}
