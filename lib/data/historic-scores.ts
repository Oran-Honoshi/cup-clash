// Curated pool for the "Guess the Score" mini-game — one entry is featured
// per calendar day (see lib/services/score-challenge.ts), cycling through
// deterministically by day-of-year. No admin authoring flow needed; this
// list is the entire puzzle-content surface. All entries are well-known,
// easily verifiable historic results (World Cup finals/semis, UEFA
// Champions League finals) — deliberately nothing from World Cup 2026
// itself, since that's this app's live predictions subject, not trivia.

export interface HistoricScore {
  competition: string;
  stage: string;
  year: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
}

export const HISTORIC_SCORES: HistoricScore[] = [
  { competition: "FIFA World Cup", stage: "Final", year: 1958, homeTeam: "Brazil", awayTeam: "Sweden", homeScore: 5, awayScore: 2 },
  { competition: "FIFA World Cup", stage: "Final", year: 1962, homeTeam: "Brazil", awayTeam: "Czechoslovakia", homeScore: 3, awayScore: 1 },
  { competition: "FIFA World Cup", stage: "Final", year: 1966, homeTeam: "England", awayTeam: "West Germany", homeScore: 4, awayScore: 2 },
  { competition: "FIFA World Cup", stage: "Final", year: 1970, homeTeam: "Brazil", awayTeam: "Italy", homeScore: 4, awayScore: 1 },
  { competition: "FIFA World Cup", stage: "Final", year: 1974, homeTeam: "West Germany", awayTeam: "Netherlands", homeScore: 2, awayScore: 1 },
  { competition: "FIFA World Cup", stage: "Final", year: 1978, homeTeam: "Argentina", awayTeam: "Netherlands", homeScore: 3, awayScore: 1 },
  { competition: "FIFA World Cup", stage: "Final", year: 1982, homeTeam: "Italy", awayTeam: "West Germany", homeScore: 3, awayScore: 1 },
  { competition: "FIFA World Cup", stage: "Final", year: 1986, homeTeam: "Argentina", awayTeam: "West Germany", homeScore: 3, awayScore: 2 },
  { competition: "FIFA World Cup", stage: "Final", year: 1990, homeTeam: "West Germany", awayTeam: "Argentina", homeScore: 1, awayScore: 0 },
  { competition: "FIFA World Cup", stage: "Final", year: 1994, homeTeam: "Brazil", awayTeam: "Italy", homeScore: 0, awayScore: 0 },
  { competition: "FIFA World Cup", stage: "Final", year: 1998, homeTeam: "France", awayTeam: "Brazil", homeScore: 3, awayScore: 0 },
  { competition: "FIFA World Cup", stage: "Final", year: 2002, homeTeam: "Brazil", awayTeam: "Germany", homeScore: 2, awayScore: 0 },
  { competition: "FIFA World Cup", stage: "Final", year: 2006, homeTeam: "Italy", awayTeam: "France", homeScore: 1, awayScore: 1 },
  { competition: "FIFA World Cup", stage: "Final", year: 2010, homeTeam: "Spain", awayTeam: "Netherlands", homeScore: 1, awayScore: 0 },
  { competition: "FIFA World Cup", stage: "Final", year: 2014, homeTeam: "Germany", awayTeam: "Argentina", homeScore: 1, awayScore: 0 },
  { competition: "FIFA World Cup", stage: "Final", year: 2018, homeTeam: "France", awayTeam: "Croatia", homeScore: 4, awayScore: 2 },
  { competition: "FIFA World Cup", stage: "Final", year: 2022, homeTeam: "Argentina", awayTeam: "France", homeScore: 3, awayScore: 3 },
  { competition: "FIFA World Cup", stage: "Semi-Final", year: 2014, homeTeam: "Brazil", awayTeam: "Germany", homeScore: 1, awayScore: 7 },
  { competition: "FIFA World Cup", stage: "Group Stage", year: 1950, homeTeam: "Uruguay", awayTeam: "Brazil", homeScore: 2, awayScore: 1 },
  { competition: "UEFA Champions League", stage: "Final", year: 1999, homeTeam: "Manchester United", awayTeam: "Bayern Munich", homeScore: 2, awayScore: 1 },
  { competition: "UEFA Champions League", stage: "Final", year: 2005, homeTeam: "Liverpool", awayTeam: "AC Milan", homeScore: 3, awayScore: 3 },
  { competition: "UEFA Champions League", stage: "Final", year: 2010, homeTeam: "Inter Milan", awayTeam: "Bayern Munich", homeScore: 2, awayScore: 0 },
  { competition: "UEFA Champions League", stage: "Final", year: 2012, homeTeam: "Chelsea", awayTeam: "Bayern Munich", homeScore: 1, awayScore: 1 },
  { competition: "UEFA Champions League", stage: "Final", year: 2016, homeTeam: "Real Madrid", awayTeam: "Atletico Madrid", homeScore: 1, awayScore: 1 },
  { competition: "UEFA Champions League", stage: "Final", year: 2019, homeTeam: "Liverpool", awayTeam: "Tottenham Hotspur", homeScore: 2, awayScore: 0 },
];
