// lib/hooks/use-player-search.ts
// Searches wc2026_players table, falls back to KNOWN_PLAYERS constant

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Player {
  name:     string;
  team:     string;
  flagCode: string;
  position?: string;
}

// Fallback list in case DB isn't seeded yet
const FALLBACK_PLAYERS: Player[] = [
  { name: "Kylian Mbappé",     team: "France",    flagCode: "fr"     },
  { name: "Erling Haaland",    team: "Norway",    flagCode: "no"     },
  { name: "Lionel Messi",      team: "Argentina", flagCode: "ar"     },
  { name: "Vinícius Jr.",      team: "Brazil",    flagCode: "br"     },
  { name: "Harry Kane",        team: "England",   flagCode: "gb-eng" },
  { name: "Jude Bellingham",   team: "England",   flagCode: "gb-eng" },
  { name: "Lamine Yamal",      team: "Spain",     flagCode: "es"     },
  { name: "Pedri",             team: "Spain",     flagCode: "es"     },
  { name: "Rodri",             team: "Spain",     flagCode: "es"     },
  { name: "Jamal Musiala",     team: "Germany",   flagCode: "de"     },
  { name: "Florian Wirtz",     team: "Germany",   flagCode: "de"     },
  { name: "Cristiano Ronaldo", team: "Portugal",  flagCode: "pt"     },
  { name: "Bruno Fernandes",   team: "Portugal",  flagCode: "pt"     },
  { name: "Kevin De Bruyne",   team: "Belgium",   flagCode: "be"     },
  { name: "Phil Foden",        team: "England",   flagCode: "gb-eng" },
];

export function usePlayerSearch(query: string) {
  const [results,  setResults]  = useState<Player[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [fromDb,   setFromDb]   = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q || q.length < 2) { setResults([]); return; }
    setLoading(true);

    try {
      const sb = createClient();
      const { data, error } = await sb
        .from("wc2026_players")
        .select("name, team, flag_code, position")
        .or(`name.ilike.%${q}%,team.ilike.%${q}%`)
        .limit(20);

      if (!error && data?.length) {
        setFromDb(true);
        setResults((data as Array<{ name: string; team: string; flag_code: string; position: string }>)
          .map(p => ({ name: p.name, team: p.team, flagCode: p.flag_code, position: p.position })));
      } else {
        // Fallback to local list
        setFromDb(false);
        setResults(
          FALLBACK_PLAYERS.filter(p =>
            p.name.toLowerCase().includes(q.toLowerCase()) ||
            p.team.toLowerCase().includes(q.toLowerCase())
          )
        );
      }
    } catch {
      setFromDb(false);
      setResults(
        FALLBACK_PLAYERS.filter(p =>
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          p.team.toLowerCase().includes(q.toLowerCase())
        )
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => { search(query); }, [query, search]);

  return { results, loading, fromDb };
}