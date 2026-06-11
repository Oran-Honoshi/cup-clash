// ── Core types ────────────────────────────────────────────────────────────────

export type CountryCode = string;

export interface Country {
  name:     string;
  flagCode: CountryCode;
  code?:    CountryCode;
  flag?:    string;
  theme?:   {
    accent:      string;
    accentGlow:  string;
  };
}

export interface Group {
  id:                  string;
  name:                string;
  admin:               string;
  buyInAmount:         number;
  passkey:             string;
  maxMembers:          number;
  enrollmentFeeCents:  number;
  enrollmentDeadline:  string | null;
  corporatePrize:          string | null;
  isCorporatePaid:         boolean;
  currency:                string;
  currencySymbol:          string;
  paymentLink:             string | null;
  enableGroupStagePrize:   boolean;
  groupStagePrizeAmount:   number | null;
  groupStagePrizeLabel:    string | null;
  showPrizeSplit:          boolean;
  showEntryFee:            boolean;
  showPrizePot:            boolean;
  showBuyInTracker:        boolean;
  showPaymentLink:         boolean;
  groupMode:               string;
  winnerMessage:           string | null;
  payouts: {
    first:  string;  // "60%"
    second: string;  // "30%"
    third:  string;  // "10%"
  };
}

export interface Member {
  id:                  string;
  name:                string;
  points:              number;
  paid:                boolean;
  country:             string;
  avatarUrl?:          string | null;
  rankDelta?:          number;
  exactScores?:        number;
  correctPredictions?: number;
  isGhost?:            boolean;
  canPredict?:         boolean;
  stakePaid?:          boolean;
  joinedAt?:           string;
  role?:               'member' | 'admin' | 'owner';
}

export interface Match {
  id:           string;
  home:         string;
  away:         string;
  homeFlagCode?: string;
  awayFlagCode?: string;
  time:         string;
  utcTime?:     string;
  stage:        "Group" | "R32" | "R16" | "QF" | "SF" | "3rd" | "Final";
  group?:       string;
  stadium?:     string;
  city?:        string;
  homeScore?:   number;
  awayScore?:   number;
  status?:      string;
}

export interface Prediction {
  matchId:    string;
  homeScore:  number;
  awayScore:  number;
  lockedAt?:  string | null;
  pointsEarned?: number;
  isExact?:   boolean;
}

export interface ScoringRules {
  correctOutcome:        number;
  exactScore:            number;
  gsCorrectOutcome:      number;
  gsExactScore:          number;
  r32CorrectOutcome:     number;
  r32ExactScore:         number;
  r16CorrectOutcome:     number;
  r16ExactScore:         number;
  qfCorrectOutcome:      number;
  qfExactScore:          number;
  sfCorrectOutcome:      number;
  sfExactScore:          number;
  thirdCorrectOutcome:   number;
  thirdExactScore:       number;
  finalCorrectOutcome:   number;
  finalExactScore:       number;
  useProgressiveScoring: boolean;
}

export interface Payment {
  id:               string;
  userId:           string | null;
  groupId:          string;
  email:            string;
  status:           "pending" | "paid" | "refunded";
  amountCents:      number;
  paymentTimestamp: string | null;
  refundExpiry:     string | null;
  stakePaid:        boolean;
}