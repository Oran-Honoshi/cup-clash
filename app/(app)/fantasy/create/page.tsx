"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Check, Copy, ArrowRight, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { NeonBar } from "@/components/ui/neon-bar";
import { Chip } from "@/components/ui/chip";
import { BallLoader } from "@/components/ui/BallLoader";

// Single-step creation form, mirroring House Rules (app/(app)/create-group/page.tsx)
// — name, a locked competition choice, public/private toggle, submit.
// v1 only offers Premier League (the only competition with the per-gameweek
// player-stat pipeline this feature needs — see fantasy_players, migration 076).

const glassCard = {
  background: "rgba(18,14,38,0.32)",
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 22,
};

const inputStyle = {
  width: "100%",
  borderRadius: 12,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#ffffff",
  fontSize: 14,
  fontFamily: "var(--font-ui)",
  outline: "none",
  transition: "all 0.15s",
  padding: "12px 14px",
};

const labelStyle = {
  display: "block",
  fontSize: 10,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  color: "rgba(255,255,255,0.5)",
  fontFamily: "var(--font-ui)",
  fontWeight: 700,
  marginBottom: 6,
};

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} type="button"
      className="relative h-6 w-11 rounded-full shrink-0 transition-all"
      style={{ background: enabled ? "#00D4FF" : "rgba(255,255,255,0.12)" }}>
      <div className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
        style={{ left: enabled ? "22px" : "2px" }} />
    </button>
  );
}

export default function FantasyCreatePage() {
  const router = useRouter();

  const [competitionId, setCompetitionId] = useState<string | null>(null);
  const [competitionLoading, setCompetitionLoading] = useState(true);

  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [passkey, setPasskey] = useState<string | null>(null);
  const [leagueId, setLeagueId] = useState<string | null>(null);
  const [createdName, setCreatedName] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const sb = createClient();
    (async () => {
      const { data } = await sb.from("competitions").select("id").eq("name", "Premier League").single();
      setCompetitionId((data as { id: string } | null)?.id ?? null);
      setCompetitionLoading(false);
    })();
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !competitionId) return;
    setLoading(true); setError(null);
    const sb = createClient();
    const { data: { session } } = await sb.auth.getSession();
    const token = session?.access_token ?? "";

    try {
      const res = await fetch("/api/fantasy/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim(), competitionId, isPublic }),
      });
      const result = await res.json() as { success?: boolean; leagueId?: string; passkey?: string; error?: string };
      if (!res.ok || !result.success) {
        throw new Error(result.error ?? "Failed to create fantasy league");
      }
      setCreatedName(name.trim());
      setPasskey(result.passkey!);
      setLeagueId(result.leagueId!);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create fantasy league");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${passkey}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  // ── Success state ──────────────────────────────────────────────────────
  if (passkey && leagueId) {
    return (
      <div className="max-w-[480px] mx-auto space-y-4 pb-32">
        <div style={{
          ...glassCard, borderRadius: 28, border: "1px solid rgba(0,255,136,0.25)",
          padding: 28, textAlign: "center",
        }} className="space-y-4">
          <div style={{
            width: 56, height: 56, borderRadius: "50%", margin: "0 auto",
            background: "linear-gradient(135deg, #00FF88, #00D4FF)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Check size={24} style={{ color: "#0B141B" }} />
          </div>
          <div>
            <h2 className="font-display uppercase font-black" style={{ fontSize: 28, color: "white" }}>
              {createdName}
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 6, fontFamily: "var(--font-ui)" }}>
              Share the passkey — now build your squad!
            </p>
          </div>

          <div style={{
            background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)",
            borderRadius: 16, padding: 20,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: "#00D4FF",
              textTransform: "uppercase", letterSpacing: "0.14em",
              fontFamily: "var(--font-ui)", marginBottom: 8,
            }}>
              Entry Passkey
            </div>
            <div style={{
              fontFamily: "var(--font-mono)", fontWeight: 900, fontSize: 40,
              color: "#00FF88", letterSpacing: "0.2em", lineHeight: 1,
            }}>
              {passkey}
            </div>
          </div>

          <button onClick={copyLink}
            className="w-full flex items-center justify-center gap-2"
            style={{
              padding: "12px", borderRadius: 12,
              background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)",
              color: "#00D4FF", fontFamily: "var(--font-ui)", fontWeight: 700,
              fontSize: 13, textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer",
            }}>
            {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy invite link</>}
          </button>

          <button onClick={() => router.push(`/fantasy/${leagueId}/squad`)}
            className="w-full flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
            style={{
              padding: "14px", borderRadius: 14, border: "none",
              background: "linear-gradient(135deg, #00FF88, #00D4FF)",
              color: "#0B141B", fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: 15, textTransform: "uppercase", cursor: "pointer",
              boxShadow: "0 0 24px rgba(0,255,136,0.3)",
            }}>
            Build Your Squad <ArrowRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-[480px] mx-auto space-y-4 pb-32">
      <div>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#00D4FF", fontFamily: "var(--font-ui)", fontWeight: 700, marginBottom: 4 }}>
          New Fantasy League
        </div>
        <h1 className="font-display text-4xl uppercase" style={{ color: "var(--tx)" }}>Draft Your Squad</h1>
        <p style={{ fontSize: 13, color: "var(--t2)", fontFamily: "var(--font-ui)", marginTop: 4 }}>
          Build an 11 on a 100-credit budget, compete with friends every gameweek.
        </p>
      </div>

      <div style={{ ...glassCard, padding: 0, overflow: "hidden" }}>
        <NeonBar gradient="linear-gradient(90deg,#00FF88,#00D4FF)" />
        <div style={{ padding: 20 }} className="space-y-4">

          <div>
            <label style={labelStyle}>League Name</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Sunday League Legends"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = "rgba(0,212,255,0.5)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
            />
          </div>

          <div>
            <label style={labelStyle}>Competition</label>
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.2)",
              }}>
                <Trophy size={16} style={{ color: "#00FF88" }} />
              </div>
              <span className="flex-1 text-sm font-bold" style={{ color: "white", fontFamily: "var(--font-ui)" }}>
                Premier League
              </span>
              <Chip label="v1" color="#00FF88" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Toggle enabled={isPublic} onToggle={() => setIsPublic(v => !v)} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold" style={{ color: isPublic ? "white" : "rgba(255,255,255,0.7)" }}>
                Make this league discoverable
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-ui)" }}>
                Let other users find and join from public league search.
              </div>
            </div>
          </div>

          {error && (
            <div className="text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
              {error}
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={loading || competitionLoading || !name.trim() || !competitionId}
            className="w-full flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
            style={{
              padding: "14px", borderRadius: 14, border: "none",
              background: "linear-gradient(135deg, #00FF88, #00D4FF)",
              color: "#0B141B", fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: 15, textTransform: "uppercase", cursor: "pointer",
              boxShadow: "0 0 24px rgba(0,255,136,0.3)",
            }}>
            {loading ? <BallLoader size="inline" label={null} /> : (
              <><Shield size={16} /> Create League</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
