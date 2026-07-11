"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, Users, X, AlertCircle, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { interpolate } from "@/lib/i18n";
import { useLocale } from "@/components/i18n/locale-provider";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { BallLoader } from "@/components/ui/BallLoader";

interface PublicGroup {
  id:           string;
  name:         string;
  group_type:   string | null;
  group_mode:   string | null;
  max_members:  number;
  member_count: number;
  created_at:   string;
}

type GroupTypeFilter = "all" | "tournament" | "single_match";

function JoinPreviewSheet({
  group, onClose,
}: {
  group: PublicGroup | null;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setError(null); setJoining(false); }, [group]);

  if (!mounted || !group) return null;

  const typeLabel = group.group_type === "single_match" ? t("cg_single_match") : t("cg_full_tournament");

  const handleJoin = async () => {
    setJoining(true); setError(null);
    try {
      const res = await fetch("/api/join-free", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ groupId: group.id }),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (data.success) {
        router.push("/groups");
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
            {t("sg_preview_title")}
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
          <h3 className="font-display text-2xl uppercase font-black truncate" style={{ color: "var(--tx)" }}>{group.name}</h3>

          <div className="flex items-center gap-2 flex-wrap">
            <Chip label={typeLabel} color="#00D4FF" />
            <Chip
              label={interpolate(t("sg_members"), { count: group.member_count, max: group.max_members })}
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

export default function SearchGroupsPage() {
  const { t } = useLocale();
  const [search,       setSearch]       = useState("");
  const [typeFilter,   setTypeFilter]   = useState<GroupTypeFilter>("all");
  const [results,      setResults]      = useState<PublicGroup[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<PublicGroup | null>(null);

  useEffect(() => {
    setLoading(true); setError(null);
    const handle = setTimeout(async () => {
      const sb = createClient();
      const { data, error: rpcError } = await sb.rpc("list_public_groups", {
        p_search:     search.trim() || null,
        p_group_type: typeFilter === "all" ? null : typeFilter,
      });
      if (rpcError) {
        setError(rpcError.message);
        setResults([]);
      } else {
        setResults((data ?? []) as PublicGroup[]);
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(handle);
  }, [search, typeFilter]);

  const filters: { key: GroupTypeFilter; label: string }[] = [
    { key: "all",          label: t("sg_filter_all") },
    { key: "tournament",   label: t("cg_full_tournament") },
    { key: "single_match", label: t("cg_single_match") },
  ];

  return (
    <div className="space-y-6 pb-32">
      <div className="flex items-center gap-3">
        <Link href="/groups" className="h-9 w-9 flex items-center justify-center rounded-xl shrink-0"
          style={{ background: "var(--ip)", color: "var(--tx)" }}>
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight" style={{ color: "var(--tx)" }}>
          {t("grp_search")}
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

      <div className="flex items-center gap-2 flex-wrap">
        {filters.map(f => (
          <button key={f.key} type="button" onClick={() => setTypeFilter(f.key)}>
            <Chip label={f.label} color={typeFilter === f.key ? "#00D4FF" : "#94a3b8"} glow={typeFilter === f.key} />
          </button>
        ))}
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
          icon={<Search size={32} style={{ color: "var(--ac)" }} />}
          title={t("sg_empty_title")}
          body={t("sg_empty_body")}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map(g => {
            const typeLabel = g.group_type === "single_match" ? t("cg_single_match") : t("cg_full_tournament");
            return (
              <Card
                key={g.id}
                variant="glass"
                interactive
                className="p-4 cursor-pointer"
                style={{ background: "var(--sf)", border: "1px solid var(--br)" }}
                onClick={() => setSelectedGroup(g)}
              >
                <h2 className="font-display text-lg uppercase font-black truncate mb-2" style={{ color: "var(--tx)" }}>{g.name}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <Chip label={typeLabel} color="#00D4FF" />
                  <Chip
                    label={interpolate(t("sg_members"), { count: g.member_count, max: g.max_members })}
                    color="#00FF88"
                    icon={<Users size={11} />}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <JoinPreviewSheet group={selectedGroup} onClose={() => setSelectedGroup(null)} />
    </div>
  );
}
