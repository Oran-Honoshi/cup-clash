"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, DollarSign, Users, ChevronRight, Crown, Plus, BarChart2 } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { UserGroupSummary } from "@/lib/services/multi-group";

interface MultiGroupDashboardProps {
  groups: UserGroupSummary[];
  totalEarnings: number;
  totalPot: number;
}

const RANK_MEDALS = ["🥇", "🥈", "🥉"];
const RANK_COLORS = ["text-yellow-400", "text-slate-300", "text-amber-600"];

function GroupCard({ group, index }: { group: UserGroupSummary; index: number }) {
  const netPot = group.paidPot * (1 - group.adminFeePercent / 100);
  const isWinning = group.userRank <= 3 && group.userRank > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Link href={`/groups/${group.groupId}`}>
        <div className={cn(
          "glass rounded-2xl p-5 hover:-translate-y-1 transition-all duration-200 hover:shadow-card cursor-pointer border",
          isWinning ? "border-accent/20" : "border-white/[0.06]"
        )}>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl uppercase text-white truncate">
                  {group.groupName}
                </h3>
                {group.isAdmin && (
                  <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/10 text-pitch-400 shrink-0">
                    Admin
                  </span>
                )}
              </div>
              {group.nickname && (
                <div className="text-xs text-pitch-500 mt-0.5">as "{group.nickname}"</div>
              )}
              <div className="text-[10px] text-pitch-600 uppercase tracking-wider mt-0.5">
                {group.groupType === "single_match" ? "Single Match" : "Tournament"}
              </div>
            </div>
            <ChevronRight size={18} className="text-pitch-600 shrink-0 mt-0.5" />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {/* Rank */}
            <div className="glass rounded-xl p-3 text-center">
              {group.userRank > 0 ? (
                <>
                  <div className={cn(
                    "font-display text-2xl leading-none",
                    group.userRank <= 3 ? RANK_COLORS[group.userRank - 1] : "text-white"
                  )}>
                    {group.userRank <= 3 ? RANK_MEDALS[group.userRank - 1] : `#${group.userRank}`}
                  </div>
                  <div className="text-[9px] text-pitch-600 uppercase tracking-widest mt-1">Rank</div>
                </>
              ) : (
                <>
                  <div className="font-display text-2xl text-pitch-600">—</div>
                  <div className="text-[9px] text-pitch-600 uppercase tracking-widest mt-1">Rank</div>
                </>
              )}
            </div>

            {/* Points */}
            <div className="glass rounded-xl p-3 text-center">
              <div className="font-display text-2xl text-white leading-none">{group.userPoints}</div>
              <div className="text-[9px] text-pitch-600 uppercase tracking-widest mt-1">Points</div>
            </div>

            {/* Members */}
            <div className="glass rounded-xl p-3 text-center">
              <div className="font-display text-2xl text-white leading-none">{group.memberCount}</div>
              <div className="text-[9px] text-pitch-600 uppercase tracking-widest mt-1">Members</div>
            </div>
          </div>

          {/* Pot + earnings */}
          {group.buyInAmount > 0 && (
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-xs text-pitch-400">
                <Users size={12} />
                <span>Pot: <span className="font-bold text-pitch-200">${netPot.toFixed(0)}</span></span>
              </div>
              {group.currentEarnings > 0 ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-success">
                  <DollarSign size={12} />
                  <span>Winning ${group.currentEarnings}</span>
                </div>
              ) : (
                <div className="text-xs text-pitch-600">Not in prize zone</div>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export function MultiGroupDashboard({
  groups,
  totalEarnings,
  totalPot,
}: MultiGroupDashboardProps) {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div className="space-y-6">
      {/* "Show Me The Money" banner */}
      {totalPot > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-6"
          style={{
            background: "linear-gradient(135deg, rgb(var(--brand)/0.2), rgb(var(--brand-2)/0.1))",
            border: "1px solid rgb(var(--accent)/0.2)",
          }}
        >
          <div className="absolute top-0 right-0 text-8xl opacity-10 leading-none">💰</div>
          <div className="relative">
            <div className="label-caps mb-1 flex items-center gap-2">
              <DollarSign size={12} />
              Show me the money
            </div>
            <div className="flex items-end gap-6 flex-wrap">
              <div>
                <div className="text-4xl font-display text-white">
                  ${totalEarnings.toLocaleString()}
                </div>
                <div className="text-xs text-pitch-400 mt-0.5">
                  Your current estimated winnings across {groups.length} group{groups.length !== 1 ? "s" : ""}
                </div>
              </div>
              <div className="text-pitch-500 text-sm">
                out of <span className="font-bold text-pitch-300">${totalPot.toLocaleString()}</span> total pot
              </div>
            </div>
            {totalEarnings === 0 && (
              <p className="text-xs text-pitch-500 mt-2">
                Not in a prize position yet — keep predicting! 🎯
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Header + view toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl uppercase text-white">
            Your Groups
          </h2>
          <p className="text-xs text-pitch-500">{groups.length} active group{groups.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 glass rounded-xl p-1">
            {(["grid", "list"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                  view === v ? "bg-white/10 text-white" : "text-pitch-500 hover:text-pitch-300")}>
                {v === "grid" ? "⊞" : "≡"}
              </button>
            ))}
          </div>
          <Link href="/create-group">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass border border-white/10 text-xs font-bold uppercase tracking-wider text-pitch-300 hover:text-white transition-colors">
              <Plus size={13} /> New
            </button>
          </Link>
        </div>
      </div>

      {/* Groups */}
      {groups.length === 0 ? (
        <Card variant="glass" className="p-8 text-center">
          <Trophy size={32} className="text-pitch-600 mx-auto mb-3" />
          <h3 className="font-display text-xl uppercase text-white mb-2">No groups yet</h3>
          <p className="text-pitch-400 text-sm mb-4">Create a group or join one with an invite link.</p>
          <Link href="/create-group">
            <button className="px-5 py-2.5 rounded-full font-bold text-sm text-white uppercase tracking-wider"
              style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--brand)), rgb(var(--brand-2)))" }}>
              Create a group
            </button>
          </Link>
        </Card>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {groups.map((g, i) => <GroupCard key={g.groupId} group={g} index={i} />)}
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map((g, i) => (
            <motion.div key={g.groupId}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link href={`/groups/${g.groupId}`}>
                <div className="glass rounded-xl px-5 py-3.5 flex items-center gap-4 hover:bg-white/[0.04] transition-colors cursor-pointer">
                  <div className={cn("font-display text-xl w-8 text-center",
                    g.userRank <= 3 && g.userRank > 0 ? RANK_COLORS[g.userRank - 1] : "text-pitch-500")}>
                    {g.userRank <= 3 && g.userRank > 0 ? RANK_MEDALS[g.userRank - 1] : `#${g.userRank || "?"}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white truncate">{g.groupName}</div>
                    <div className="text-xs text-pitch-500">{g.memberCount} members · {g.userPoints} pts</div>
                  </div>
                  {g.currentEarnings > 0 && (
                    <div className="text-sm font-bold text-success shrink-0">${g.currentEarnings}</div>
                  )}
                  <ChevronRight size={16} className="text-pitch-600 shrink-0" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
