import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface TeamStanding {
  team:   string;
  played: number;
  won:    number;
  drawn:  number;
  lost:   number;
  gf:     number;
  ga:     number;
  gd:     number;
  points: number;
}

export function useRealtimeStandings(
  groupId: string,
  initial: TeamStanding[] = []
) {
  const [standings, setStandings] = useState<TeamStanding[]>(initial);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLive, setIsLive] = useState(false);

  const refresh = useCallback(async () => {
    // Standings are calculated from live_scores + schedule
    // For now return the initial standings (pre-tournament)
    setStandings(initial);
    setLastUpdate(new Date());
  }, [initial]);

  useEffect(() => {
    refresh();

    if (!groupId || groupId === "none") return;

    const sb = createClient();
    const channel = sb
      .channel(`standings:${groupId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table:  "live_scores",
      }, () => {
        setIsLive(true);
        refresh();
      })
      .subscribe();

    return () => { sb.removeChannel(channel); };
  }, [groupId, refresh]);

  return { standings, lastUpdate, isLive };
}