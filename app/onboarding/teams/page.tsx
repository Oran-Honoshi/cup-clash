export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTeamsByCompetition } from "@/lib/services/teams";
import { getFollowCount, getFollowedTeamIds } from "@/lib/services/follows";
import { parseFollowParam } from "@/lib/auth-wall";
import { OnboardingTeamsClient } from "@/components/onboarding/onboarding-teams-client";

function safeNext(raw: string | undefined): string {
  if (!raw) return "/dashboard";
  return raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";
}

// One-time "Pick your teams" moment, landed on right after a brand-new
// account is created (see the redirects in app/(auth)/signup/page.tsx and
// app/auth/callback/route.ts). Gated on profiles.onboarding_completed so
// it can never show twice, and skipped entirely if the signup already
// carries a pending Follow action or the user already follows something.
export default async function OnboardingTeamsPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const next = safeNext(searchParams.next);

  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect(next);

  const { data: profile } = await sb
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .single();

  if ((profile as { onboarding_completed?: boolean } | null)?.onboarding_completed) {
    redirect(next);
  }

  // A pending Follow action embedded in `next` (from the auth-wall) completes
  // itself on landing via <ConsumeFollowParam/> — that single follow is
  // enough of a "pick your teams" moment, so skip straight through.
  const nextUrl = new URL(next, "https://placeholder.local");
  const hasPendingFollow = !!parseFollowParam(nextUrl.searchParams);
  const followCount = hasPendingFollow ? 1 : await getFollowCount(user.id);

  if (followCount > 0) {
    await (sb.from("profiles") as any).update({ onboarding_completed: true }).eq("id", user.id);
    redirect(next);
  }

  const [teamGroups, followedTeamIds] = await Promise.all([
    getTeamsByCompetition(),
    getFollowedTeamIds(user.id),
  ]);

  return (
    <OnboardingTeamsClient
      next={next}
      userId={user.id}
      teamGroups={teamGroups}
      followedTeamIds={followedTeamIds}
    />
  );
}
