"use client";

import { useState } from "react";
import { Users, Trophy, Lock } from "lucide-react";
import { GroupStagePredictions } from "@/components/predictions/group-stage-predictions";
import { TournamentPicks } from "@/components/dashboard/tournament-picks";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "group"      as const, label: "Group Stage",     icon: Users,  sub: "36 matches · scores & tables" },
  { id: "tournament" as const, label: "Tournament Picks", icon: Trophy, sub: "Winner, boot, defence & more"  },
];

interface PredictionsClientProps {
  groupId: string;
}

export function PredictionsClient({ groupId }: PredictionsClientProps) {
  const [tab, setTab] = useState<"group" | "tournament">("group");

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

      {/* Content */}
      {tab === "group" && (
        <GroupStagePredictions groupId={groupId} locked={false} />
      )}
      {tab === "tournament" && (
        <TournamentPicks groupId={groupId} locked={false} />
      )}
    </div>
  );
}