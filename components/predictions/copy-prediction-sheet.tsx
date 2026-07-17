"use client";

import { useState, useEffect } from "react";
import { Check, Copy } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useLocale } from "@/components/i18n/locale-provider";
import { interpolate } from "@/lib/i18n";
import { upsertGroupPrediction } from "@/lib/services/predictions-client";

interface CopyPredictionSheetProps {
  matchId:   string | null;
  home:      number;
  away:      number;
  groups:    Array<{ id: string; name: string }>;
  userId:    string;
  onDismiss: () => void;
}

// Purely a convenience action — declining or dismissing leaves every other
// group's prediction exactly as it was. The caller is responsible for only
// opening this (passing a non-null matchId) once it has already determined
// there's something useful to copy; this component just renders the choice.
export function CopyPredictionSheet({
  matchId, home, away, groups, userId, onDismiss,
}: CopyPredictionSheetProps) {
  const { t } = useLocale();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving,   setSaving]   = useState(false);
  const [done,     setDone]     = useState(false);

  useEffect(() => {
    setSelected(new Set());
    setSaving(false);
    setDone(false);
  }, [matchId]);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    if (!matchId || !selected.size) return;
    setSaving(true);
    await Promise.all(
      [...selected].map(groupId =>
        upsertGroupPrediction({ userId, groupId, matchId, homeScore: home, awayScore: away })
      )
    );
    setSaving(false);
    setDone(true);
    setTimeout(onDismiss, 800);
  };

  return (
    <BottomSheet open={!!matchId} onClose={onDismiss} title={t("cps_title")} closeLabel={t("cps_close")}>
      <p className="text-sm" style={{ color: "var(--t2)" }}>
        {interpolate(t("cps_your_pick"), { home, away })}
      </p>

      <div className="space-y-2">
        {groups.map(g => {
          const checked = selected.has(g.id);
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => toggle(g.id)}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all"
              style={{
                background: checked ? "color-mix(in srgb, var(--ac) 14%, transparent)" : "var(--ip)",
                border: `1px solid ${checked ? "var(--ac)" : "var(--br)"}`,
              }}
            >
              <span
                className="flex items-center justify-center rounded-md shrink-0"
                style={{
                  width: 18, height: 18,
                  background: checked ? "var(--ac)" : "transparent",
                  border: checked ? "none" : "1.5px solid var(--br)",
                }}
              >
                {checked && <Check size={11} style={{ color: "var(--at)" }} />}
              </span>
              <span
                className="font-bold text-sm truncate"
                style={{ color: checked ? "var(--ac)" : "var(--tx)" }}
              >
                {g.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onDismiss}
          className="flex-1 py-3 rounded-xl font-bold text-sm uppercase tracking-wide"
          style={{ background: "var(--ip)", border: "1px solid var(--br)", color: "var(--t2)" }}
        >
          {t("cps_skip")}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || done || !selected.size}
          className="flex-1 py-3 rounded-xl font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
          style={{
            background: done ? "var(--ac)" : selected.size ? "var(--ac)" : "var(--ip)",
            border:     `1px solid ${done || selected.size ? "var(--ac)" : "var(--br)"}`,
            color:      done || selected.size ? "var(--at)" : "var(--t2)",
          }}
        >
          {done
            ? <><Check size={12} /> {t("cps_copied")}</>
            : saving
              ? t("cps_saving")
              : <><Copy size={12} /> {t("cps_copy")}</>}
        </button>
      </div>
    </BottomSheet>
  );
}
