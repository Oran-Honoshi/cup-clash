"use client";

import { useState } from "react";
import { X, Check, Copy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface CopyPredictionSheetProps {
  matchId:        string;
  home:           number;
  away:           number;
  groups:         Array<{ id: string; name: string; passkey: string }>;
  currentGroupId: string;
  userId:         string;
  onDismiss:      () => void;
}

export function CopyPredictionSheet({
  matchId, home, away, groups, currentGroupId, userId, onDismiss,
}: CopyPredictionSheetProps) {
  const otherGroups = groups.filter(g => g.id !== currentGroupId);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving,   setSaving]   = useState(false);
  const [done,     setDone]     = useState(false);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    if (!selected.size) { onDismiss(); return; }
    setSaving(true);
    const sb   = createClient();
    const rows = [...selected].map(gid => ({
      user_id:    userId,
      group_id:   gid,
      match_id:   matchId,
      home_score: home,
      away_score: away,
      updated_at: new Date().toISOString(),
    }));
    await sb.from("group_predictions").upsert(rows, { onConflict: "user_id,group_id,match_id" });
    setSaving(false);
    setDone(true);
    setTimeout(onDismiss, 800);
  };

  if (!otherGroups.length) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onDismiss}
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />

      {/* Bottom sheet */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 51,
        background: "#0a1408",
        border: "1px solid #1a3a1a",
        borderRadius: "18px 18px 0 0",
        padding: "20px 16px calc(env(safe-area-inset-bottom, 0px) + 32px)",
        maxWidth: 600,
        margin: "0 auto",
      }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-barlow font-black uppercase" style={{ fontSize: 14, color: "#e0f2e0" }}>
              Copy to other groups?
            </div>
            <div className="font-barlow mt-0.5" style={{ fontSize: 11, color: "#3a7a3a" }}>
              Prediction: {home}–{away}
            </div>
          </div>
          <button onClick={onDismiss} style={{ color: "#3a7a3a", padding: 4, lineHeight: 0 }}>
            <X size={18} />
          </button>
        </div>

        {/* Group checkboxes */}
        <div className="space-y-2 mb-5">
          {otherGroups.map(g => {
            const checked = selected.has(g.id);
            return (
              <button
                key={g.id}
                onClick={() => toggle(g.id)}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all"
                style={{
                  background: checked ? "#162a16" : "#0c1c0c",
                  border:     checked ? "1px solid #00e5a0" : "1px solid #1a3a1a",
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                  background: checked ? "#00e5a0" : "transparent",
                  border: checked ? "none" : "1.5px solid #2a5a2a",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {checked && <Check size={11} style={{ color: "#030c04" }} />}
                </div>
                <span className="font-barlow font-bold uppercase truncate"
                  style={{ fontSize: 12, color: checked ? "#00e5a0" : "#5a9a5a" }}>
                  {g.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={onDismiss}
            className="flex-1 py-3 rounded-xl font-barlow font-bold uppercase"
            style={{ fontSize: 11, background: "#0c1c0c", border: "1px solid #1a3a1a", color: "#3a7a3a" }}
          >
            Dismiss
          </button>
          <button
            onClick={handleSave}
            disabled={saving || done}
            className="flex-1 py-3 rounded-xl font-barlow font-bold uppercase flex items-center justify-center gap-1.5 transition-all"
            style={{
              fontSize: 11,
              opacity: saving ? 0.7 : 1,
              background: done || selected.size ? "#162a16" : "#0c1c0c",
              border:     done || selected.size ? "1px solid #00e5a0" : "1px solid #1a3a1a",
              color:      done || selected.size ? "#00e5a0" : "#3a7a3a",
            }}
          >
            {done    ? <><Check size={12} /> Copied!</>
             : saving ? "Saving…"
             : selected.size
               ? <><Copy size={12} /> Copy to {selected.size} group{selected.size > 1 ? "s" : ""}</>
               : "Skip"}
          </button>
        </div>
      </div>
    </>
  );
}
