// ============================================================
// CUP CLASH — TESTING DATA v2
// Uses real WC2026 schedule match IDs from lib/schedule.ts
// 5 test members with varied prediction strategies
// ============================================================

export interface MockPrediction {
  matchId: string;
  homeScore: number;
  awayScore: number;
}

export interface MockMember {
  id: string;
  name: string;
  country: string;
  flagCode: string;
  isAdmin?: boolean;
  email: string;
  predictions: MockPrediction[];
}

export interface SimulatedResult {
  matchId: string;
  home: string;
  away: string;
  homeFlagCode: string;
  awayFlagCode: string;
  homeScore: number;
  awayScore: number;
  stage: string;
  stadium: string;
  city: string;
  isKnockout?: boolean;
  advancedTeam?: string;
  wentToPenalties?: boolean;
  group?: string;
}

export interface ScoringRules {
  correctOutcome: number;
  exactScore: number;
  koAdvancement: number;
}

export const DEFAULT_SCORING_RULES: ScoringRules = {
  correctOutcome: 10,
  exactScore: 25,
  koAdvancement: 20,
};

// ── Real match IDs from schedule.ts ──────────────────────────────────────────
// Using Group A–D matches (first matches of tournament) for testing
export const SIMULATED_MATCHES: SimulatedResult[] = [
  // Group A — Match 1
  { matchId: "g001", home: "Mexico",       away: "South Africa",  homeFlagCode: "mx",     awayFlagCode: "za",    homeScore: 2, awayScore: 0, stage: "Group A", stadium: "Estadio Azteca",         city: "Mexico City",   group: "A" },
  // Group B — Match 1
  { matchId: "g003", home: "Canada",       away: "Bosnia & Herzegovina", homeFlagCode: "ca", awayFlagCode: "ba", homeScore: 1, awayScore: 1, stage: "Group B", stadium: "BMO Field",              city: "Toronto",       group: "B" },
  // Group C — Match 1
  { matchId: "g004", home: "Brazil",       away: "Morocco",       homeFlagCode: "br",     awayFlagCode: "ma",    homeScore: 3, awayScore: 1, stage: "Group C", stadium: "MetLife Stadium",         city: "New York/NJ",   group: "C" },
  // Group D — Match 1
  { matchId: "g005", home: "USA",          away: "Paraguay",      homeFlagCode: "us",     awayFlagCode: "py",    homeScore: 2, awayScore: 0, stage: "Group D", stadium: "Levi's Stadium",          city: "San Francisco", group: "D" },
  // Group E — Match 1
  { matchId: "g010", home: "Germany",      away: "Curaçao",       homeFlagCode: "de",     awayFlagCode: "cw",    homeScore: 4, awayScore: 0, stage: "Group E", stadium: "AT&T Stadium",            city: "Dallas",        group: "E" },
  // Group F — Match 1
  { matchId: "g012", home: "Netherlands",  away: "Japan",         homeFlagCode: "nl",     awayFlagCode: "jp",    homeScore: 1, awayScore: 1, stage: "Group F", stadium: "Estadio BBVA",            city: "Monterrey",     group: "F" },
  // Group G — Match 1
  { matchId: "g016", home: "Belgium",      away: "Egypt",         homeFlagCode: "be",     awayFlagCode: "eg",    homeScore: 2, awayScore: 0, stage: "Group G", stadium: "Rose Bowl",               city: "Los Angeles",   group: "G" },
  // Group H — Match 1
  { matchId: "g009", home: "Saudi Arabia", away: "Uruguay",       homeFlagCode: "sa",     awayFlagCode: "uy",    homeScore: 0, awayScore: 2, stage: "Group H", stadium: "Hard Rock Stadium",       city: "Miami",         group: "H" },
  // Group I — Match 1
  { matchId: "g019", home: "France",       away: "Senegal",       homeFlagCode: "fr",     awayFlagCode: "sn",    homeScore: 2, awayScore: 1, stage: "Group I", stadium: "MetLife Stadium",         city: "New York/NJ",   group: "I" },
  // Group J — Match 1
  { matchId: "g020", home: "Argentina",    away: "Algeria",       homeFlagCode: "ar",     awayFlagCode: "dz",    homeScore: 3, awayScore: 0, stage: "Group J", stadium: "Levi's Stadium",          city: "San Francisco", group: "J" },
  // Group K — Match 1
  { matchId: "g023", home: "Portugal",     away: "Congo DR",      homeFlagCode: "pt",     awayFlagCode: "cd",    homeScore: 3, awayScore: 0, stage: "Group K", stadium: "NRG Stadium",             city: "Houston",       group: "K" },
  // Group L — Match 1
  { matchId: "g021", home: "England",      away: "Croatia",       homeFlagCode: "gb-eng", awayFlagCode: "hr",    homeScore: 2, awayScore: 1, stage: "Group L", stadium: "BMO Field",               city: "Toronto",       group: "L" },
  // Group A — Match 2
  { matchId: "g027", home: "Korea Republic", away: "Czechia",     homeFlagCode: "kr",     awayFlagCode: "cz",    homeScore: 1, awayScore: 2, stage: "Group A", stadium: "Estadio Chivas",          city: "Guadalajara",   group: "A" },
  // Group B — Match 2
  { matchId: "g008", home: "Qatar",        away: "Switzerland",   homeFlagCode: "qa",     awayFlagCode: "ch",    homeScore: 0, awayScore: 2, stage: "Group B", stadium: "Levi's Stadium",          city: "San Francisco", group: "B" },
  // Group C — Match 2
  { matchId: "g007", home: "Haiti",        away: "Scotland",      homeFlagCode: "ht",     awayFlagCode: "gb-sct",homeScore: 0, awayScore: 2, stage: "Group C", stadium: "Hard Rock Stadium",       city: "Miami",         group: "C" },
  // Round of 32 (simulated)
  { matchId: "r001", home: "Mexico",       away: "Canada",        homeFlagCode: "mx",     awayFlagCode: "ca",    homeScore: 1, awayScore: 1, stage: "Round of 32", stadium: "MetLife Stadium",     city: "New York/NJ",   isKnockout: true, advancedTeam: "Mexico", wentToPenalties: true  },
  { matchId: "r002", home: "Brazil",       away: "USA",           homeFlagCode: "br",     awayFlagCode: "us",    homeScore: 2, awayScore: 1, stage: "Round of 32", stadium: "Levi's Stadium",      city: "San Francisco", isKnockout: true, advancedTeam: "Brazil",  wentToPenalties: false },
  // Quarter-Final (simulated)
  { matchId: "qf1",  home: "Mexico",       away: "Brazil",        homeFlagCode: "mx",     awayFlagCode: "br",    homeScore: 0, awayScore: 2, stage: "Quarter-Final", stadium: "AT&T Stadium",     city: "Dallas",        isKnockout: true, advancedTeam: "Brazil",  wentToPenalties: false },
  // Semi-Final (simulated)
  { matchId: "sf1",  home: "Brazil",       away: "Argentina",     homeFlagCode: "br",     awayFlagCode: "ar",    homeScore: 1, awayScore: 2, stage: "Semi-Final", stadium: "MetLife Stadium",      city: "New York/NJ",   isKnockout: true, advancedTeam: "Argentina", wentToPenalties: false },
  // Final (simulated)
  { matchId: "final",home: "Argentina",    away: "France",        homeFlagCode: "ar",     awayFlagCode: "fr",    homeScore: 3, awayScore: 3, stage: "Final", stadium: "MetLife Stadium",           city: "New York/NJ",   isKnockout: true, advancedTeam: "Argentina", wentToPenalties: true  },
];

// ── 5 Test Members with varied prediction strategies ──────────────────────────
export const MOCK_TEST_MEMBERS: MockMember[] = [
  {
    id: "test-amit", name: "Amit (Admin)", country: "Argentina", flagCode: "ar",
    isAdmin: true, email: "amit@test.cupclash.com",
    predictions: [
      { matchId: "g001", homeScore: 2, awayScore: 0 }, // EXACT ✓
      { matchId: "g003", homeScore: 1, awayScore: 1 }, // EXACT ✓
      { matchId: "g004", homeScore: 2, awayScore: 1 }, // OUTCOME ✓
      { matchId: "g005", homeScore: 2, awayScore: 0 }, // EXACT ✓
      { matchId: "g010", homeScore: 3, awayScore: 0 }, // OUTCOME ✓
      { matchId: "g012", homeScore: 1, awayScore: 1 }, // EXACT ✓
      { matchId: "g016", homeScore: 2, awayScore: 0 }, // EXACT ✓
      { matchId: "g009", homeScore: 0, awayScore: 1 }, // OUTCOME ✓
      { matchId: "g019", homeScore: 2, awayScore: 0 }, // OUTCOME ✓
      { matchId: "g020", homeScore: 2, awayScore: 0 }, // OUTCOME ✓
      { matchId: "g023", homeScore: 3, awayScore: 0 }, // EXACT ✓
      { matchId: "g021", homeScore: 2, awayScore: 1 }, // EXACT ✓
      { matchId: "g027", homeScore: 0, awayScore: 2 }, // WRONG ✗
      { matchId: "g008", homeScore: 0, awayScore: 2 }, // EXACT ✓
      { matchId: "g007", homeScore: 0, awayScore: 2 }, // EXACT ✓
    ],
  },
  {
    id: "test-sarah", name: "Sarah", country: "Brazil", flagCode: "br",
    isAdmin: false, email: "sarah@test.cupclash.com",
    predictions: [
      { matchId: "g001", homeScore: 1, awayScore: 0 }, // OUTCOME ✓
      { matchId: "g003", homeScore: 2, awayScore: 0 }, // WRONG ✗
      { matchId: "g004", homeScore: 3, awayScore: 1 }, // EXACT ✓
      { matchId: "g005", homeScore: 1, awayScore: 0 }, // OUTCOME ✓
      { matchId: "g010", homeScore: 4, awayScore: 0 }, // EXACT ✓
      { matchId: "g012", homeScore: 2, awayScore: 0 }, // WRONG ✗
      { matchId: "g016", homeScore: 1, awayScore: 0 }, // OUTCOME ✓
      { matchId: "g009", homeScore: 1, awayScore: 2 }, // OUTCOME ✓
      { matchId: "g019", homeScore: 1, awayScore: 0 }, // OUTCOME ✓
      { matchId: "g020", homeScore: 3, awayScore: 0 }, // EXACT ✓
      { matchId: "g023", homeScore: 2, awayScore: 0 }, // OUTCOME ✓
      { matchId: "g021", homeScore: 1, awayScore: 0 }, // OUTCOME ✓
      { matchId: "g027", homeScore: 1, awayScore: 2 }, // EXACT ✓
      { matchId: "g008", homeScore: 1, awayScore: 0 }, // WRONG ✗
      { matchId: "g007", homeScore: 0, awayScore: 1 }, // WRONG ✗ (was 0-2)
    ],
  },
  {
    id: "test-john", name: "John", country: "England", flagCode: "gb-eng",
    isAdmin: false, email: "john@test.cupclash.com",
    predictions: [
      { matchId: "g001", homeScore: 2, awayScore: 1 }, // OUTCOME ✓
      { matchId: "g003", homeScore: 1, awayScore: 1 }, // EXACT ✓
      { matchId: "g004", homeScore: 1, awayScore: 0 }, // OUTCOME ✓
      { matchId: "g005", homeScore: 3, awayScore: 1 }, // OUTCOME ✓
      { matchId: "g010", homeScore: 2, awayScore: 0 }, // OUTCOME ✓
      { matchId: "g012", homeScore: 0, awayScore: 0 }, // WRONG ✗
      { matchId: "g016", homeScore: 2, awayScore: 1 }, // OUTCOME ✓
      { matchId: "g009", homeScore: 2, awayScore: 3 }, // OUTCOME ✓
      { matchId: "g019", homeScore: 2, awayScore: 1 }, // EXACT ✓
      { matchId: "g020", homeScore: 1, awayScore: 0 }, // OUTCOME ✓
      { matchId: "g023", homeScore: 2, awayScore: 0 }, // OUTCOME ✓
      { matchId: "g021", homeScore: 3, awayScore: 1 }, // OUTCOME ✓
      { matchId: "g027", homeScore: 0, awayScore: 1 }, // OUTCOME ✓ (was 1-2)
      { matchId: "g008", homeScore: 0, awayScore: 2 }, // EXACT ✓
      { matchId: "g007", homeScore: 1, awayScore: 2 }, // OUTCOME ✓
    ],
  },
  {
    id: "test-lior", name: "Lior", country: "Israel", flagCode: "il",
    isAdmin: false, email: "lior@test.cupclash.com",
    predictions: [
      { matchId: "g001", homeScore: 0, awayScore: 1 }, // WRONG ✗
      { matchId: "g003", homeScore: 2, awayScore: 1 }, // WRONG ✗
      { matchId: "g004", homeScore: 2, awayScore: 0 }, // OUTCOME ✓
      { matchId: "g005", homeScore: 2, awayScore: 0 }, // EXACT ✓
      { matchId: "g010", homeScore: 4, awayScore: 0 }, // EXACT ✓
      { matchId: "g012", homeScore: 1, awayScore: 1 }, // EXACT ✓
      { matchId: "g016", homeScore: 0, awayScore: 1 }, // WRONG ✗
      { matchId: "g009", homeScore: 0, awayScore: 2 }, // EXACT ✓
      { matchId: "g019", homeScore: 3, awayScore: 0 }, // OUTCOME ✓
      { matchId: "g020", homeScore: 2, awayScore: 0 }, // OUTCOME ✓
      { matchId: "g023", homeScore: 1, awayScore: 0 }, // OUTCOME ✓
      { matchId: "g021", homeScore: 1, awayScore: 1 }, // WRONG ✗
      { matchId: "g027", homeScore: 1, awayScore: 2 }, // EXACT ✓
      { matchId: "g008", homeScore: 1, awayScore: 1 }, // WRONG ✗
      { matchId: "g007", homeScore: 0, awayScore: 2 }, // EXACT ✓
    ],
  },
  {
    id: "test-maya", name: "Maya", country: "France", flagCode: "fr",
    isAdmin: false, email: "maya@test.cupclash.com",
    predictions: [
      { matchId: "g001", homeScore: 1, awayScore: 1 }, // WRONG ✗
      { matchId: "g003", homeScore: 1, awayScore: 0 }, // WRONG ✗
      { matchId: "g004", homeScore: 3, awayScore: 1 }, // EXACT ✓
      { matchId: "g005", homeScore: 2, awayScore: 1 }, // OUTCOME ✓
      { matchId: "g010", homeScore: 3, awayScore: 1 }, // OUTCOME ✓
      { matchId: "g012", homeScore: 1, awayScore: 1 }, // EXACT ✓
      { matchId: "g016", homeScore: 2, awayScore: 0 }, // EXACT ✓
      { matchId: "g009", homeScore: 0, awayScore: 2 }, // EXACT ✓
      { matchId: "g019", homeScore: 2, awayScore: 1 }, // EXACT ✓
      { matchId: "g020", homeScore: 3, awayScore: 0 }, // EXACT ✓
      { matchId: "g023", homeScore: 3, awayScore: 0 }, // EXACT ✓
      { matchId: "g021", homeScore: 2, awayScore: 1 }, // EXACT ✓
      { matchId: "g027", homeScore: 2, awayScore: 1 }, // WRONG ✗
      { matchId: "g008", homeScore: 0, awayScore: 2 }, // EXACT ✓
      { matchId: "g007", homeScore: 0, awayScore: 2 }, // EXACT ✓
    ],
  },
];

// ── Scoring engine ─────────────────────────────────────────────────────────
export interface LeaderboardEntry {
  member: MockMember;
  points: number;
  exactScores: number;
  correctOutcomes: number;
  breakdown: Array<{ matchId: string; pts: number; type: "exact" | "outcome" | "wrong" | "ko" }>;
}

export function scoreMatch(
  pred: MockPrediction,
  result: SimulatedResult,
  rules: ScoringRules
): { pts: number; type: "exact" | "outcome" | "wrong" | "ko" } {
  const pHome = pred.homeScore;
  const pAway = pred.awayScore;
  const rHome = result.homeScore;
  const rAway = result.awayScore;

  // Exact score
  if (pHome === rHome && pAway === rAway) return { pts: rules.exactScore, type: "exact" };

  // Correct outcome
  const predWinner = pHome > pAway ? "home" : pHome < pAway ? "away" : "draw";
  const realWinner = rHome > rAway ? "home" : rHome < rAway ? "away" : "draw";
  if (predWinner === realWinner) return { pts: rules.correctOutcome, type: "outcome" };

  return { pts: 0, type: "wrong" };
}

export function calculateLeaderboard(
  members: MockMember[],
  results: SimulatedResult[],
  rules: ScoringRules
): LeaderboardEntry[] {
  return members
    .map(member => {
      let points = 0;
      let exactScores = 0;
      let correctOutcomes = 0;
      const breakdown: LeaderboardEntry["breakdown"] = [];

      results.forEach(result => {
        const pred = member.predictions.find(p => p.matchId === result.matchId);
        if (!pred) return;
        const { pts, type } = scoreMatch(pred, result, rules);
        points += pts;
        if (type === "exact") exactScores++;
        if (type === "outcome") correctOutcomes++;
        breakdown.push({ matchId: result.matchId, pts, type });
      });

      return { member, points, exactScores, correctOutcomes, breakdown };
    })
    .sort((a, b) => b.points - a.points || b.exactScores - a.exactScores);
}

export function getMatchWinners(
  members: MockMember[],
  result: SimulatedResult,
  rules: ScoringRules
): Array<{ member: MockMember; pts: number; type: "exact" | "outcome" | "wrong" | "ko" }> {
  return members
    .map(member => {
      const pred = member.predictions.find(p => p.matchId === result.matchId);
      if (!pred) return { member, pts: 0, type: "wrong" as const };
      const { pts, type } = scoreMatch(pred, result, rules);
      return { member, pts, type };
    })
    .filter(w => w.pts > 0)
    .sort((a, b) => b.pts - a.pts);
}