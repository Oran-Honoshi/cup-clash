export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sbAdmin as getAdmin } from "@/lib/supabase/admin";
import { Logo } from "@/components/logo";
import { XCircle, Users, Sparkles, Trophy, CheckCircle, GraduationCap } from "lucide-react";
import { JoinButton } from "@/components/join/join-button";
import { JoinAuthButtons } from "@/components/join/join-auth-buttons";
import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";

interface GroupRow {
  id:                   string;
  name:                 string;
  passkey:              string;
  admin_id:             string;
  max_members:          number;
  enrollment_fee_cents: number;
  enrollment_deadline:  string | null;
  is_corporate_paid:    boolean;
  max_group_capacity:   number | null;
  group_mode:           string | null;
  winner_message:       string | null;
}

async function findGroup(passkey: string): Promise<GroupRow | null> {
  const { data } = await getAdmin()
    .from("groups")
    .select("id, name, passkey, admin_id, max_members, enrollment_fee_cents, enrollment_deadline, is_corporate_paid, max_group_capacity, group_mode, winner_message")
    .ilike("passkey", passkey.trim())
    .limit(1);
  return (data?.[0] as GroupRow) ?? null;
}

async function getMemberCount(groupId: string): Promise<number> {
  const { count } = await getAdmin()
    .from("group_members")
    .select("*", { count: "exact", head: true })
    .eq("group_id", groupId);
  return count ?? 0;
}

async function isAlreadyMember(groupId: string, userId: string): Promise<boolean> {
  const { data } = await getAdmin()
    .from("group_members")
    .select("can_predict")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();
  return data?.can_predict === true;
}

async function joinCorporateFree(groupId: string, userId: string): Promise<void> {
  const sb = getAdmin();
  const { data: existing } = await sb
    .from("group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    await sb.from("group_members")
      .update({ payment_status: "free", can_predict: true, is_ad_free: true })
      .eq("group_id", groupId)
      .eq("user_id", userId);
  } else {
    await sb.from("group_members").insert({
      group_id:       groupId,
      user_id:        userId,
      payment_status: "free",
      can_predict:    true,
      is_ad_free:     true,
      joined_at:      new Date().toISOString(),
    });
  }
}

async function joinFriendlyFree(groupId: string, userId: string): Promise<void> {
  const sb = getAdmin();
  const { data: existing } = await sb
    .from("group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    await sb.from("group_members")
      .update({ payment_status: "free", can_predict: true })
      .eq("group_id", groupId)
      .eq("user_id", userId);
  } else {
    await sb.from("group_members").insert({
      group_id:       groupId,
      user_id:        userId,
      payment_status: "free",
      can_predict:    true,
      joined_at:      new Date().toISOString(),
    });
  }
}

export default async function JoinCodePage({
  params,
  searchParams,
}: {
  params: { code: string };
  searchParams: { join?: string };
}) {
  const code     = params.code.toUpperCase().trim();
  const group    = await findGroup(code);
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 page-safe-top" style={{ background: "#F8FAFC" }}>
        <div className="w-full max-w-sm text-center space-y-5">
          <Logo size="lg" className="justify-center" />
          <div className="rounded-2xl p-8 space-y-4"
            style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(220,38,38,0.2)" }}>
            <XCircle size={40} className="mx-auto" style={{ color: "#dc2626" }} />
            <h2 className="font-display text-2xl uppercase font-black" style={{ color: "#0F172A" }}>Invalid Link</h2>
            <p className="text-sm" style={{ color: "#64748b" }}>
              This invite link doesn&apos;t match any group. Ask your admin for a new one.
            </p>
            <div className="space-y-2 pt-2">
              <Link href="/join/enter">
                <button className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider"
                  style={{ background: "rgba(0,212,255,0.08)", color: "#0891B2", border: "1px solid rgba(0,212,255,0.2)" }}>
                  Try a different passkey
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();

  // Already a paid member → redirect to group
  if (user) {
    const alreadyMember = await isAlreadyMember(group.id, user.id);
    if (alreadyMember) redirect(`/groups/${group.id}`);
  }

  // ── Corporate bypass ──────────────────────────────────────────────────────
  // If this is a corporate-paid group, employees join free
  if (group.is_corporate_paid) {
    // Not logged in → send to signup preserving join URL
    if (!user) {
      redirect(`/signup?next=/join/${code}`);
    }

    // Check capacity
    const memberCount = await getMemberCount(group.id);
    const capacity    = group.max_group_capacity ?? 100;

    if (memberCount >= capacity) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 page-safe-top" style={{ background: "#F8FAFC" }}>
          <div className="w-full max-w-sm text-center space-y-5">
            <Logo size="lg" className="justify-center" />
            <div className="rounded-2xl p-8"
              style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(220,38,38,0.2)" }}>
              <XCircle size={40} className="mx-auto mb-4" style={{ color: "#dc2626" }} />
              <h2 className="font-display text-2xl uppercase font-black mb-2" style={{ color: "#0F172A" }}>Group Full</h2>
              <p className="text-sm" style={{ color: "#64748b" }}>
                This corporate group has reached its maximum capacity of {capacity} members.
                Please contact your admin.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // If ?join=1 param set → actually join them
    if (searchParams.join === "1") {
      await joinCorporateFree(group.id, user.id);
      redirect(`/groups/${group.id}`);
    }

    // Show sponsored access splash screen
    return (
      <div className="min-h-screen flex items-center justify-center px-4 page-safe-top" style={{ background: "#F8FAFC" }}>
        <div className="w-full max-w-sm space-y-5">
          <div className="flex items-center">
            <BackButton fallback="/join/enter" />
            <Logo size="lg" className="flex-1 justify-center" />
            <div className="w-8" />
          </div>

          <div className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.95)", border: "2px solid rgba(0,212,255,0.3)", boxShadow: "0 8px 32px rgba(0,212,255,0.12)" }}>
            <div className="h-1.5" style={{ background: "linear-gradient(90deg, #00D4FF, #00FF88)" }} />

            <div className="p-7 text-center space-y-5">
              {/* Sponsored badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)" }}>
                <Sparkles size={14} style={{ color: "#059669" }} />
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: "#059669" }}>
                  Sponsored Access
                </span>
              </div>

              <div className="text-4xl">🎉</div>

              <div>
                <h1 className="font-display text-2xl uppercase font-black mb-2" style={{ color: "#0F172A" }}>
                  Your company has covered your entry!
                </h1>
                <p className="text-sm" style={{ color: "#64748b" }}>
                  This is a sponsored group — your access is fully free, courtesy of your organization.
                  You&apos;ve been invited to join{" "}
                  <strong style={{ color: "#0F172A" }}>{group.name}</strong>.
                  No payment screen. No ads.
                </p>
              </div>

              <div className="rounded-xl p-4"
                style={{ background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.15)" }}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span style={{ color: "#64748b" }}>Ad-free access</span>
                  <span className="font-black line-through" style={{ color: "#94a3b8" }}>$2.00</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: "#64748b" }}>Covered by your company</span>
                  <span className="font-black" style={{ color: "#059669" }}>$0.00 ✓</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs" style={{ color: "#64748b" }}>
                <Users size={13} />
                <span>{memberCount} members joined · {capacity - memberCount} spots remaining</span>
              </div>

              <Link href={`/join/${code}?join=1`}>
                <button className="w-full py-4 rounded-2xl font-bold text-base uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B", boxShadow: "0 4px 20px rgba(0,255,136,0.3)" }}>
                  <Sparkles size={18} /> Enter the Group — Free
                </button>
              </Link>

              <p className="text-xs" style={{ color: "#94a3b8" }}>
                Predictions lock 5 min before each kickoff
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Friendly (Family & School) bypass ────────────────────────────────────
  if (group.group_mode === "friendly") {
    if (!user) {
      redirect(`/signup?next=/join/${code}`);
    }

    if (searchParams.join === "1") {
      await joinFriendlyFree(group.id, user.id);
      redirect(`/groups/${group.id}`);
    }

    const memberCount = await getMemberCount(group.id);

    return (
      <div className="min-h-screen flex items-center justify-center px-4 page-safe-top" style={{ background: "#F8FAFC" }}>
        <div className="w-full max-w-sm space-y-5">
          <div className="flex items-center">
            <BackButton fallback="/join/enter" />
            <Logo size="lg" className="flex-1 justify-center" />
            <div className="w-8" />
          </div>

          <div className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.95)", border: "2px solid rgba(167,139,250,0.3)", boxShadow: "0 8px 32px rgba(167,139,250,0.12)" }}>
            <div className="h-1.5" style={{ background: "linear-gradient(90deg, #a78bfa, #00D4FF)" }} />

            <div className="p-7 text-center space-y-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)" }}>
                <GraduationCap size={14} style={{ color: "#7c3aed" }} />
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: "#7c3aed" }}>
                  Family &amp; School Group
                </span>
              </div>

              <div>
                <h1 className="font-display text-2xl uppercase font-black mb-2" style={{ color: "#0F172A" }}>
                  You&apos;re invited to
                </h1>
                <p className="font-display text-3xl uppercase font-black" style={{ color: "#0F172A" }}>
                  {group.name}
                </p>
              </div>

              {group.winner_message && (
                <div className="rounded-xl px-4 py-3 flex items-center gap-3 text-left"
                  style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
                  <Trophy size={16} style={{ color: "#d97706", flexShrink: 0 }} />
                  <span className="text-sm font-bold" style={{ color: "#92400e" }}>{group.winner_message}</span>
                </div>
              )}

              <div className="rounded-xl p-4"
                style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.2)" }}>
                <div className="flex items-center justify-center gap-2 text-lg font-black" style={{ color: "#0F172A" }}>
                  <CheckCircle size={20} style={{ color: "#059669" }} />
                  Join for FREE
                </div>
                <p className="text-xs mt-1" style={{ color: "#64748b" }}>No payment required — just predict and compete!</p>
              </div>

              <div className="flex items-center gap-2 text-xs justify-center" style={{ color: "#64748b" }}>
                <Users size={13} />
                <span>{memberCount} member{memberCount !== 1 ? "s" : ""} joined</span>
              </div>

              <Link href={`/join/${code}?join=1`}>
                <button className="w-full py-4 rounded-2xl font-bold text-base uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #a78bfa, #00D4FF)", color: "#ffffff", boxShadow: "0 4px 20px rgba(167,139,250,0.3)" }}>
                  <CheckCircle size={18} /> Join for Free
                </button>
              </Link>

              <p className="text-xs" style={{ color: "#94a3b8" }}>
                Predictions lock 5 min before each kickoff
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Standard individual join ───────────────────────────────────────────────
  const memberCount      = await getMemberCount(group.id);
  const enrollmentFee    = (group.enrollment_fee_cents ?? 200) / 100;
  const isDeadlinePassed = group.enrollment_deadline
    ? new Date(group.enrollment_deadline) < new Date()
    : false;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 page-safe-top" style={{ background: "#F8FAFC" }}>
      <div className="w-full max-w-sm space-y-5">
        <div className="flex items-center">
          <BackButton fallback="/join/enter" />
          <Logo size="lg" className="flex-1 justify-center" />
          <div className="w-8" />
        </div>

        <div className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(0,212,255,0.2)", boxShadow: "0 8px 32px rgba(0,212,255,0.08)" }}>
          <div className="h-1" style={{ background: "linear-gradient(90deg, #00D4FF, #00FF88)" }} />

          <div className="p-6 space-y-5">
            <div className="text-center">
              <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#0891B2" }}>
                You&apos;re invited to
              </div>
              <h1 className="font-display text-3xl uppercase font-black" style={{ color: "#0F172A" }}>
                {group.name}
              </h1>
              <div className="flex items-center justify-center gap-3 mt-2 text-sm" style={{ color: "#64748b" }}>
                <span className="flex items-center gap-1"><Users size={13} /> {memberCount} members</span>
                <span>·</span>
                <span>World Cup 2026</span>
              </div>
            </div>

            <div className="rounded-xl p-3 text-center"
              style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)" }}>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "#0891B2" }}>Passkey</div>
              <div className="font-mono font-black text-2xl tracking-widest" style={{ color: "#0F172A" }}>{group.passkey}</div>
            </div>

            <div className="rounded-xl p-4 text-center"
              style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)" }}>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#059669" }}>✨ Optional Upgrade</div>
              <div className="font-display text-2xl font-black" style={{ color: "#0F172A" }}>Go Ad-Free — ${enrollmentFee} one-time</div>
              <div className="text-xs mt-1" style={{ color: "#64748b" }}>Full tournament · All 104 matches · Remove all ads</div>
            </div>

            {isDeadlinePassed ? (
              <div className="text-center py-3 text-sm font-bold" style={{ color: "#dc2626" }}>
                Enrollment has closed for this group.
              </div>
            ) : user ? (
              <JoinButton groupId={group.id} groupName={group.name} enrollmentFee={enrollmentFee} demoMode={demoMode} />
            ) : (
              <JoinAuthButtons code={code} groupId={group.id} groupName={group.name} />
            )}

            <p className="text-center text-xs" style={{ color: "#94a3b8" }}>
              7-day refund guarantee · Predictions lock 5 min before kickoff
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}