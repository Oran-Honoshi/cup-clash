"use client";

import { useState, useEffect } from "react";
import { Copy, ChevronDown, Check, AlertCircle, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface GroupOption {
  groupId:   string;
  groupName: string;
  predCount: number;
}

interface CopyPredictionsProps {
  currentGroupId: string;
  userId:         string;
  onCopied:       (predictions: Record<string, { home: string; away: string }>) => void;
}

export function CopyPredictions({ currentGroupId, userId, onCopied }: CopyPredictionsProps) {
  const [groups,     setGroups]     = useState<GroupOption[]>([]);
  const [selected,   setSelected]   = useState<string>("");
  const [open,       setOpen]       = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [copied,     setCopied]     = useState(false);
  const [copyCount,  setCopyCount]  = useState(0);

  useEffect(() => {
    const sb = createClient();
    // Get all other groups this user has predictions in
    sb.from("group_predictions")
      .select("group_id, groups(name)")
      .eq("user_id", userId)
      .neq("group_id", currentGroupId)
      .then(({ data }) => {
        if (!data?.length) return;

        // Group by group_id and count predictions
        const map: Record<string, { name: string; count: number }> = {};
        (data as unknown as Array<{ group_id: string; groups: { name: string } | null }>).forEach(row => {
          if (!row.groups) return;
          if (!map[row.group_id]) map[row.group_id] = { name: row.groups.name, count: 0 };
          map[row.group_id].count++;
        });

        setGroups(Object.entries(map).map(([groupId, { name, count }]) => ({
          groupId,
          groupName: name,
          predCount: count,
        })));
      });
  }, [userId, currentGroupId]);

  const handleCopy = async () => {
    if (!selected) return;
    setLoading(true);

    const sb = createClient();
    const { data } = await sb
      .from("group_predictions")
      .select("match_id, home_score, away_score")
      .eq("user_id",  userId)
      .eq("group_id", selected);

    if (data?.length) {
      const predictions: Record<string, { home: string; away: string }> = {};
      (data as Array<{ match_id: string; home_score: number; away_score: number }>).forEach(p => {
        predictions[p.match_id] = {
          home: String(p.home_score),
          away: String(p.away_score),
        };
      });
      onCopied(predictions);
      setCopyCount(data.length);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
    setLoading(false);
  };

  if (!groups.length) return null;

  const selectedGroup = groups.find(g => g.groupId === selected);

  return (
    <div className="rounded-2xl p-4 space-y-3"
      style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.15)" }}>
      <div className="flex items-center gap-2">
        <Zap size={15} style={{ color: "#0891B2" }} />
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#0891B2" }}>
          Quick fill from another group
        </span>
      </div>

      <p className="text-xs" style={{ color: "#64748b" }}>
        Copy your predictions from a different group. Only matching matches will be filled.
      </p>

      {/* Group selector */}
      <div className="relative">
        <button onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm"
          style={{ background: "white", borderColor: "#e2e8f0", color: "#0F172A" }}>
          <span>{selectedGroup ? `${selectedGroup.groupName} (${selectedGroup.predCount} predictions)` : "Select a group..."}</span>
          <ChevronDown size={14} style={{ color: "#94a3b8", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </button>

        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border overflow-hidden z-20"
            style={{ background: "white", borderColor: "#e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}>
            {groups.map(g => (
              <button key={g.groupId}
                onClick={() => { setSelected(g.groupId); setOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 border-b last:border-0"
                style={{ borderColor: "#f1f5f9", color: selected === g.groupId ? "#0891B2" : "#475569" }}>
                <span className="font-bold text-sm">{g.groupName}</span>
                <span className="text-xs" style={{ color: "#94a3b8" }}>{g.predCount} predictions</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Copy button */}
      <button onClick={handleCopy} disabled={!selected || loading}
        className="w-full py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
        style={copied ? {
          background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)", color: "#059669",
        } : {
          background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)", color: "#0891B2",
        }}>
        {copied ? (
          <><Check size={15} /> Copied {copyCount} predictions!</>
        ) : loading ? (
          "Copying..."
        ) : (
          <><Copy size={15} /> Copy predictions</>
        )}
      </button>

      {copied && (
        <div className="flex items-start gap-2 text-xs" style={{ color: "#64748b" }}>
          <AlertCircle size={12} className="shrink-0 mt-0.5" style={{ color: "#d97706" }} />
          Only matches that exist in this group were copied. Review before saving.
        </div>
      )}
    </div>
  );
}