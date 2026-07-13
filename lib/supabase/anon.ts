import { createClient } from "@supabase/supabase-js";

// Anon-key Supabase client for server-side reads/writes that intentionally
// do NOT bypass RLS (contrast with sbAdmin() in ./admin.ts). Same
// `cache: "no-store"` override as sbAdmin() — without it, Next.js's
// persistent Data Cache can silently serve a stale snapshot of a Supabase
// REST response indefinitely, surviving across deploys and unaffected by
// `dynamic = "force-dynamic"` (which only stops the route's own response
// from being cached, not fetches made inside it).
export function sbAnon() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    }
  );
}
