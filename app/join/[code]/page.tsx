export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Logo } from "@/components/logo";
import { XCircle, ArrowRight, Users } from "lucide-react";
import Link from "next/link";

interface GroupRow {
  id:                   string;
  name:                 string;
  passkey:              string;
  admin_id:             string;
  max_members:          number;
  enrollment_fee_cents: number;
  enrollment_deadline:  string | null;
}

async function findGroup(passkey: string): Promise<GroupRow | null> {
  // Use service role to bypass RLS
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await admin
    .from("groups")
    .select("id, name, passkey, admin_id, max_members, enrollment_fee_cents, enrollment_deadline")
    .ilike("passkey", passkey.trim())
    .limit(1);

  return (data?.[0] as GroupRow) ?? null;
}

async function getMemberCount(groupId: string): Promise<number> {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { count } = await admin
    .from("group_members")
    .select("*", { count: "exact", head: true })
    .eq("group_id", groupId);
  return count ?? 0;
}

export default async function JoinCodePage({
  params,
}: {
  params: { code: string };
}) {
  const code  = params.code.toUpperCase().trim();
  const group = await findGroup(code);

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "#F8FAFC" }}>
        <div className="w-full max-w-sm text-center space-y-5">
          <Logo size="lg" className="justify-center" />
          <div className="rounded-2xl p-8 space-y-4"
            style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(220,38,38,0.2)" }}>
            <XCircle size={40} className="mx-auto" style={{ color: "#dc2626" }} />
            <h2 className="font-display text-2xl uppercase font-black" style={{ color: "#0F172A" }}>
              Invalid Link
            </h2>
            <p className="text-sm" style={{ color: "#64748b" }}>
              This invite link doesn&apos;t match any group. Ask your admin for a new one.
            </p>
            <p className="text-xs font-mono px-3 py-1.5 rounded-lg inline-block"
              style={{ background: "#f8fafc", color: "#94a3b8" }}>
              Code tried: {code}
            </p>
            <div className="space-y-2 pt-2">
              <Link href="/join/enter">
                <button className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider"
                  style={{ background: "rgba(0,212,255,0.08)", color: "#0891B2", border: "1px solid rgba(0,212,255,0.2)" }}>
                  Try a different passkey
                </button>
              </Link>
              <Link href="/">
                <button className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider"
                  style={{ border: "1px solid #e2e8f0", color: "#64748b", background: "white" }}>
                  Go Home
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const memberCount      = await getMemberCount(group.id);
  const enrollmentFee    = (group.enrollment_fee_cents ?? 200) / 100;
  const isDeadlinePassed = group.enrollment_deadline
    ? new Date(group.enrollment_deadline) < new Date()
    : false;

  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#F8FAFC" }}>
      <div className="w-full max-w-sm space-y-5">
        <Logo size="lg" className="justify-center" />

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
                <span className="flex items-center gap-1">
                  <Users size={13} /> {memberCount} members
                </span>
                <span>·</span>
                <span>World Cup 2026</span>
              </div>
            </div>

            <div className="rounded-xl p-3 text-center"
              style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)" }}>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "#0891B2" }}>
                Passkey
              </div>
              <div className="font-mono font-black text-2xl tracking-widest" style={{ color: "#0F172A" }}>
                {group.passkey}
              </div>
            </div>

            <div className="rounded-xl p-4 text-center"
              style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)" }}>
              <div className="font-display text-4xl font-black" style={{ color: "#0F172A" }}>
                ${enrollmentFee}
              </div>
              <div className="text-sm mt-1" style={{ color: "#64748b" }}>
                One-time · Full tournament · All 104 matches
              </div>
            </div>

            {isDeadlinePassed ? (
              <div className="text-center py-3 text-sm font-bold" style={{ color: "#dc2626" }}>
                Enrollment has closed for this group.
              </div>
            ) : user ? (
              <form action="/api/paddle" method="POST">
                <input type="hidden" name="groupId"   value={group.id} />
                <input type="hidden" name="passkey"   value={group.passkey} />
                <input type="hidden" name="groupName" value={group.name} />
                <button type="submit"
                  className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B", boxShadow: "0 4px 16px rgba(0,255,136,0.25)" }}>
                  Join for ${enrollmentFee} <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <div className="space-y-2">
                <Link href={`/signup?next=/join/${code}`}>
                  <button className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
                    Create account &amp; Join <ArrowRight size={16} />
                  </button>
                </Link>
                <Link href={`/signin?next=/join/${code}`}>
                  <button className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider"
                    style={{ border: "1px solid rgba(0,212,255,0.2)", color: "#0891B2", background: "rgba(0,212,255,0.05)" }}>
                    Already have an account? Sign in
                  </button>
                </Link>
              </div>
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