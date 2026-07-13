import { createClient } from "@supabase/supabase-js";

// DO NOT copy-paste this file's createClient(...) call into a route/service
// instead of importing sbAdmin() from here — that has caused repeated
// production incidents (silently-stale Data Cache with no per-user fix).
// Need an anon-key equivalent? Use sbAnon() from ./anon.ts, not a new local
// client. See ./anon.ts for the RLS-respecting counterpart.
//
// Service-role Supabase client for server-side reads (bypasses RLS). Passes
// an explicit `cache: "no-store"` fetch so Next.js's persistent Data Cache
// never serves a stale snapshot of a Supabase REST response — that cache
// survives across deploys and isn't cleared by `dynamic = "force-dynamic"`
// alone, which only stops the route's own response from being cached.
export function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    }
  );
}
