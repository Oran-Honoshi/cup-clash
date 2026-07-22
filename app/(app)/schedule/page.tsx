export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { ScheduleClient }      from "@/components/schedule/schedule-client";
import { GroupPersistRedirect } from "@/components/app/group-persist-redirect";
import { GroupSwipeSelector }   from "@/components/groups/group-swipe-selector";
import { getAllMatches }         from "@/lib/services/matches";
import { getCompetitions }       from "@/lib/services/competitions";
import { getFollowedTeamIds, getFollowedCompetitionIds } from "@/lib/services/follows";

export const metadata: Metadata = {
  title: "Schedule — Every Competition | Cup Clash",
  description:
    "Every match across every competition you follow — World Cup, Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Copa Libertadores, Copa Sudamericana, MLS and Brazil Serie A. Predict scores directly in the schedule.",
  openGraph: {
    title: "Cup Clash Schedule",
    description:
      "All matches across every competition you follow. Predict scores inline.",
    type: "website",
  },
};

type DbMatchEvent = {
  minute: number;
  extra: number | null;
  player: string | null;
  team: string | null;
  type: string;
};

type DbMatch = {
  id: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  home_score_et: number | null;
  away_score_et: number | null;
  minute: number | null;
  match_events: DbMatchEvent[] | null;
  home: string;
  away: string;
  home_flag: string | null;
  away_flag: string | null;
  kickoff_at: string | null;
  time_confirmed: boolean | null;
};

type DbPred = {
  match_id: string;
  home_score: number;
  away_score: number;
  points_earned: number | null;
  is_exact: boolean | null;
};

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: { group?: string };
}) {
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();

  // ── Fetch all matches, live state, and the competition/follow data the
  // filter row needs ──────────────────────────────────────────────────────
  const [allMatches, { data: dbMatchRows }, competitions, followedTeamIds, followedCompetitionIds] = await Promise.all([
    getAllMatches(),
    sbAdmin()
      .from("matches")
      .select("id, status, home_score, away_score, home_score_et, away_score_et, minute, match_events, home, away, home_flag, away_flag, kickoff_at, time_confirmed"),
    getCompetitions(),
    getFollowedTeamIds(user?.id ?? null),
    getFollowedCompetitionIds(user?.id ?? null),
  ]);

  const matchResults: Record<string, {
    status: string;
    homeScore: number | null;
    awayScore: number | null;
    homeScore90: number | null;
    awayScore90: number | null;
    homeScoreET: number | null;
    awayScoreET: number | null;
    minute: number | null;
    matchEvents: DbMatchEvent[] | null;
  }> = {};
  const matchTeams: Record<string, { home: string; away: string; homeFlagCode?: string; awayFlagCode?: string }> = {};
  const matchKickoffs: Record<string, string> = {};
  const matchTimeConfirmed: Record<string, boolean> = {};

  for (const m of (dbMatchRows ?? []) as DbMatch[]) {
    matchResults[m.id] = {
      status:      m.status ?? "",
      homeScore:   m.home_score_et ?? m.home_score,
      awayScore:   m.away_score_et ?? m.away_score,
      homeScore90: m.home_score,
      awayScore90: m.away_score,
      homeScoreET: m.home_score_et,
      awayScoreET: m.away_score_et,
      minute:      m.minute        ?? null,
      matchEvents: m.match_events  ?? null,
    };
    if (m.home && m.away) {
      matchTeams[m.id] = {
        home:         m.home,
        away:         m.away,
        homeFlagCode: m.home_flag ?? undefined,
        awayFlagCode: m.away_flag ?? undefined,
      };
    }
    if (m.kickoff_at) {
      matchKickoffs[m.id] = m.kickoff_at;
    }
    if (m.time_confirmed != null) {
      matchTimeConfirmed[m.id] = m.time_confirmed;
    }
  }

  // ── Auth-only data ──────────────────────────────────────────────────────────
  let userId: string | undefined;
  let activeGroupId = "";
  let groupName     = "My Predictions";
  let allGroups:    Array<{ id: string; name: string; passkey: string; groupType: string; singleMatchId: string | null; competitionId: string | null }> = [];
  let initialPredictions: Record<
    string,
    { homeScore: number; awayScore: number; pointsEarned: number | null; isExact: boolean | null }
  > = {};
  let isAdFree    = false;
  let isCorporate = false;
  let userCountry: string | null = null;

  if (user) {
    userId = user.id;

    const { data: profileRow } = await sbAdmin()
      .from("profiles")
      .select("country")
      .eq("id", user.id)
      .maybeSingle();
    userCountry = (profileRow as { country: string | null } | null)?.country ?? null;

    const { data: memberships } = await sbAdmin()
      .from("group_members")
      .select("group_id, groups(id, name, passkey, group_type, single_match_id, competition_id)")
      .eq("user_id", user.id);

    allGroups = (memberships ?? [])
      .map((m: unknown) => {
        const row = m as {
          group_id: string;
          groups: { id: string; name: string; passkey: string; group_type: string | null; single_match_id: string | null; competition_id: string | null } | null;
        };
        if (!row.groups) return null;
        return {
          id:            row.groups.id,
          name:          row.groups.name,
          passkey:       row.groups.passkey,
          groupType:     row.groups.group_type ?? "tournament",
          singleMatchId: row.groups.single_match_id,
          competitionId: row.groups.competition_id,
        };
      })
      .filter(Boolean) as Array<{ id: string; name: string; passkey: string; groupType: string; singleMatchId: string | null; competitionId: string | null }>;

    activeGroupId =
      searchParams.group && allGroups.find(g => g.id === searchParams.group)
        ? searchParams.group
        : allGroups[0]?.id ?? "00000000-0000-0000-0000-000000000001";

    groupName = allGroups.find(g => g.id === activeGroupId)?.name ?? "My Predictions";

    type AdStatus = { is_ad_free: boolean; groups: { is_corporate_paid: boolean } | null } | null;

    const [{ data: predRows }, { data: adRaw }] = await Promise.all([
      sbAdmin()
        .from("group_predictions")
        .select("match_id, home_score, away_score, points_earned, is_exact")
        .eq("user_id", user.id)
        .eq("group_id", activeGroupId),
      // Ad status for this user+group
      sbAdmin()
        .from("group_members")
        .select("is_ad_free, groups(is_corporate_paid)")
        .eq("user_id", user.id)
        .eq("group_id", activeGroupId)
        .maybeSingle(),
    ]);

    for (const p of (predRows ?? []) as DbPred[]) {
      initialPredictions[p.match_id] = {
        homeScore:    p.home_score,
        awayScore:    p.away_score,
        pointsEarned: p.points_earned,
        isExact:      p.is_exact,
      };
    }

    const adStatus = adRaw as AdStatus;
    isAdFree    = adStatus?.is_ad_free ?? false;
    isCorporate = adStatus?.groups?.is_corporate_paid ?? false;
  }

  return (
    <>
      {allGroups.length > 0 && <GroupPersistRedirect groups={allGroups} basePath="/schedule" />}
      {allGroups.length > 1 && (
        <div className="-mx-4 sm:-mx-6">
          <GroupSwipeSelector groups={allGroups} activeGroupId={activeGroupId} basePath="/schedule" />
        </div>
      )}
      <ScheduleClient
        userId={userId}
        groupId={activeGroupId}
        groupName={groupName}
        allGroups={allGroups}
        allMatches={allMatches}
        matchResults={matchResults}
        matchTeams={matchTeams}
        matchKickoffs={matchKickoffs}
        matchTimeConfirmed={matchTimeConfirmed}
        initialPredictions={initialPredictions}
        isAdFree={isAdFree}
        isCorporate={isCorporate}
        userCountry={userCountry}
        competitions={competitions}
        followedTeamIds={Array.from(followedTeamIds)}
        followedCompetitionIds={Array.from(followedCompetitionIds)}
      />
    </>
  );
}
