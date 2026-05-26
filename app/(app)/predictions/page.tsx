export const dynamic = "force-dynamic";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient }          from "@/lib/supabase/server";
import { PredictionsClient }     from "@/components/predictions/predictions-client";
import { GuestPredictionsShell } from "@/components/predictions/guest-predictions-shell";
import Link from "next/link";

function sbAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function GuestPredictionsBanner() {
  return (
    <div
      className="sticky top-0 z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4"
      style={{
        background: "rgba(0,212,255,0.08)",
        border: "1px solid rgba(0,212,255,0.2)",
        borderRadius: 14,
        padding: "12px 18px",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
        You&apos;re predicting as a guest. Sign up to save your picks.
      </div>
      <Link href="/signin">
        <button
          className="font-bold text-sm shrink-0"
          style={{
            background: "linear-gradient(135deg, #00D4FF, #00FF88)",
            color: "#0B141B",
            borderRadius: 10,
            padding: "8px 16px",
          }}
        >
          Save my picks →
        </button>
      </Link>
    </div>
  );
}

export default async function PredictionsPage({
  searchParams,
}: {
  searchParams: { group?: string; migrate?: string };
}) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();

  // ── GUEST MODE ────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div>
        <GuestPredictionsBanner />
        <GuestPredictionsShell />
      </div>
    );
  }

  // ── SIGNED-IN: check for localStorage migration ───────────────────────────
  const shouldMigrate = searchParams.migrate === "1";

  // Get all paid groups this user belongs to
  const { data: memberships } = await sbAdmin()
    .from("group_members")
    .select("group_id, payment_status, groups(id, name, passkey)")
    .eq("user_id", user.id)
    .eq("payment_status", "paid");

  const groups = (memberships ?? [])
    .map((m: unknown) => {
      const row = m as {
        group_id: string;
        payment_status: string;
        groups: { id: string; name: string; passkey: string } | null;
      };
      return row.groups;
    })
    .filter(Boolean) as Array<{ id: string; name: string; passkey: string }>;

  // Solo user: no paid groups, allow solo predictions
  if (!groups.length) {
    return (
      <PredictionsClient
        groupId="00000000-0000-0000-0000-000000000001"
        groupName="My Predictions"
        allGroups={[]}
        userId={user.id}
        isPaid={true}
        migrateGuestPicks={shouldMigrate}
      />
    );
  }

  // Use group from URL param, or first group
  const activeGroupId =
    searchParams.group && groups.find((g) => g.id === searchParams.group)
      ? searchParams.group
      : groups[0].id;

  const activeGroup = groups.find((g) => g.id === activeGroupId)!;

  return (
    <PredictionsClient
      groupId={activeGroupId}
      groupName={activeGroup.name}
      allGroups={groups}
      userId={user.id}
      isPaid={true}
      migrateGuestPicks={shouldMigrate}
    />
  );
}