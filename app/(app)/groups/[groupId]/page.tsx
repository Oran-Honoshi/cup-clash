export const dynamic = "force-dynamic";

import { redirect }    from "next/navigation";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getCurrentUserProfile } from "@/lib/services/user-group";
import { ArrowRight, Trophy, Users, DollarSign, Target, Zap, Shield, Lock } from "lucide-react";
import Link from "next/link";

function sbAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function getGroupDetail(groupId: string) {
  const { data } = await sbAdmin()
    .from("groups")
    .select("id, name, passkey, admin_id, buy_in_amount, payout_first, payout_second, payout_third, max_members, enrollment_fee_cents")
    .eq("id", groupId)
    .single();
  return data as {
    id: string; name: string; passkey: string; admin_id: string;
    buy_in_amount: number; payout_first: number; payout_second: number; payout_third: number;
    max_members: number; enrollment_fee_cents: number;
  } | null;
}

async function getScoringRules(groupId: string) {
  const { data } = await sbAdmin()
    .from("scoring_rules")
    .select("*")
    .eq("group_id", groupId)
    .maybeSingle();
  return data as Record<string, number | boolean> | null;
}

async function getMembers(groupId: string) {
  const { data } = await sbAdmin()
    .from("group_members")
    .select("user_id, payment_status, can_predict, profiles(name, country, avatar_url)")
    .eq("group_id", groupId);
  return (data ?? []) as unknown as Array<{
    user_id: string; payment_status: string; can_predict: boolean;
    profiles: { name: string; country: string | null; avatar_url: string | null } | null;
  }>;
}

export default async function GroupDetailPage({ params }: { params: { groupId: string } }) {
  const userProfile = await getCurrentUserProfile();
  if (!userProfile) redirect("/signin");

  const [group, rules, members] = await Promise.all([
    getGroupDetail(params.groupId),
    getScoringRules(params.groupId),
    getMembers(params.groupId),
  ]);

  if (!group) redirect("/groups");

  const isAdmin   = group.admin_id === userProfile.id;
  const isMember  = members.some(m => m.user_id === userProfile.id);
  const totalPot  = (group.buy_in_amount ?? 0) * members.filter(m => m.payment_status === "paid").length;
  const paidCount = members.filter(m => m.payment_status === "paid").length;

  const SCORING_ROWS = [
    { label: "Correct outcome",       key: "correct_outcome",   enableKey: null,                pts: rules?.correct_outcome   ?? 10  },
    { label: "Exact score",           key: "exact_score",       enableKey: null,                pts: rules?.exact_score       ?? 25  },
    { label: "KO advancement",        key: "ko_advancement",    enableKey: null,                pts: rules?.ko_advancement    ?? 20  },
    { label: "Tournament winner",     key: "tournament_winner", enableKey: "enable_winner",     pts: rules?.tournament_winner ?? 100 },
    { label: "Top scorer",            key: "top_scorer",        enableKey: "enable_scorer",     pts: rules?.top_scorer        ?? 50  },
    { label: "Top assister",          key: "top_assister",      enableKey: "enable_assister",   pts: rules?.top_assister      ?? 50  },
    { label: "Golden Ball",           key: "golden_ball",       enableKey: "enable_golden_ball",pts: rules?.golden_ball       ?? 40  },
  ].filter(r => !r.enableKey || rules?.[r.enableKey] !== false);

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/groups" className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1"
            style={{ color: "#0891B2" }}>
            ← My Groups
          </Link>
          <h1 className="font-display text-4xl uppercase font-black" style={{ color: "#0F172A" }}>
            {group.name}
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {isAdmin && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(217,119,6,0.1)", color: "#d97706" }}>Admin</span>
            )}
            {isMember && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(0,255,136,0.1)", color: "#059669" }}>Member</span>
            )}
          </div>
        </div>
        {isAdmin && (
          <Link href={`/admin/${group.id}`}>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider"
              style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", color: "#0B141B" }}>
              <Shield size={15} /> Manage
            </button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Users,      label: "Members",   value: `${paidCount}` },
          { icon: DollarSign, label: "Buy-in",    value: `$${group.buy_in_amount ?? 0}` },
          { icon: Trophy,     label: "Prize pot", value: `$${totalPot}` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl p-4 text-center"
            style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.12)" }}>
            <Icon size={18} className="mx-auto mb-2" style={{ color: "#0891B2" }} />
            <div className="font-display text-2xl font-black" style={{ color: "#0F172A" }}>{value}</div>
            <div className="text-xs uppercase tracking-widest mt-0.5" style={{ color: "#94a3b8" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Passkey */}
      <div className="rounded-2xl p-5 text-center"
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.15)" }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#0891B2" }}>Entry Passkey</div>
        <div className="font-mono font-black text-4xl tracking-[0.2em] mb-1" style={{ color: "#0F172A" }}>
          {group.passkey}
        </div>
        <div className="text-xs" style={{ color: "#94a3b8" }}>
          Share: cupclash.live/join/{group.passkey}
        </div>
      </div>

      {/* Prize split */}
      <div className="rounded-2xl p-5"
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.15)" }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#64748b" }}>
          Prize Split
        </div>
        <div className="space-y-2">
          {[
            { label: "🥇 1st place", pct: group.payout_first  ?? 60, color: "#d97706" },
            { label: "🥈 2nd place", pct: group.payout_second ?? 30, color: "#64748b" },
            { label: "🥉 3rd place", pct: group.payout_third  ?? 10, color: "#b45309" },
          ].map(({ label, pct, color }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-sm w-24" style={{ color: "#475569" }}>{label}</span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#f1f5f9" }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, opacity: 0.7 }} />
              </div>
              <span className="text-sm font-black w-12 text-right" style={{ color }}>{pct}%</span>
              {totalPot > 0 && (
                <span className="text-xs w-14 text-right" style={{ color: "#64748b" }}>
                  ${Math.round(totalPot * pct / 100)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Scoring rules */}
      <div className="rounded-2xl p-5"
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.15)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Target size={16} style={{ color: "#0891B2" }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>Scoring Rules</span>
          <span className="ml-auto flex items-center gap-1 text-[10px]" style={{ color: "#94a3b8" }}>
            <Lock size={10} /> Lock June 11
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {SCORING_ROWS.map(r => (
            <div key={r.key} className="flex items-center justify-between rounded-xl px-3 py-2.5"
              style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <span className="text-xs" style={{ color: "#475569" }}>{r.label}</span>
              <span className="text-sm font-black" style={{ color: "#0891B2" }}>+{r.pts as number}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Members list */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.15)" }}>
        <div className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: "rgba(0,212,255,0.1)" }}>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>
            Members ({paidCount} paid)
          </span>
        </div>
        <div className="divide-y" style={{ borderColor: "#f1f5f9" }}>
          {members.map(m => (
            <div key={m.user_id} className="flex items-center gap-3 px-5 py-3">
              <div className="h-8 w-8 rounded-full flex items-center justify-center font-black text-sm shrink-0"
                style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", color: "#0B141B" }}>
                {m.profiles?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate" style={{ color: "#0F172A" }}>
                  {m.profiles?.name ?? "Unknown"}
                </div>
                <div className="text-xs" style={{ color: "#94a3b8" }}>
                  {m.profiles?.country ?? ""}
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={m.payment_status === "paid" ? {
                  background: "rgba(0,255,136,0.1)", color: "#059669",
                } : {
                  background: "rgba(220,38,38,0.08)", color: "#dc2626",
                }}>
                {m.payment_status === "paid" ? "Paid" : "Unpaid"}
              </span>
            </div>
          ))}
          {members.length === 0 && (
            <div className="px-5 py-8 text-center text-sm" style={{ color: "#94a3b8" }}>
              No members yet. Share the passkey to invite people.
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/dashboard" className="flex-1">
          <button className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
            Open Dashboard <ArrowRight size={15} />
          </button>
        </Link>
        {isAdmin && (
          <Link href={`/admin/${group.id}`}>
            <button className="px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-wider"
              style={{ border: "1px solid rgba(0,212,255,0.2)", color: "#0891B2", background: "rgba(0,212,255,0.05)" }}>
              Admin Panel
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}