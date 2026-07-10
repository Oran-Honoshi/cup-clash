"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function safeNext(next: string): string {
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

// Marks the one-time onboarding step done (skip or continue both count —
// the point is to never show it again) and sends the user on to whatever
// they originally signed up for.
export async function completeOnboarding(next: string): Promise<void> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (user) {
    // lib/supabase/types.ts is a stale generated snapshot that predates this
    // column (see migration 042) — bypass its Database generic here rather
    // than hand-editing generated types, matching the rest of the codebase's
    // convention of casting past it for newer columns.
    await (sb.from("profiles") as any).update({ onboarding_completed: true }).eq("id", user.id);
  }
  redirect(safeNext(next));
}
