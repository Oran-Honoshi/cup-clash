import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code  = requestUrl.searchParams.get("code");
  const next  = requestUrl.searchParams.get("next") ?? "/dashboard";
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description") ?? "";

  // OAuth provider returned an error (e.g. user denied, or email conflict)
  if (error) {
    const desc = errorDescription.toLowerCase();
    if (desc.includes("already") || desc.includes("exists") || desc.includes("registered")) {
      return NextResponse.redirect(new URL("/signin?error=google_conflict", requestUrl.origin));
    }
    return NextResponse.redirect(new URL(`/signin?error=oauth_failed`, requestUrl.origin));
  }

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: object) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: object) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );
    const result = await supabase.auth.exchangeCodeForSession(code);

    // Code exchange failed — check if it's an email-conflict error
    if (result.error) {
      const msg = result.error.message?.toLowerCase() ?? "";
      if (msg.includes("already") || msg.includes("exists") || msg.includes("registered")) {
        return NextResponse.redirect(new URL("/signin?error=google_conflict", requestUrl.origin));
      }
    }
  }

  // Always redirect to `next` — preserves join URL after email confirmation
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
