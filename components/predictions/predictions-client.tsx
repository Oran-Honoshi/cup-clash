"use client";

import { useState } from "react";
import { Users, Trophy, Lock, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { GroupStagePredictions } from "@/components/predictions/group-stage-predictions";
import { TournamentPicks } from "@/components/dashboard/tournament-picks";

const TABS = [
  { id: "group"      as const, label: "Group Stage",      icon: Users,  sub: "36 matches · scores & tables"  },
  { id: "tournament" as const, label: "Tournament Picks", icon: Trophy, sub: "Winner, boot, defence & more"  },
];

interface PredictionsClientProps {
  groupId:    string;
  groupName:  string;
  allGroups:  Array<{ id: string; name: string; passkey: string }>;
  userId:     string;
  isPaid:     boolean;
}

export function PredictionsClient({ groupId, groupName, allGroups, userId, isPaid }: PredictionsClientProps) {
  const [tab,          setTab]          = useState<"group" | "tournament">("group");
  const [groupPickerOpen, setGroupPickerOpen] = useState(false);
  const router = useRouter();

  const switchGroup = (newGroupId: string) => {
    setGroupPickerOpen(false);
    router.push(`/predictions?group=${newGroupId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="label-caps mb-1">My Bets</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight" style={{ color: "#0F172A" }}>
          Predictions
        </h1>
        <p className="text-sm mt-1 flex items-center gap-1.5" style={{ color: "#94a3b8" }}>
          <Lock size={12} />
          Group matches lock 5 min before kickoff · Tournament picks lock June 11
        </p>
      </div>

      {/* Group switcher */}
      {allGroups.length > 1 && (
        <div className="relative">
          <button
            onClick={() => setGroupPickerOpen(v => !v)}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-left transition-all"
            style={{
              background: "rgba(255,255,255,0.9)",
              border: "1px solid rgba(0,212,255,0.3)",
              boxShadow: "0 4px 16px rgba(0,212,255,0.08)",
            }}>
            <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}>
              <Users size={15} style={{ color: "#0891B2" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "#0891B2" }}>
                Predicting for
              </div>
              <div className="font-display text-lg uppercase font-black truncate" style={{ color: "#0F172A" }}>
                {groupName}
              </div>
            </div>
            <ChevronDown size={16} style={{ color: "#94a3b8", transform: groupPickerOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>

          {groupPickerOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-2xl overflow-hidden z-20"
              style={{ background: "white", border: "1px solid rgba(0,212,255,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
              {allGroups.map(g => (
                <button
                  key={g.id}
                  onClick={() => switchGroup(g.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-all border-b last:border-0"
                  style={{
                    borderColor: "#f1f5f9",
                    background: g.id === groupId ? "rgba(0,212,255,0.05)" : undefined,
                  }}>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate" style={{ color: "#0F172A" }}>{g.name}</div>
                    <div className="text-xs font-mono" style={{ color: "#94a3b8" }}>{g.passkey}</div>
                  </div>
                  {g.id === groupId && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: "rgba(0,212,255,0.1)", color: "#0891B2" }}>Active</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Single group — just show which one */}
      {allGroups.length === 1 && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
          style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)" }}>
          <Users size={14} style={{ color: "#0891B2" }} />
          <span className="text-sm font-bold" style={{ color: "#0891B2" }}>
            Predicting for: <span style={{ color: "#0F172A" }}>{groupName}</span>
          </span>
        </div>
      )}

      {/* Phase tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-left transition-all"
              style={active ? {
                background: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(0,212,255,0.3)",
                boxShadow: "0 4px 16px rgba(0,212,255,0.1)",
              } : {
                background: "rgba(255,255,255,0.5)",
                border: "1px solid #e2e8f0",
              }}>
              <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                style={active
                  ? { background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)" }
                  : { background: "#f1f5f9", border: "1px solid #e2e8f0" }}>
                <t.icon size={16} strokeWidth={1.5} style={{ color: active ? "#0891B2" : "#94a3b8" }} />
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: active ? "#0F172A" : "#64748b" }}>{t.label}</div>
                <div className="text-[10px]" style={{ color: "#94a3b8" }}>{t.sub}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Keep BOTH mounted — prevents state loss on tab switch */}
      <div style={{ display: tab === "group" ? "block" : "none" }}>
        <GroupStagePredictions groupId={groupId} userId={userId} locked={!isPaid} />
      </div>
      <div style={{ display: tab === "tournament" ? "block" : "none" }}>
        <TournamentPicks groupId={groupId} userId={userId} locked={false} />
      </div>
    </div>
  );
}