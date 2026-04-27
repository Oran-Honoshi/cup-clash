// Auto-generated types matching our Supabase schema.
// When schema changes, regenerate with:
//   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          country: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          country?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          country?: string | null;
          avatar_url?: string | null;
        };
      };
      groups: {
        Row: {
          id: string;
          name: string;
          admin_id: string;
          buy_in_amount: number;
          payout_first: number;
          payout_second: number;
          payout_third: number;
          max_members: number;
          invite_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          admin_id: string;
          buy_in_amount?: number;
          payout_first?: number;
          payout_second?: number;
          payout_third?: number;
          max_members?: number;
          invite_code?: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          buy_in_amount?: number;
          payout_first?: number;
          payout_second?: number;
          payout_third?: number;
          max_members?: number;
        };
      };
      group_members: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          paid: boolean;
          joined_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          paid?: boolean;
          joined_at?: string;
        };
        Update: {
          paid?: boolean;
        };
      };
      matches: {
        Row: {
          id: string;
          home: string;
          away: string;
          home_flag: string | null;
          away_flag: string | null;
          kickoff_at: string;
          stage: string;
          group_letter: string | null;
          stadium: string | null;
          city: string | null;
          host_country: string | null;
          home_score: number | null;
          away_score: number | null;
          status: string;
        };
        Insert: {
          id: string;
          home: string;
          away: string;
          home_flag?: string | null;
          away_flag?: string | null;
          kickoff_at: string;
          stage: string;
          group_letter?: string | null;
          stadium?: string | null;
          city?: string | null;
          host_country?: string | null;
          home_score?: number | null;
          away_score?: number | null;
          status?: string;
        };
        Update: {
          home_score?: number | null;
          away_score?: number | null;
          status?: string;
          home?: string;
          away?: string;
        };
      };
      predictions: {
        Row: {
          id: string;
          user_id: string;
          group_id: string;
          match_id: string | null;
          home_score: number | null;
          away_score: number | null;
          pred_type: string | null;
          pred_value: string | null;
          points_earned: number;
          is_exact: boolean;
          locked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          group_id: string;
          match_id?: string | null;
          home_score?: number | null;
          away_score?: number | null;
          pred_type?: string | null;
          pred_value?: string | null;
          points_earned?: number;
          is_exact?: boolean;
          locked_at?: string | null;
          created_at?: string;
        };
        Update: {
          home_score?: number | null;
          away_score?: number | null;
          pred_value?: string | null;
          locked_at?: string | null;
        };
      };
    };
    Views: {
      leaderboard: {
        Row: {
          group_id: string;
          user_id: string;
          name: string;
          country: string | null;
          paid: boolean;
          total_points: number;
          exact_scores: number;
          rank: number;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
