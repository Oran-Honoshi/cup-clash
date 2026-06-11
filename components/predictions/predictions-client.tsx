"use client";

import { useState, useEffect } from "react";
import { Users, Trophy, Lock, ChevronDown, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { GroupStagePredictions } from "@/components/predictions/group-stage-predictions";
import { TournamentPicks } from "@/components/dashboard/tournament-picks";
import { BonusQuestions } from "@/components/predictions/bonus-questions";
import { GuestStore } from "@/components/ui/guest-signup-modal";
import { useLocale } from "@/components/i18n/locale-provider";

// ── Shared glass tokens ───────────────────────────────────────────────────────
const glass = {
  background: "rgba(18,14,38,0.32)",
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.14)",
} as const;

const glassActive = {
  background: "rgba(0,212,255,0.1)",
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  border: "1px solid rgba(0,212,255,0.35)",
} as const;


interface PredictionsClientProps {
  groupId:            string;
  groupName:          string;
  allGroups:          Array<{ id: string; name: string; passkey: string }>;
  userId:             string;
  isPaid:             boolean;
  migrateGuestPicks?: boolean;
  isAdFree?:          boolean;
  isCorporate?:       boolean;
}

export function PredictionsClient({
  groupId, groupName, allGroups, userId, isPaid, migrateGuestPicks = false, isAdFree, isCorporate,
}: PredictionsClientProps) {
  const { t } = useLocale();
  const [tab,             setTab]             = useState<"group" | "tournament">("group");
  const [groupPickerOpen, setGroupPickerOpen] = useState(false);
  const [migrated,        setMigrated]        = useState(false);
  const router = useRouter();

  const TABS = [
    { id: "group"      as const, label: t("pred_groupStage"),  icon: Target, sub: t("pred_grp_subtitle") },
    { id: "tournament" as const, label: t("pred_tournament"),  icon: Trophy, sub: t("pred_trn_subtitle")  },
  ];

  useEffect(() => {
    if (!migrateGuestPicks || migrated) return;
    const guestPicks = GuestStore.get();
    if (!guestPicks.length) return;
    setMigrated(true);
    fetch("/api/predictions/migrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, userId, predictions: guestPicks }),
    }).then(res => {
      if (res.ok) {
        GuestStore.clear();
        const url = new URL(window.location.href);
        url.searchParams.delete("migrate");
        window.history.replaceState({}, "", url.toString());
      }
    }).catch(err => console.error("[migrate guest picks]", err));
  }, [migrateGuestPicks, migrated, groupId, userId]);

  const switchGroup = (id: string) => { setGroupPickerOpen(false); router.push(`/predictions?group=${id}`); };

  return (
    <div className="flex flex-col space-y-4 max-w-2xl mx-auto w-full">

      {/* Page header */}
      <div className="pt-2 pb-1">
        <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "#00D4FF" }}>
          {t("nav_mybets")}
        </div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase font-black text-white leading-none tracking-tight">
          {t("pred_title")}
        </h1>
        <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>
          <Lock size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
          {t("pred_lock_notice")}
        </p>
      </div>

      {/* Group switcher */}
      {allGroups.length > 1 && (
        <div className="relative">
          <button onClick={() => setGroupPickerOpen(v => !v)}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-left transition-all"
            style={glass}>
            <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.3)" }}>
              <Users size={15} style={{ color: "#00D4FF" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: "#00D4FF" }}>
                {t("pred_predicting_for")}
              </div>
              <div className="font-display text-lg uppercase font-black truncate text-white">{groupName}</div>
            </div>
            <ChevronDown size={16} style={{ color: "rgba(255,255,255,0.4)", transform: groupPickerOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>

          {groupPickerOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-2xl overflow-hidden z-20"
              style={{ background: "rgba(10,8,24,0.96)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}>
              {allGroups.map((g, i) => (
                <button key={g.id} onClick={() => switchGroup(g.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
                  style={{ borderBottom: i < allGroups.length - 1 ? "1px solid rgba(255,255,255,0.06)" : undefined, background: g.id === groupId ? "rgba(0,212,255,0.08)" : undefined }}
                  onMouseEnter={(e: { currentTarget: HTMLElement }) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={(e: { currentTarget: HTMLElement }) => { e.currentTarget.style.background = g.id === groupId ? "rgba(0,212,255,0.08)" : "transparent"; }}>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate text-white">{g.name}</div>
                    <div className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>{g.passkey}</div>
                  </div>
                  {g.id === groupId && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: "rgba(0,212,255,0.15)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.3)" }}>
                      {t("pred_active")}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Single group label */}
      {allGroups.length === 1 && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
          style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)" }}>
          <Users size={14} style={{ color: "#00D4FF" }} />
          <span className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>
            {t("pred_predicting_for")}: <span className="text-white">{groupName}</span>
          </span>
        </div>
      )}

      {/* Phase tabs */}
      <div className="grid grid-cols-2 gap-2">
        {TABS.map(tab_ => {
          const active = tab === tab_.id;
          return (
            <button key={tab_.id} onClick={() => setTab(tab_.id)}
              className="flex items-center gap-3 text-left transition-all"
              style={{ ...(active ? glassActive : glass), borderRadius: 18, padding: "14px 16px" }}>
              <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                style={active
                  ? { background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.35)" }
                  : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <tab_.icon size={16} strokeWidth={1.5} style={{ color: active ? "#00D4FF" : "rgba(255,255,255,0.4)" }} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold leading-none mb-1"
                  style={{ color: active ? "#00D4FF" : "rgba(255,255,255,0.7)" }}>{tab_.label}</div>
                <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>{tab_.sub}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div style={{ display: tab === "group" ? "block" : "none" }}>
        <GroupStagePredictions groupId={groupId} userId={userId} locked={false} isAdFree={isAdFree} isCorporate={isCorporate} />
      </div>
      <div style={{ display: tab === "tournament" ? "block" : "none" }}>
        <TournamentPicks groupId={groupId} userId={userId} locked={false} />
        <div className="mt-5">
          <BonusQuestions groupId={groupId} userId={userId} />
        </div>
      </div>
    </div>
  );
}