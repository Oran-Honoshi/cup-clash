// Shared group-stage standings algorithm — single source of truth for both
// the GroupStandings display (components/dashboard/group-standings.tsx) and
// the best_third_* tournament-pick scoring (app/api/scores/route.ts), so the
// two can never silently drift on tiebreak rules.

export interface StandingsRow {
  team:    string;
  played:  number;
  won:     number;
  drawn:   number;
  lost:    number;
  gf:      number;
  ga:      number;
  gd:      number;
  points:  number;
}

export interface StandingsResult {
  home:      string;
  away:      string;
  homeScore: number;
  awayScore: number;
}

// Sorted by points, then goal difference, then goals for — no head-to-head
// or fair-play tiebreakers (matches what the app has always displayed).
export function buildStandings(teams: string[], results: StandingsResult[]): StandingsRow[] {
  const rows: Record<string, StandingsRow> = {};
  teams.forEach(t => { rows[t] = { team: t, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 }; });

  results.forEach(({ home, away, homeScore, awayScore }) => {
    if (!rows[home] || !rows[away]) return;
    rows[home].played++; rows[away].played++;
    rows[home].gf += homeScore; rows[home].ga += awayScore;
    rows[away].gf += awayScore; rows[away].ga += homeScore;
    if (homeScore > awayScore) { rows[home].won++; rows[home].points += 3; rows[away].lost++; }
    else if (awayScore > homeScore) { rows[away].won++; rows[away].points += 3; rows[home].lost++; }
    else { rows[home].drawn++; rows[away].drawn++; rows[home].points++; rows[away].points++; }
    rows[home].gd = rows[home].gf - rows[home].ga;
    rows[away].gd = rows[away].gf - rows[away].ga;
  });

  return Object.values(rows).sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
}
