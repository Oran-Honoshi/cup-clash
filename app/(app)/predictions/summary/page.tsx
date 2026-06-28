export const dynamic = "force-dynamic";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PredictionsSummaryClient } from "@/components/predictions/predictions-summary-client";
import { WC2026_MATCHES } from "@/lib/schedule";
import type { ScheduleMatch } from "@/lib/schedule";
import Link from "next/link";

function sbAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export interface SummaryMatch extends ScheduleMatch {
  homeScore: number | null;
  awayScore: number | null;
  matchStatus: string | null;
}

export default async function PredictionsSummaryPage() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/signin");

  const admin = sbAdmin();

  const { data: rawMemberships } = await admin
    .from("group_members")
    .select("group_id, groups(id, name)")
    .eq("user_id", user.id);

  const groups: Array<{ id: string; name: string }> = [];
  for (const row of (rawMemberships ?? []) as unknown as Array<{ group_id: string; groups: unknown }>) {
    const g = row.groups as { id: string; name: string } | { id: string; name: string }[] | null;
    if (!g) continue;
    if (Array.isArray(g)) {
      if (g.length > 0) groups.push(g[0]);
    } else {
      groups.push(g);
    }
  }

  if (!groups.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-6">
        <div className="text-5xl">🏆</div>
        <h2 className="font-display text-2xl font-black text-white uppercase">No Groups Yet</h2>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
          Join or create a group to see your predictions summary.
        </p>
        <Link href="/groups"
          className="px-6 py-3 rounded-2xl font-bold text-sm"
          style={{ background: "linear-gradient(135deg,#00FF88,#00D4FF)", color: "#0B141B" }}>
          Find a Group
        </Link>
      </div>
    );
  }

  const groupIds = groups.map(g => g.id);

  const [memberCountResults, leaderboardResult, predictionsResult, tournamentResult, dbMatchResult] = await Promise.all([
    Promise.all(
      groupIds.map(gid =>
        admin.from("group_members").select("id", { count: "exact", head: true }).eq("group_id", gid)
      )
    ),
    admin
      .from("leaderboard")
      .select("group_id, total_points")
      .eq("user_id", user.id)
      .in("group_id", groupIds),
    admin
      .from("group_predictions")
      .select("group_id, match_id, home_score, away_score, points_earned, is_exact, locked_at")
      .eq("user_id", user.id)
      .in("group_id", groupIds),
    admin
      .from("predictions")
      .select("group_id, pred_type, pred_value, points_earned")
      .eq("user_id", user.id)
      .in("group_id", groupIds)
      .not("pred_type", "eq", "match"),
    admin
      .from("matches")
      .select("id, home, away, home_flag, away_flag, home_score, away_score, status"),
  ]);

  const totalPointsMap: Record<string, number> = {};
  for (const row of (leaderboardResult.data ?? []) as Array<{ group_id: string; total_points: number }>) {
    totalPointsMap[row.group_id] = row.total_points;
  }

  const groupsWithMeta = groups.map((g, i) => ({
    id: g.id,
    name: g.name,
    memberCount: memberCountResults[i].count ?? 0,
    totalPoints: totalPointsMap[g.id] ?? 0,
  }));

  type PredRow = {
    group_id: string; match_id: string;
    home_score: number; away_score: number;
    points_earned: number; is_exact: boolean; locked_at: string | null;
  };
  const allPredictions: Record<string, Record<string, {
    homeScore: number; awayScore: number;
    pointsEarned: number; isExact: boolean; lockedAt: string | null;
  }>> = {};
  for (const p of (predictionsResult.data ?? []) as PredRow[]) {
    if (!allPredictions[p.group_id]) allPredictions[p.group_id] = {};
    allPredictions[p.group_id][p.match_id] = {
      homeScore: p.home_score,
      awayScore: p.away_score,
      pointsEarned: p.points_earned ?? 0,
      isExact: p.is_exact ?? false,
      lockedAt: p.locked_at,
    };
  }

  type TournRow = { group_id: string; pred_type: string; pred_value: string; points_earned: number };
  const tournamentPicks: Record<string, Record<string, { value: string; points: number }>> = {};
  for (const t of (tournamentResult.data ?? []) as TournRow[]) {
    if (!tournamentPicks[t.group_id]) tournamentPicks[t.group_id] = {};
    tournamentPicks[t.group_id][t.pred_type] = { value: t.pred_value ?? "", points: t.points_earned ?? 0 };
  }

  // Merge schedule with DB scores and team names (DB team names override placeholders for knockout stages)
  const dbMatchData: Record<string, {
    home: string; away: string; homeFlagCode?: string; awayFlagCode?: string;
    homeScore: number | null; awayScore: number | null; matchStatus: string | null;
  }> = {};
  for (const row of (dbMatchResult.data ?? []) as Array<{
    id: string; home: string; away: string;
    home_flag: string | null; away_flag: string | null;
    home_score: number | null; away_score: number | null; status: string | null;
  }>) {
    dbMatchData[row.id] = {
      home:         row.home,
      away:         row.away,
      homeFlagCode: row.home_flag ?? undefined,
      awayFlagCode: row.away_flag ?? undefined,
      homeScore:    row.home_score,
      awayScore:    row.away_score,
      matchStatus:  row.status,
    };
  }
  const matches: SummaryMatch[] = WC2026_MATCHES.map(m => {
    const db = dbMatchData[m.id];
    return {
      ...m,
      home:         db?.home         ?? m.home,
      away:         db?.away         ?? m.away,
      homeFlagCode: db?.homeFlagCode ?? m.homeFlagCode,
      awayFlagCode: db?.awayFlagCode ?? m.awayFlagCode,
      homeScore:    db?.homeScore    ?? null,
      awayScore:    db?.awayScore    ?? null,
      matchStatus:  db?.matchStatus  ?? null,
    };
  });

  return (
    <div className="pb-32">
      <PredictionsSummaryClient
        userId={user.id}
        groups={groupsWithMeta}
        matches={matches}
        initialPredictions={allPredictions}
        initialTournamentPicks={tournamentPicks}
      />
    </div>
  );
}
