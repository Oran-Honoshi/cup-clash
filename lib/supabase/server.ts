import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";

// Cookie-scoped, RLS-respecting client for the current signed-in user. Safe
// from Next.js Data Cache staleness: calling cookies() before any fetch
// flips Next's per-request fetch default from force-cache to no-store.
// Need to bypass RLS instead? Use sbAdmin() from ./admin.ts — never
// hand-roll a new createClient() from "@supabase/supabase-js" in a
// route/server component/service; that fetch has no such default and will
// silently cache stale REST responses across deploys.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot write cookies — middleware handles token refresh
          }
        },
      },
    }
  );
}
