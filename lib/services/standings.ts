import { sbAdmin as sb } from "@/lib/supabase/admin";

export interface StandingsRow {
  teamId: string;
  team: string;
  badgeUrl: string | null;
  groupLabel: string | null; // null for a single-table league; "Group A" etc. for UCL
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string | null;
}

export async function getStandings(competitionId: string): Promise<StandingsRow[]> {
  const { data: rows } = await sb()
    .from("standings")
    .select("team_id, group_label, position, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, form")
    .eq("competition_id", competitionId)
    .order("group_label", { ascending: true })
    .order("position", { ascending: true });

  const typedRows = (rows ?? []) as Array<{
    team_id: string; group_label: string | null; position: number;
    played: number; won: number; drawn: number; lost: number;
    goals_for: number; goals_against: number; goal_difference: number;
    points: number; form: string | null;
  }>;
  if (typedRows.length === 0) return [];

  const teamIds = [...new Set(typedRows.map((r) => r.team_id))];
  const { data: teams } = await sb().from("teams").select("id, name, badge_url").in("id", teamIds);
  const teamById = new Map((teams ?? []).map((t: { id: string; name: string; badge_url: string | null }) => [t.id, t]));

  return typedRows.map((r) => {
    const team = teamById.get(r.team_id);
    return {
      teamId: r.team_id,
      team: team?.name ?? "Unknown",
      badgeUrl: team?.badge_url ?? null,
      groupLabel: r.group_label ? r.group_label : null,
      position: r.position,
      played: r.played,
      won: r.won,
      drawn: r.drawn,
      lost: r.lost,
      goalsFor: r.goals_for,
      goalsAgainst: r.goals_against,
      goalDifference: r.goal_difference,
      points: r.points,
      form: r.form,
    };
  });
}
