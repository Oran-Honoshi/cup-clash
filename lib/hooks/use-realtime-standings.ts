"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { TeamStanding } from "@/components/dashboard/group-standings";

function getClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * useRealtimeStandings — subscribes to Supabase Realtime for match result updates.
 * When a new match result is inserted, re-fetches standings for the affected group.
 *
 * Falls back to static standings if Supabase isn't configured.
 */
export function useRealtimeStandings(
  groupId: string,
  initialStandings: Record<string, TeamStanding[]>
) {
  const [standings, setStandings] = useState(initialStandings);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLive, setIsLive] = useState(false);

  const refetchStandings = useCallback(async () => {
    const sb = getClient();
    if (!sb) return;

    try {
      // Fetch match results from Supabase and recalculate standings
      const { data: matches } = await sb
        .from("matches")
        .select("home_team, away_team, home_score, away_score, group_letter, status")
        .eq("status", "finished")
        .not("group_letter", "is", null);

      if (!matches) return;

      // Rebuild standings from match results
      const newStandings: Record<string, TeamStanding[]> = { ...initialStandings };

      (matches as Array<{
        home_team: string; away_team: string;
        home_score: number; away_score: number;
        group_letter: string; status: string;
      }>).forEach(match => {
        const g = match.group_letter;
        if (!newStandings[g]) return;

        const homeIdx = newStandings[g].findIndex(t => t.name === match.home_team);
        const awayIdx = newStandings[g].findIndex(t => t.name === match.away_team);
        if (homeIdx === -1 || awayIdx === -1) return;

        const home = { ...newStandings[g][homeIdx] };
        const away = { ...newStandings[g][awayIdx] };

        home.played++; away.played++;
        home.gf += match.home_score; home.ga += match.away_score;
        away.gf += match.away_score; away.ga += match.home_score;
        home.gd = home.gf - home.ga;
        away.gd = away.gf - away.ga;

        if (match.home_score > match.away_score) {
          home.won++; home.pts += 3; away.lost++;
        } else if (match.home_score < match.away_score) {
          away.won++; away.pts += 3; home.lost++;
        } else {
          home.drawn++; away.drawn++; home.pts++; away.pts++;
        }

        newStandings[g][homeIdx] = home;
        newStandings[g][awayIdx] = away;
      });

      setStandings(newStandings);
      setLastUpdate(new Date());
    } catch (e) {
      console.warn("Standings refetch error:", e);
    }
  }, [initialStandings]);

  useEffect(() => {
    const sb = getClient();
    if (!sb) return;

    // Subscribe to match result inserts/updates
    const channel = sb
      .channel("match-results")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "matches",
        filter: "status=eq.finished",
      }, () => {
        refetchStandings();
      })
      .subscribe((status) => {
        setIsLive(status === "SUBSCRIBED");
      });

    // Initial fetch
    refetchStandings();

    return () => {
      sb.removeChannel(channel);
    };
  }, [refetchStandings]);

  return { standings, lastUpdate, isLive };
}
