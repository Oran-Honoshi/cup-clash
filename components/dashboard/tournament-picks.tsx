"use client";

import { useState } from "react";
import { Trophy, Star, Users, Search, Check, Lock, AlertCircle } from "lucide-react";
import Image from "next/image";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ALL_COUNTRIES, flagUrl } from "@/lib/countries";
import { cn } from "@/lib/utils";

function getClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Known players for top scorer/assister picks
const KNOWN_PLAYERS = [
  { name: "Kylian Mbappé",     team: "France",      flagCode: "fr"     },
  { name: "Erling Haaland",    team: "Norway",      flagCode: "no"     },
  { name: "Lionel Messi",      team: "Argentina",   flagCode: "ar"     },
  { name: "Vinícius Jr.",      team: "Brazil",      flagCode: "br"     },
  { name: "Harry Kane",        team: "England",     flagCode: "gb-eng" },
  { name: "Lamine Yamal",      team: "Spain",       flagCode: "es"     },
  { name: "Rodri",             team: "Spain",       flagCode: "es"     },
  { name: "Raphinha",          team: "Brazil",      flagCode: "br"     },
  { name: "Leroy Sané",        team: "Germany",     flagCode: "de"     },
  { name: "Bruno Fernandes",   team: "Portugal",    flagCode: "pt"     },
  { name: "Kevin De Bruyne",   team: "Belgium",     flagCode: "be"     },
  { name: "Jamal Musiala",     team: "Germany",     flagCode: "de"     },
  { name: "Pedri",             team: "Spain",       flagCode: "es"     },
  { name: "Florian Wirtz",     team: "Germany",     flagCode: "de"     },
  { name: "Phil Foden",        team: "England",     flagCode: "gb-eng" },
  { name: "Bernardo Silva",    team: "Portugal",    flagCode: "pt"     },
  { name: "Federico Valverde", team: "Uruguay",     flagCode: "uy"     },
  { name: "Bukayo Saka",       team: "England",     flagCode: "gb-eng" },
  { name: "Gavi",              team: "Spain",       flagCode: "es"     },
  { name: "Jude Bellingham",   team: "England",     flagCode: "gb-eng" },
];

interface TournamentPicksProps {
  groupId: string;
  locked?: boolean; // locked after first match
}

interface Picks {
  winner:     string | null;
  topScorer:  string | null;
  topAssister: string | null;
}

export function TournamentPicks({ groupId, locked = false }: TournamentPicksProps) {
  const [picks, setPicks] = useState<Picks>({ winner: null, topScorer: null, topAssister: null });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [searchScorer, setSearchScorer]   = useState("");
  const [searchAssister, setSearchAssister] = useState("");

  const filteredScorers   = KNOWN_PLAYERS.filter(p => p.name.toLowerCase().includes(searchScorer.toLowerCase()) || p.team.toLowerCase().includes(searchScorer.toLowerCase()));
  const filteredAssisters = KNOWN_PLAYERS.filter(p => p.name.toLowerCase().includes(searchAssister.toLowerCase()) || p.team.toLowerCase().includes(searchAssister.toLowerCase()));

  const handleSave = async () => {
    if (!picks.winner || !picks.topScorer || !picks.topAssister) {
      setError("Please complete all three picks before saving.");
      return;
    }
    setSaving(true);
    setError(null);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      await new Promise(r => setTimeout(r, 600));
      setSaving(false); setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      return;
    }

    const sb = getClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setError("Sign in required"); setSaving(false); return; }

    const upsertPick = async (type: string, value: string) => {
      await sb.from("predictions").upsert(
        { user_id: user.id, group_id: groupId, pred_type: type, pred_value: value, match_id: null },
        { onConflict: "user_id,group_id,match_id,pred_type" }
      );
    };

    await Promise.all([
      upsertPick("winner",       picks.winner),
      upsertPick("top_scorer",   picks.topScorer),
      upsertPick("top_assister", picks.topAssister),
    ]);

    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-4">
      {locked && (
        <div className="flex items-center gap-2 text-xs text-warning font-bold uppercase tracking-widest p-3 rounded-xl bg-warning/10 border border-warning/20">
          <Lock size={13} /> Tournament picks are locked — first match has started
        </div>
      )}

      {/* Tournament winner */}
      <Card variant="glass" className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={18} style={{ color: "#D4AF37" }} />
          <span className="font-display text-xl uppercase text-white">Tournament Winner</span>
          <span className="ml-auto text-xs font-bold text-success">+100 pts</span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-8 gap-1.5 max-h-52 overflow-y-auto pr-1">
          {ALL_COUNTRIES.slice(0, 48).map((c) => {
            const active = picks.winner === c.name;
            return (
              <button key={c.code} type="button" disabled={locked}
                onClick={() => setPicks(p => ({ ...p, winner: c.name }))}
                title={c.name}
                className={cn(
                  "flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all",
                  active ? "border-yellow-500/60 bg-yellow-500/10" : "border-white/[0.06] hover:border-white/20 bg-white/[0.02]",
                  locked && "opacity-50 cursor-not-allowed"
                )}>
                <div className="relative w-8 h-5 rounded-sm overflow-hidden">
                  <Image src={flagUrl(c.flagCode, 40)} alt={c.name} fill className="object-cover" unoptimized />
                </div>
                <span className="text-[8px] font-bold tracking-wider" style={{ color: active ? "#F5E06E" : "#64748b" }}>
                  {c.code}
                </span>
                {active && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center bg-yellow-500">
                    <Check size={9} className="text-black" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {picks.winner && (
          <div className="mt-3 text-sm font-bold text-center" style={{ color: "#F5E06E" }}>
            ✓ {picks.winner}
          </div>
        )}
      </Card>

      {/* Top scorer + top assister side by side */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: "Top Scorer",   key: "topScorer" as const,   icon: Star,  color: "#F59E0B", pts: "+50 pts", search: searchScorer,   setSearch: setSearchScorer,   filtered: filteredScorers   },
          { label: "Top Assister", key: "topAssister" as const, icon: Users, color: "rgb(var(--accent-glow))", pts: "+50 pts", search: searchAssister, setSearch: setSearchAssister, filtered: filteredAssisters },
        ].map(({ label, key, icon: Icon, color, pts, search, setSearch, filtered }) => (
          <Card key={key} variant="glass" className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon size={16} style={{ color }} />
              <span className="font-display text-lg uppercase text-white">{label}</span>
              <span className="ml-auto text-xs font-bold text-success">{pts}</span>
            </div>

            {/* Search */}
            <div className="relative mb-2">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-pitch-500" />
              <input type="text" placeholder="Search player..." value={search}
                onChange={e => setSearch(e.target.value)} disabled={locked}
                className="w-full pl-8 pr-3 py-2 rounded-xl text-xs text-white bg-white/[0.06] border border-white/[0.10] placeholder:text-pitch-600 focus:outline-none focus:border-accent disabled:opacity-40" />
            </div>

            {/* Player list */}
            <div className="space-y-1 max-h-44 overflow-y-auto">
              {filtered.slice(0, 12).map((player) => {
                const active = picks[key] === player.name;
                return (
                  <button key={player.name} type="button" disabled={locked}
                    onClick={() => setPicks(p => ({ ...p, [key]: player.name }))}
                    className={cn(
                      "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left transition-all",
                      active ? "border-accent/50 bg-accent/10" : "border-transparent hover:border-white/10 hover:bg-white/[0.03]",
                      locked && "opacity-50 cursor-not-allowed"
                    )}
                    style={active ? { borderColor: `${color}50`, backgroundColor: `${color}15` } : undefined}
                  >
                    <div className="relative w-5 h-3.5 rounded-sm overflow-hidden shrink-0">
                      <Image src={flagUrl(player.flagCode, 20)} alt={player.team} fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{player.name}</div>
                      <div className="text-[10px] text-pitch-500">{player.team}</div>
                    </div>
                    {active && <Check size={13} style={{ color }} className="shrink-0" />}
                  </button>
                );
              })}
            </div>

            {picks[key] && (
              <div className="mt-2 text-xs font-bold text-center" style={{ color }}>
                ✓ {picks[key]}
              </div>
            )}
          </Card>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-danger">
          <AlertCircle size={13} />{error}
        </div>
      )}

      {!locked && (
        <Button onClick={handleSave} loading={saving} size="md" className="w-full"
          leftIcon={saved ? <Check size={15} /> : <Trophy size={15} />}>
          {saved ? "Picks saved!" : "Save tournament picks"}
        </Button>
      )}

      <p className="text-[11px] text-pitch-500 text-center">
        All three picks lock when the first match kicks off on June 11, 2026.
      </p>
    </div>
  );
}
