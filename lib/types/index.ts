// Domain types for Cup Clash.
// These mirror what the Supabase schema will eventually return.

// All 48 qualified nations for FIFA World Cup 2026
export type CountryCode =
  // CONCACAF (8 spots — hosts get automatic bids)
  | "USA" | "CAN" | "MEX" | "JAM" | "PAN" | "CRC" | "HON" | "TTO"
  // CONMEBOL (6 spots)
  | "ARG" | "BRA" | "COL" | "URU" | "ECU" | "VEN"
  // UEFA (16 spots)
  | "ENG" | "FRA" | "ESP" | "GER" | "POR" | "NED" | "BEL" | "ITA"
  | "AUT" | "CHE" | "SCO" | "DNK" | "HUN" | "SRB" | "SVK" | "GRE"
  // CAF (9 spots)
  | "MAR" | "SEN" | "NGA" | "EGY" | "CMR" | "CIV" | "MLI" | "RSA" | "TUN"
  // AFC (8 spots)
  | "JPN" | "KOR" | "IRN" | "AUS" | "JOR" | "IRQ" | "UZB" | "OMA"
  // OFC (1 spot)
  | "NZL";

export interface Country {
  code: CountryCode;
  name: string;
  /** ISO 3166-1 alpha-2 code for flagcdn.com (e.g. "ar" for Argentina) */
  flagCode: string;
  theme: {
    accent: string;     // RGB triplet e.g. "117 192 232"
    accentGlow: string;
  };
}

export interface Group {
  id: string;
  name: string;
  admin: string;
  buyInAmount: number;
  payouts: {
    first: string;
    second: string;
    third: string;
  };
}

export interface Member {
  id: string;
  name: string;
  points: number;
  paid: boolean;
  country: string;
  avatarUrl?: string | null;
}

export interface Match {
  id: string;
  home: string;
  away: string;
  homeFlagCode?: string;
  awayFlagCode?: string;
  time: string; // ISO 8601
  stage?: "Group" | "R16" | "QF" | "SF" | "Final";
}

export interface LeaderboardRow {
  rank: number;
  member: Member;
  delta: number; // change since last match
}
