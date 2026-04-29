/**
 * Cup Clash — Scoring Engine
 * Default system: 3/2/1 points
 * Admin can switch to legacy 10/25 system or custom values.
 *
 * DEFAULT SCORING (3/2/1):
 *   3 pts — Exact score (e.g. predicted 2-1, result was 2-1)
 *   2 pts — Predicted home team wins AND got their exact goals right
 *           (e.g. predicted 2-1, result was 2-0 → home scored 2 ✓, win ✓ = 2pts)
 *   1 pt  — Correct outcome only (W/D/L)
 *           On a draw: 3 pts for exact score, 1 pt for just predicting a draw
 *
 * KNOCKOUT BONUS:
 *   +20 pts (or admin-set value) for correctly picking who advances
 *
 * TOURNAMENT PICKS:
 *   Winner: 6 pts (default, admin-configurable)
 *   2nd place: 4 pts
 *   3rd place: 2 pts
 *   Best 3rd place qualifier: 1 pt each (8 picks)
 *   Top scorer: 3 pts
 *   Top assister: 3 pts
 *   Golden Ball: 2 pts
 *   Golden Glove: 2 pts
 */

export interface ScoringConfig {
  // Match scoring
  exactScore:       number; // default 3
  exactHomeGoals:   number; // default 2 (correct winner + exact home goals)
  correctOutcome:   number; // default 1
  // Draw special
  exactDraw:        number; // default 3 (exact 0-0 or 1-1 etc)
  correctDraw:      number; // default 1

  // Knockout
  koAdvancement:    number; // default 20

  // Tournament picks
  tournamentWinner: number; // default 6
  second:           number; // default 4
  third:            number; // default 2
  bestThird:        number; // default 1 (per correct 3rd-place qualifier, 8 slots)
  topScorer:        number; // default 3
  topAssister:      number; // default 3
  goldenBall:       number; // default 2
  goldenGlove:      number; // default 2

  // Trivia
  triviaPerQuestion: number; // default 1 (max 20 questions)

  // Feature toggles
  enableSecond:       boolean;
  enableThird:        boolean;
  enableBestThird:    boolean;
  enableTopScorer:    boolean;
  enableTopAssister:  boolean;
  enableGoldenBall:   boolean;
  enableGoldenGlove:  boolean;
  enableKoAdvancement: boolean;
  enableTrivia:       boolean;

  // Admin fee
  adminFeePercent: number; // default 0
}

export const DEFAULT_SCORING: ScoringConfig = {
  exactScore:       3,
  exactHomeGoals:   2,
  correctOutcome:   1,
  exactDraw:        3,
  correctDraw:      1,
  koAdvancement:    20,
  tournamentWinner: 6,
  second:           4,
  third:            2,
  bestThird:        1,
  topScorer:        3,
  topAssister:      3,
  goldenBall:       2,
  goldenGlove:      2,
  triviaPerQuestion: 1,
  enableSecond:       true,
  enableThird:        true,
  enableBestThird:    true,
  enableTopScorer:    true,
  enableTopAssister:  true,
  enableGoldenBall:   true,
  enableGoldenGlove:  true,
  enableKoAdvancement: true,
  enableTrivia:       false,
  adminFeePercent:    0,
};

export interface MatchResult {
  homeScore: number;
  awayScore: number;
}

export interface MatchPrediction {
  homeScore: number;
  awayScore: number;
  advancementPick?: string;
}

export interface ScoreResult {
  points: number;
  breakdown: string[];
  isExact: boolean;
}

/**
 * Score a match prediction against the real result.
 * Uses the 3/2/1 default system.
 */
export function scoreMatch(
  pred: MatchPrediction,
  result: MatchResult,
  config: ScoringConfig = DEFAULT_SCORING,
  isKnockout = false
): ScoreResult {
  const breakdown: string[] = [];
  let points = 0;

  const isDraw = result.homeScore === result.awayScore;
  const isExact = pred.homeScore === result.homeScore && pred.awayScore === result.awayScore;
  const predOutcome = Math.sign(pred.homeScore - pred.awayScore);
  const realOutcome = Math.sign(result.homeScore - result.awayScore);
  const correctOutcome = predOutcome === realOutcome;

  if (isExact) {
    const pts = isDraw ? config.exactDraw : config.exactScore;
    points += pts;
    breakdown.push(`Exact score ${pred.homeScore}-${pred.awayScore} +${pts}`);
  } else if (!isDraw && correctOutcome && pred.homeScore === result.homeScore) {
    // Correct winner AND exact home goals (e.g. predicted 2-1, result 2-0)
    points += config.exactHomeGoals;
    breakdown.push(`Correct winner + exact home goals +${config.exactHomeGoals}`);
  } else if (!isDraw && correctOutcome && pred.awayScore === result.awayScore) {
    // Correct winner AND exact away goals
    points += config.exactHomeGoals;
    breakdown.push(`Correct winner + exact away goals +${config.exactHomeGoals}`);
  } else if (correctOutcome) {
    const pts = isDraw ? config.correctDraw : config.correctOutcome;
    points += pts;
    breakdown.push(`Correct ${isDraw ? "draw" : "outcome"} +${pts}`);
  }

  // Knockout advancement bonus
  if (isKnockout && config.enableKoAdvancement && pred.advancementPick) {
    // advancementPick is compared against the actual advancing team (passed separately)
    // handled at call site
  }

  return { points, breakdown, isExact };
}

/**
 * Calculate the maximum possible points for a tournament with given config.
 */
export function maxPossiblePoints(config: ScoringConfig): number {
  const TOTAL_MATCHES = 104;
  const KO_MATCHES = 32;

  let max = config.exactScore * TOTAL_MATCHES;
  if (config.enableKoAdvancement) max += config.koAdvancement * KO_MATCHES;
  max += config.tournamentWinner;
  if (config.enableSecond)    max += config.second;
  if (config.enableThird)     max += config.third;
  if (config.enableBestThird) max += config.bestThird * 8;
  if (config.enableTopScorer)  max += config.topScorer;
  if (config.enableTopAssister) max += config.topAssister;
  if (config.enableGoldenBall) max += config.goldenBall;
  if (config.enableGoldenGlove) max += config.goldenGlove;
  if (config.enableTrivia)    max += config.triviaPerQuestion * 20;

  return max;
}

/**
 * Example scoring table for group rules display.
 */
export const SCORING_EXAMPLES = [
  {
    match: "Brazil 2 - 1 France",
    predictions: [
      { guess: "2-1", label: "Exact score", points: 3 },
      { guess: "2-0", label: "Home wins + exact home goals (2)", points: 2 },
      { guess: "3-1", label: "Home wins + exact away goals (1)", points: 2 },
      { guess: "1-0", label: "Correct outcome (home win)", points: 1 },
      { guess: "1-1", label: "Wrong outcome (draw)", points: 0 },
    ]
  },
  {
    match: "Spain 1 - 1 Germany",
    predictions: [
      { guess: "1-1", label: "Exact draw score", points: 3 },
      { guess: "2-2", label: "Correct draw (wrong score)", points: 1 },
      { guess: "2-0", label: "Wrong outcome (Spain win)", points: 0 },
    ]
  }
];
