// Domain types for Cup Clash.
// These mirror what the Supabase schema will eventually return.

export type CountryCode =
  | "ARG"
  | "BRA"
  | "ENG"
  | "FRA"
  | "ESP"
  | "GER"
  | "POR"
  | "ITA"
  | "NED"
  | "ISR"
  | "USA"
  | "MEX";

export interface Country {
  code: CountryCode;
  name: string;
  flag: string; // emoji
  // Theme tokens — fed into CSS variables for dynamic theming
  theme: {
    accent: string;     // e.g. "135 213 255"  (sky blue, RGB triplet)
    accentGlow: string; // e.g. "200 230 255"
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
}

export interface Match {
  id: string;
  home: string;
  away: string;
  homeFlag?: string;
  awayFlag?: string;
  time: string; // ISO 8601
  stage?: "Group" | "R16" | "QF" | "SF" | "Final";
}

export interface LeaderboardRow {
  rank: number;
  member: Member;
  delta: number; // change since last match
}
