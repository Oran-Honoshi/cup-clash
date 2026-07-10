import { createClient } from "@supabase/supabase-js";
import { getCompetitions, WORLD_CUP_SLUG, type CompetitionRow } from "./competitions";

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export interface TeamRow {
  id: string;
  name: string;
  shortName: string | null;
  badgeUrl: string | null;
  country: string | null;
}

export interface CompetitionTeams {
  competition: CompetitionRow;
  teams: TeamRow[];
}

function toTeamRow(row: {
  id: string; name: string; short_name: string | null; badge_url: string | null; country: string | null;
}): TeamRow {
  return { id: row.id, name: row.name, shortName: row.short_name, badgeUrl: row.badge_url, country: row.country };
}

// Teams aren't directly scoped to a competition (a club can play in a
// league and a cup). Derive the grouping from where a team actually shows
// up: `standings` for league/cup teams (populated by the fixtures fetch),
// and World Cup 2026 matches for the 48 national teams (which have no
// standings rows of their own).
export async function getTeamsByCompetition(): Promise<CompetitionTeams[]> {
  const client = sb();
  const competitions = await getCompetitions();
  const wc = competitions.find((c) => c.slug === WORLD_CUP_SLUG);

  const [{ data: teamsData }, { data: standingsData }, wcMatchesResult] = await Promise.all([
    client.from("teams").select("id, name, short_name, badge_url, country"),
    client.from("standings").select("competition_id, team_id"),
    wc
      ? client.from("matches").select("home_team_id, away_team_id").eq("competition_id", wc.id)
      : Promise.resolve({ data: [] as Array<{ home_team_id: string | null; away_team_id: string | null }> }),
  ]);

  const teamsById = new Map<string, TeamRow>();
  for (const t of (teamsData ?? []) as Array<{
    id: string; name: string; short_name: string | null; badge_url: string | null; country: string | null;
  }>) {
    teamsById.set(t.id, toTeamRow(t));
  }

  const teamIdsByCompetition = new Map<string, Set<string>>();
  const addTeam = (competitionId: string, teamId: string | null) => {
    if (!teamId) return;
    if (!teamIdsByCompetition.has(competitionId)) teamIdsByCompetition.set(competitionId, new Set());
    teamIdsByCompetition.get(competitionId)!.add(teamId);
  };

  for (const s of (standingsData ?? []) as Array<{ competition_id: string; team_id: string }>) {
    addTeam(s.competition_id, s.team_id);
  }
  if (wc) {
    for (const m of (wcMatchesResult.data ?? []) as Array<{ home_team_id: string | null; away_team_id: string | null }>) {
      addTeam(wc.id, m.home_team_id);
      addTeam(wc.id, m.away_team_id);
    }
  }

  const result: CompetitionTeams[] = [];
  for (const c of competitions) {
    const ids = teamIdsByCompetition.get(c.id);
    if (!ids || ids.size === 0) continue;
    const teams = Array.from(ids)
      .map((id) => teamsById.get(id))
      .filter((t): t is TeamRow => !!t)
      .sort((a, b) => a.name.localeCompare(b.name));
    result.push({ competition: c, teams });
  }
  return result;
}

export async function getTeamsByIds(ids: string[]): Promise<TeamRow[]> {
  if (ids.length === 0) return [];
  const { data } = await sb()
    .from("teams")
    .select("id, name, short_name, badge_url, country")
    .in("id", ids);
  return ((data ?? []) as Array<{
    id: string; name: string; short_name: string | null; badge_url: string | null; country: string | null;
  }>).map(toTeamRow);
}
