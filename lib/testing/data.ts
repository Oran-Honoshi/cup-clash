// ============================================================
// CUP CLASH — TESTING DATA
// Pre-filled predictions for 4 mock members across first 12 matches
// Used by the Test Control Panel to simulate a real tournament
// ============================================================

export interface MockPrediction {
  matchId: string;
  homeScore: number;
  awayScore: number;
  advancementPick?: string; // team name — only for knockout matches
}

export interface MockMember {
  id: string;
  name: string;
  country: string;
  flagCode: string;
  predictions: MockPrediction[];
}

export interface SimulatedResult {
  matchId: string;
  home: string;
  away: string;
  homeFlagCode: string;
  awayFlagCode: string;
  homeScore: number;       // 90-min score
  awayScore: number;       // 90-min score
  stage: string;
  stadium: string;
  city: string;
  isKnockout?: boolean;
  advancedTeam?: string;   // who actually advanced (may differ from 90-min winner due to pens)
  wentToPenalties?: boolean;
}

// The matches we'll simulate results for, in order
export const SIMULATED_MATCHES: SimulatedResult[] = [
  { matchId: "g001", home: "Mexico",    away: "Ecuador",   homeFlagCode: "mx", awayFlagCode: "ec", homeScore: 2, awayScore: 1, stage: "Group A", stadium: "Estadio Azteca",        city: "Mexico City"  },
  { matchId: "g002", home: "USA",       away: "Panama",    homeFlagCode: "us", awayFlagCode: "pa", homeScore: 3, awayScore: 0, stage: "Group B", stadium: "SoFi Stadium",            city: "Los Angeles"  },
  { matchId: "g003", home: "Canada",    away: "Honduras",  homeFlagCode: "ca", awayFlagCode: "hn", homeScore: 1, awayScore: 1, stage: "Group C", stadium: "BC Place",                city: "Vancouver"    },
  { matchId: "g004", home: "France",    away: "Nigeria",   homeFlagCode: "fr", awayFlagCode: "ng", homeScore: 2, awayScore: 0, stage: "Group D", stadium: "MetLife Stadium",          city: "New York/NJ"  },
  { matchId: "g005", home: "Argentina", away: "Colombia",  homeFlagCode: "ar", awayFlagCode: "co", homeScore: 1, awayScore: 0, stage: "Group E", stadium: "AT&T Stadium",             city: "Dallas"       },
  { matchId: "g006", home: "England",   away: "Senegal",   homeFlagCode: "gb-eng", awayFlagCode: "sn", homeScore: 2, awayScore: 2, stage: "Group F", stadium: "Hard Rock Stadium", city: "Miami"        },
  { matchId: "g007", home: "Spain",     away: "Morocco",   homeFlagCode: "es", awayFlagCode: "ma", homeScore: 3, awayScore: 1, stage: "Group G", stadium: "Lincoln Financial Field", city: "Philadelphia" },
  { matchId: "g008", home: "Germany",   away: "Japan",     homeFlagCode: "de", awayFlagCode: "jp", homeScore: 2, awayScore: 2, stage: "Group H", stadium: "Gillette Stadium",        city: "Boston"       },
  { matchId: "g009", home: "Brazil",    away: "Uruguay",   homeFlagCode: "br", awayFlagCode: "uy", homeScore: 3, awayScore: 0, stage: "Group I", stadium: "Estadio BBVA",           city: "Monterrey"    },
  { matchId: "g010", home: "Portugal",  away: "Iran",      homeFlagCode: "pt", awayFlagCode: "ir", homeScore: 1, awayScore: 1, stage: "Group J", stadium: "Arrowhead Stadium",       city: "Kansas City"  },
  { matchId: "g011", home: "Netherlands", away: "Australia", homeFlagCode: "nl", awayFlagCode: "au", homeScore: 2, awayScore: 1, stage: "Group K", stadium: "Levi's Stadium",      city: "San Francisco"},
  { matchId: "g012", home: "Italy",     away: "Egypt",     homeFlagCode: "it", awayFlagCode: "eg", homeScore: 2, awayScore: 0, stage: "Group L", stadium: "Estadio Akron",          city: "Guadalajara"  },
  // KNOCKOUT STAGE — Round of 32 (simulated)
  { matchId: "r32-1", home: "Mexico", away: "France", homeFlagCode: "mx", awayFlagCode: "fr", homeScore: 1, awayScore: 1, stage: "Round of 32", stadium: "MetLife Stadium", city: "New York/NJ", isKnockout: true, advancedTeam: "France", wentToPenalties: true },
  { matchId: "r32-2", home: "Argentina", away: "USA", homeFlagCode: "ar", awayFlagCode: "us", homeScore: 2, awayScore: 0, stage: "Round of 32", stadium: "SoFi Stadium", city: "Los Angeles", isKnockout: true, advancedTeam: "Argentina", wentToPenalties: false },
  // QUARTER-FINAL (simulated)
  { matchId: "qf-1", home: "France", away: "Spain", homeFlagCode: "fr", awayFlagCode: "es", homeScore: 2, awayScore: 1, stage: "Quarter-Final", stadium: "MetLife Stadium", city: "New York/NJ", isKnockout: true, advancedTeam: "France", wentToPenalties: false },
  // SEMI-FINAL (simulated)
  { matchId: "sf-1", home: "Argentina", away: "France", homeFlagCode: "ar", awayFlagCode: "fr", homeScore: 1, awayScore: 1, stage: "Semi-Final", stadium: "MetLife Stadium", city: "New York/NJ", isKnockout: true, advancedTeam: "Argentina", wentToPenalties: true },
];

// 4 mock members with varied predictions — some right, some wrong, some exact
export const MOCK_TEST_MEMBERS: MockMember[] = [
  {
    id: "test-amit",
    name: "Amit",
    country: "Argentina",
    flagCode: "ar",
    predictions: [
      { matchId: "g001", homeScore: 2, awayScore: 1 }, // EXACT ✓ +25
      { matchId: "g002", homeScore: 2, awayScore: 0 }, // OUTCOME ✓ +10
      { matchId: "g003", homeScore: 1, awayScore: 1 }, // EXACT ✓ +25
      { matchId: "g004", homeScore: 1, awayScore: 0 }, // OUTCOME ✓ +10
      { matchId: "g005", homeScore: 1, awayScore: 0 }, // EXACT ✓ +25
      { matchId: "g006", homeScore: 1, awayScore: 2 }, // WRONG ✗ 0
      { matchId: "g007", homeScore: 3, awayScore: 1 }, // EXACT ✓ +25
      { matchId: "g008", homeScore: 2, awayScore: 1 }, // OUTCOME ✓ +10
      { matchId: "g009", homeScore: 3, awayScore: 0 }, // EXACT ✓ +25
      { matchId: "g010", homeScore: 2, awayScore: 0 }, // WRONG ✗ 0
      { matchId: "g011", homeScore: 2, awayScore: 1 }, // EXACT ✓ +25
      { matchId: "g012", homeScore: 2, awayScore: 0 }, // EXACT ✓ +25
      // Knockout picks
      { matchId: "r32-1", homeScore: 1, awayScore: 1, advancementPick: "France" },    // draw EXACT ✓ +25, advancement ✓ +20
      { matchId: "r32-2", homeScore: 2, awayScore: 0, advancementPick: "Argentina" }, // EXACT ✓ +25, advancement ✓ +20
      { matchId: "qf-1",  homeScore: 1, awayScore: 0, advancementPick: "France" },    // OUTCOME ✓ +10, advancement ✓ +20
      { matchId: "sf-1",  homeScore: 1, awayScore: 1, advancementPick: "France" },    // draw EXACT ✓ +25, advancement ✗ 0
    ],
  },
  {
    id: "test-sarah",
    name: "Sarah",
    country: "Brazil",
    flagCode: "br",
    predictions: [
      { matchId: "g001", homeScore: 1, awayScore: 0 }, // OUTCOME ✓ +10
      { matchId: "g002", homeScore: 3, awayScore: 0 }, // EXACT ✓ +25
      { matchId: "g003", homeScore: 2, awayScore: 0 }, // WRONG ✗ 0
      { matchId: "g004", homeScore: 2, awayScore: 0 }, // EXACT ✓ +25
      { matchId: "g005", homeScore: 2, awayScore: 1 }, // OUTCOME ✓ +10
      { matchId: "g006", homeScore: 2, awayScore: 2 }, // EXACT ✓ +25
      { matchId: "g007", homeScore: 2, awayScore: 0 }, // OUTCOME ✓ +10
      { matchId: "g008", homeScore: 1, awayScore: 1 }, // OUTCOME ✓ +10
      { matchId: "g009", homeScore: 2, awayScore: 0 }, // OUTCOME ✓ +10
      { matchId: "g010", homeScore: 1, awayScore: 1 }, // EXACT ✓ +25
      { matchId: "g011", homeScore: 1, awayScore: 0 }, // OUTCOME ✓ +10
      { matchId: "g012", homeScore: 1, awayScore: 0 }, // OUTCOME ✓ +10
      // Knockout picks
      { matchId: "r32-1", homeScore: 0, awayScore: 1, advancementPick: "France" },    // WRONG ✗ 0, advancement ✓ +20
      { matchId: "r32-2", homeScore: 1, awayScore: 0, advancementPick: "Argentina" }, // WRONG ✗ 0, advancement ✓ +20
      { matchId: "qf-1",  homeScore: 2, awayScore: 1, advancementPick: "Spain" },     // OUTCOME ✓ +10, advancement ✗ 0
      { matchId: "sf-1",  homeScore: 0, awayScore: 1, advancementPick: "Argentina" }, // WRONG ✗ 0, advancement ✓ +20
    ],
  },
  {
    id: "test-john",
    name: "John",
    country: "England",
    flagCode: "gb-eng",
    predictions: [
      { matchId: "g001", homeScore: 0, awayScore: 1 }, // WRONG ✗ 0
      { matchId: "g002", homeScore: 1, awayScore: 0 }, // OUTCOME ✓ +10
      { matchId: "g003", homeScore: 0, awayScore: 0 }, // OUTCOME ✓ +10
      { matchId: "g004", homeScore: 3, awayScore: 0 }, // OUTCOME ✓ +10
      { matchId: "g005", homeScore: 0, awayScore: 0 }, // WRONG ✗ 0
      { matchId: "g006", homeScore: 2, awayScore: 2 }, // EXACT ✓ +25
      { matchId: "g007", homeScore: 2, awayScore: 1 }, // OUTCOME ✓ +10
      { matchId: "g008", homeScore: 3, awayScore: 1 }, // OUTCOME ✓ +10
      { matchId: "g009", homeScore: 2, awayScore: 0 }, // OUTCOME ✓ +10
      { matchId: "g010", homeScore: 0, awayScore: 0 }, // OUTCOME ✓ +10
      { matchId: "g011", homeScore: 3, awayScore: 0 }, // WRONG ✗ 0
      { matchId: "g012", homeScore: 2, awayScore: 0 }, // EXACT ✓ +25
      // Knockout picks
      { matchId: "r32-1", homeScore: 2, awayScore: 0, advancementPick: "Mexico" },    // WRONG ✗ 0, advancement ✗ 0
      { matchId: "r32-2", homeScore: 2, awayScore: 0, advancementPick: "Argentina" }, // EXACT ✓ +25, advancement ✓ +20
      { matchId: "qf-1",  homeScore: 2, awayScore: 1, advancementPick: "France" },    // OUTCOME ✓ +10, advancement ✓ +20
      { matchId: "sf-1",  homeScore: 2, awayScore: 0, advancementPick: "Argentina" }, // WRONG ✗ 0, advancement ✓ +20
    ],
  },
  {
    id: "test-lior",
    name: "Lior",
    country: "Israel",
    flagCode: "il",
    predictions: [
      { matchId: "g001", homeScore: 1, awayScore: 1 }, // WRONG ✗ 0
      { matchId: "g002", homeScore: 2, awayScore: 1 }, // OUTCOME ✓ +10
      { matchId: "g003", homeScore: 2, awayScore: 1 }, // WRONG ✗ 0
      { matchId: "g004", homeScore: 1, awayScore: 0 }, // OUTCOME ✓ +10
      { matchId: "g005", homeScore: 2, awayScore: 0 }, // OUTCOME ✓ +10
      { matchId: "g006", homeScore: 1, awayScore: 0 }, // WRONG ✗ 0
      { matchId: "g007", homeScore: 3, awayScore: 1 }, // EXACT ✓ +25
      { matchId: "g008", homeScore: 2, awayScore: 2 }, // EXACT ✓ +25
      { matchId: "g009", homeScore: 3, awayScore: 0 }, // EXACT ✓ +25
      { matchId: "g010", homeScore: 2, awayScore: 1 }, // WRONG ✗ 0
      { matchId: "g011", homeScore: 2, awayScore: 1 }, // EXACT ✓ +25
      { matchId: "g012", homeScore: 1, awayScore: 0 }, // OUTCOME ✓ +10
      // Knockout picks
      { matchId: "r32-1", homeScore: 1, awayScore: 1, advancementPick: "Mexico" },    // EXACT ✓ +25, advancement ✗ 0
      { matchId: "r32-2", homeScore: 1, awayScore: 0, advancementPick: "Argentina" }, // OUTCOME ✓ +10, advancement ✓ +20
      { matchId: "qf-1",  homeScore: 1, awayScore: 0, advancementPick: "France" },    // OUTCOME ✓ +10, advancement ✓ +20
      { matchId: "sf-1",  homeScore: 1, awayScore: 1, advancementPick: "Argentina" }, // EXACT ✓ +25, advancement ✓ +20
    ],
  },
];

// Score a prediction against a result
export function scorePrediction(
  pred: { homeScore: number; awayScore: number; advancementPick?: string },
  result: SimulatedResult,
  rules: ScoringRules
): { points: number; isExact: boolean; breakdown: string[] } {
  const predOutcome = Math.sign(pred.homeScore - pred.awayScore);
  const realOutcome = Math.sign(result.homeScore - result.awayScore);

  const isExact =
    pred.homeScore === result.homeScore &&
    pred.awayScore === result.awayScore;

  let points = 0;
  const breakdown: string[] = [];

  // 90-min score points
  if (isExact) {
    points += rules.exactScore;
    breakdown.push(`Exact score +${rules.exactScore}`);
  } else if (predOutcome === realOutcome) {
    points += rules.correctOutcome;
    breakdown.push(`Correct outcome +${rules.correctOutcome}`);
  }

  // Knockout advancement bonus (+20)
  if (result.isKnockout && pred.advancementPick && result.advancedTeam) {
    if (pred.advancementPick === result.advancedTeam) {
      points += rules.knockoutAdvancement;
      breakdown.push(`Correct advancement +${rules.knockoutAdvancement}`);
    }
  }

  return { points, isExact, breakdown };
}

export interface ScoringRules {
  correctOutcome: number;
  exactScore: number;
  knockoutAdvancement: number; // +20 for correctly picking who advances
  tournamentWinner: number;
  topScorer: number;
  topAssister: number;
}

export const DEFAULT_SCORING_RULES: ScoringRules = {
  correctOutcome: 10,
  exactScore: 25,
  knockoutAdvancement: 20,
  tournamentWinner: 100,
  topScorer: 50,
  topAssister: 50,
};

// Calculate running leaderboard from results uploaded so far
export function calculateLeaderboard(
  members: MockMember[],
  results: SimulatedResult[],
  rules: ScoringRules
) {
  return members.map((member) => {
    let totalPoints = 0;
    let exactCount = 0;
    const matchResults: Array<{
      matchId: string;
      home: string;
      away: string;
      predicted: string;
      advancementPick?: string;
      actual: string;
      advancedTeam?: string;
      points: number;
      isExact: boolean;
      breakdown: string[];
      isKnockout: boolean;
    }> = [];

    results.forEach((result) => {
      const pred = member.predictions.find((p) => p.matchId === result.matchId);
      if (!pred) return;

      const { points, isExact, breakdown } = scorePrediction(pred, result, rules);
      totalPoints += points;
      if (isExact) exactCount++;

      matchResults.push({
        matchId: result.matchId,
        home: result.home,
        away: result.away,
        predicted: `${pred.homeScore}–${pred.awayScore}`,
        advancementPick: pred.advancementPick,
        actual: `${result.homeScore}–${result.awayScore}`,
        advancedTeam: result.advancedTeam,
        points,
        isExact,
        breakdown,
        isKnockout: result.isKnockout ?? false,
      });
    });

    return { member, totalPoints, exactCount, matchResults };
  }).sort((a, b) => b.totalPoints - a.totalPoints);
}

// Find match winners (highest scorers for a specific match)
export function getMatchWinners(
  members: MockMember[],
  result: SimulatedResult,
  rules: ScoringRules
) {
  const scores = members.map((member) => {
    const pred = member.predictions.find((p) => p.matchId === result.matchId);
    if (!pred) return { member, points: 0, isExact: false, predicted: "—", advancementPick: undefined as string | undefined };
    const { points, isExact } = scorePrediction(pred, result, rules);
    return {
      member,
      points,
      isExact,
      predicted: `${pred.homeScore}–${pred.awayScore}`,
      advancementPick: pred.advancementPick,
    };
  });

  const maxPoints = Math.max(...scores.map((s) => s.points));
  if (maxPoints === 0) return [];
  return scores.filter((s) => s.points === maxPoints);
}
