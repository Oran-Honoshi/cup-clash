"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, Users, X, AlertCircle, ArrowRight, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { interpolate } from "@/lib/i18n";
import { useLocale } from "@/components/i18n/locale-provider";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { BallLoader } from "@/components/ui/BallLoader";

// Mirrors app/(app)/groups/search/page.tsx, wired to
// list_public_fantasy_leagues() (migration 076) instead of
// list_public_groups() — no group_type filter, since v1 fantasy leagues
// are all one shape (Premier League, 11-a-side).
interface PublicFantasyLeague {
  id:            string;
  name:          string;
  competition_id: string;
  max_members:   number;
  member_count:  number;
  created_at:    string;
}

function JoinPreviewSheet({
  league, onClose,
}: {
  league: PublicFantasyLeague | null;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setError(null); setJoining(false); }, [league]);

  if (!mounted || !league) return null;

  const handleJoin = async () => {
    setJoining(true); setError(null);
    try {
      const res = await fetch("/api/fantasy/join-free", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ fantasyLeagueId: league.id }),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (data.success) {
        router.push(`/fantasy/${league.id}`);
      } else {
        setError(data.error ?? t("sg_join_error"));
        setJoining(false);
      }
    } catch {
      setError(t("sg_join_error"));
      setJoining(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 flex flex-col justify-end"
      style={{ zIndex: 9998, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="rounded-t-3xl w-full max-w-lg mx-auto"
        style={{ background: "var(--nv)", border: "1px solid var(--br)", boxShadow: "0 -8px 40px var(--shad)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--mt)" }} />
        </div>

        <div className="flex items-center justify-between px-5 pt-2 pb-4 border-b" style={{ borderColor: "var(--dv)" }}>
          <span className="font-display text-lg uppercase font-black tracking-wide" style={{ color: "var(--tx)" }}>
            Join Fantasy League
          </span>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-xl"
            style={{ background: "var(--ip)", color: "var(--mt)" }}
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <h3 className="font-display text-2xl uppercase font-black truncate" style={{ color: "var(--tx)" }}>{league.name}</h3>

          <div className="flex items-center gap-2 flex-wrap">
            <Chip label="Premier League" color="#00D4FF" />
            <Chip
              label={interpolate(t("sg_members"), { count: league.member_count, max: league.max_members })}
              color="#00FF88"
              icon={<Users size={11} />}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
              style={{ background: "color-mix(in srgb, #dc2626 10%, transparent)", border: "1px solid color-mix(in srgb, #dc2626 30%, transparent)", color: "#dc2626" }}>
              <AlertCircle size={15} />{error}
            </div>
          )}

          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            style={{ background: "var(--ac)", color: "var(--at)" }}
          >
            {joining ? <><BallLoader size="inline" label={null} /> {t("sg_joining")}</> : <>{t("sg_join")} <ArrowRight size={16} /></>}
          </button>
        </div>

        <div style={{ height: "env(safe-area-inset-bottom, 12px)", minHeight: 12 }} />
      </div>
    </div>,
    document.body
  );
}

export default function SearchFantasyLeaguesPage() {
  const { t } = useLocale();
  const [search,        setSearch]        = useState("");
  const [results,       setResults]       = useState<PublicFantasyLeague[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<PublicFantasyLeague | null>(null);

  useEffect(() => {
    setLoading(true); setError(null);
    const handle = setTimeout(async () => {
      const sb = createClient();
      const { data, error: rpcError } = await sb.rpc("list_public_fantasy_leagues", {
        p_search: search.trim() || null,
      });
      if (rpcError) {
        setError(rpcError.message);
        setResults([]);
      } else {
        setResults((data ?? []) as PublicFantasyLeague[]);
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(handle);
  }, [search]);

  return (
    <div className="space-y-6 pb-32">
      <div className="flex items-center gap-3">
        <Link href="/groups" className="h-9 w-9 flex items-center justify-center rounded-xl shrink-0"
          style={{ background: "var(--ip)", color: "var(--tx)" }}>
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight" style={{ color: "var(--tx)" }}>
          Find a Fantasy League
        </h1>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--mt)" }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t("sg_placeholder")}
          className="w-full rounded-xl border"
          style={{
            padding: "12px 16px 12px 40px",
            background: "var(--ip)", borderColor: "var(--br)", color: "var(--tx)",
            fontSize: 14, fontFamily: "var(--font-ui)", outline: "none",
          }}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><BallLoader label={null} /></div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
          style={{ background: "color-mix(in srgb, #dc2626 10%, transparent)", border: "1px solid color-mix(in srgb, #dc2626 30%, transparent)", color: "#dc2626" }}>
          <AlertCircle size={15} />{error}
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          icon={<Shield size={32} style={{ color: "var(--ac)" }} />}
          title={t("sg_empty_title")}
          body={t("sg_empty_body")}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map(l => (
            <Card
              key={l.id}
              variant="glass"
              interactive
              className="p-4 cursor-pointer"
              style={{ background: "var(--sf)", border: "1px solid var(--br)" }}
              onClick={() => setSelectedLeague(l)}
            >
              <h2 className="font-display text-lg uppercase font-black truncate mb-2" style={{ color: "var(--tx)" }}>{l.name}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Chip label="Premier League" color="#00D4FF" />
                <Chip
                  label={interpolate(t("sg_members"), { count: l.member_count, max: l.max_members })}
                  color="#00FF88"
                  icon={<Users size={11} />}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      <JoinPreviewSheet league={selectedLeague} onClose={() => setSelectedLeague(null)} />
    </div>
  );
}
