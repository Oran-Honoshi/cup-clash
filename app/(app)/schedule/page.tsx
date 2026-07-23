export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { ScheduleClient }      from "@/components/schedule/schedule-client";
import { GroupPersistRedirect } from "@/components/app/group-persist-redirect";
import { GroupSwipeSelector }   from "@/components/groups/group-swipe-selector";
import { getScheduleWindowBundle } from "@/lib/services/schedule-data";
import { getCompetitionsCached } from "@/lib/services/reference-cache";
import { WORLD_CUP_SLUG } from "@/lib/services/competitions";
import { getContinentalInvolvement } from "@/lib/services/matches";
import { ContinentalWatchCard } from "@/components/schedule/continental-watch-card";
import { ConsumeFollowParam } from "@/components/leagues/consume-follow-param";
import { getFollowedTeamIds, getFollowedCompetitionIds } from "@/lib/services/follows";
import { getFollowedCompetitionIdsViaCountry } from "@/lib/services/countries";

const SCHEDULE_TABS = ["live", "today", "upcoming", "done"] as const;
type ScheduleTab = (typeof SCHEDULE_TABS)[number];

// Initial payload window — Live/Today/near-term Upcoming/recent Done all
// fall inside this range; anything further out is fetched on demand by
// ScheduleClient via /api/schedule/matches as the viewer navigates past it.
// This replaced an unscoped fetch of every match across every competition
// (2.7MB) that shipped on every Schedule load regardless of which tab was
// actually open.
const WINDOW_DAYS_BACK    = 3;
const WINDOW_DAYS_FORWARD = 21;

function scheduleWindow(): { fromISO: string; toISO: string } {
  const now = Date.now();
  return {
    fromISO: new Date(now - WINDOW_DAYS_BACK    * 86_400_000).toISOString(),
    toISO:   new Date(now + WINDOW_DAYS_FORWARD * 86_400_000).toISOString(),
  };
}

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
  searchParams: { group?: string; tab?: string; competition?: string; follow?: string };
}) {
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();

  // ── Fetch the initial match window, plus the competition/follow data the
  // filter row needs ──────────────────────────────────────────────────────
  const { fromISO, toISO } = scheduleWindow();
  const [scheduleBundle, competitions, followedTeamIds, followedCompetitionIdsOwn, followedCompetitionIdsViaCountry] = await Promise.all([
    getScheduleWindowBundle(fromISO, toISO),
    getCompetitionsCached(),
    getFollowedTeamIds(user?.id ?? null),
    getFollowedCompetitionIds(user?.id ?? null),
    getFollowedCompetitionIdsViaCountry(user?.id ?? null),
  ]);
  // A country-follow counts a match as followed via its resolved domestic
  // league (see getFollowedCompetitionIdsViaCountry) — merged in here so
  // ScheduleClient's isFollowed() needs no separate country branch.
  const followedCompetitionIds = new Set([...followedCompetitionIdsOwn, ...followedCompetitionIdsViaCountry]);
  const { matches: allMatches, matchResults, matchTeams, matchKickoffs, matchTimeConfirmed } = scheduleBundle;

  const continentalTies = await getContinentalInvolvement(Array.from(followedTeamIds));

  // ── Deep-link seeds (e.g. from the /scores → /schedule redirect) ────────────
  const initialTab: ScheduleTab | undefined =
    SCHEDULE_TABS.includes(searchParams.tab as ScheduleTab) ? (searchParams.tab as ScheduleTab) : undefined;

  let initialCompetitionFilter: string | null | "all" | undefined;
  if (searchParams.competition) {
    if (searchParams.competition === WORLD_CUP_SLUG) {
      initialCompetitionFilter = null;
    } else {
      const match = competitions.find(c => c.slug === searchParams.competition);
      initialCompetitionFilter = match ? match.id : "all";
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
      {continentalTies.length > 0 && <ContinentalWatchCard ties={continentalTies} />}
      <ConsumeFollowParam userId={userId ?? null} />
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
        initialWindowFromISO={fromISO}
        initialWindowToISO={toISO}
        initialTab={initialTab}
        initialCompetitionFilter={initialCompetitionFilter}
      />
    </>
  );
}
