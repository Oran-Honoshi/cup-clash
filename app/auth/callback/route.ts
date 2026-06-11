import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code  = requestUrl.searchParams.get("code");
  const type  = requestUrl.searchParams.get("type");
  const next  = requestUrl.searchParams.get("next") ?? "/dashboard";
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description") ?? "";

  // OAuth provider returned an error — only treat as OAuth failure if this
  // isn't a recovery flow (password reset errors have their own path)
  if (error && type !== "recovery") {
    const desc = errorDescription.toLowerCase();
    if (desc.includes("already") || desc.includes("exists") || desc.includes("registered")) {
      return NextResponse.redirect(new URL("/signin?error=google_conflict", requestUrl.origin));
    }
    return NextResponse.redirect(new URL("/signin?error=oauth_failed", requestUrl.origin));
  }

  // Password reset: exchange code then send to update-password page
  const destination = type === "recovery" ? "/update-password" : next;

  // Build the response first — @supabase/ssr v0.3+ uses setAll which writes
  // cookies directly onto this response object before it is returned.
  const response = NextResponse.redirect(new URL(destination, requestUrl.origin));

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const result = await supabase.auth.exchangeCodeForSession(code);

    if (result.error) {
      const msg = result.error.message?.toLowerCase() ?? "";
      if (msg.includes("already") || msg.includes("exists") || msg.includes("registered")) {
        return NextResponse.redirect(new URL("/signin?error=google_conflict", requestUrl.origin));
      }
    }

    // Block soft-deleted users from completing sign-in
    const { data: { user: cbUser } } = await supabase.auth.getUser();
    if (cbUser) {
      const { data: profileCheck } = await supabase
        .from("profiles")
        .select("is_deleted")
        .eq("id", cbUser.id)
        .single();
      if ((profileCheck as { is_deleted?: boolean } | null)?.is_deleted) {
        await supabase.auth.signOut();
        return NextResponse.redirect(
          new URL("/signin?error=account_deactivated", requestUrl.origin)
        );
      }
    }
  }

  return response;
}
