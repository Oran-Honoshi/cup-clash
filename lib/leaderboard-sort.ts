// Minimal shape the ranking comparator needs — satisfied structurally by the
// full Member type as well as lighter ad-hoc row objects (e.g. CSV export).
export interface RankableMember {
  points:                   number;
  exactScores?:             number;
  finalGoalMinuteDistance?: number;
  correctWinnerPick?:       boolean;
}

// Golden Guess leaderboard ranking — 4-tier tiebreaker:
//   1. Total points (desc)
//   2. Exact score count (desc)
//   3. |predicted - actual| Final first-goal minute (asc, closest wins)
//   4. Correct Tournament Winner pick (correct ranks above incorrect/pending)
// Any two members still tied after all four tiers are a genuine tie —
// see the admin "Split the Pot" flow for payout positions.
export function compareMembersForRanking<T extends RankableMember>(a: T, b: T): number {
  if (b.points !== a.points) return b.points - a.points;

  const aExact = a.exactScores ?? 0;
  const bExact = b.exactScores ?? 0;
  if (bExact !== aExact) return bExact - aExact;

  const aDist = a.finalGoalMinuteDistance ?? Infinity;
  const bDist = b.finalGoalMinuteDistance ?? Infinity;
  if (aDist !== bDist) return aDist - bDist;

  const aWin = a.correctWinnerPick ? 1 : 0;
  const bWin = b.correctWinnerPick ? 1 : 0;
  if (bWin !== aWin) return bWin - aWin;

  return 0;
}

export function sortMembersForRanking<T extends RankableMember>(members: T[]): T[] {
  return [...members].sort(compareMembersForRanking);
}

export type PayoutPosition = "first" | "second" | "third";
export const PAYOUT_POSITIONS: PayoutPosition[] = ["first", "second", "third"];

export interface PayoutTieGroup<T> {
  members:   T[];
  positions: PayoutPosition[];
}

// Given members already sorted by compareMembersForRanking, find genuine
// ties (identical across all 4 tiers) that land on a 1st/2nd/3rd payout
// position. A tie spanning more than one position (e.g. 3-way tie for 1st)
// is returned as a single group covering all the positions it occupies.
export function findPayoutTieGroups<T extends RankableMember>(sortedMembers: T[]): PayoutTieGroup<T>[] {
  const groups: PayoutTieGroup<T>[] = [];
  let i = 0;
  let posIndex = 0;

  while (i < sortedMembers.length && posIndex < PAYOUT_POSITIONS.length) {
    let j = i;
    while (j + 1 < sortedMembers.length && compareMembersForRanking(sortedMembers[j], sortedMembers[j + 1]) === 0) {
      j++;
    }
    const groupMembers = sortedMembers.slice(i, j + 1);
    const positions = PAYOUT_POSITIONS.slice(posIndex, posIndex + groupMembers.length);

    if (groupMembers.length > 1 && positions.length > 0) {
      groups.push({ members: groupMembers, positions });
    }

    posIndex += groupMembers.length;
    i = j + 1;
  }

  return groups;
}
