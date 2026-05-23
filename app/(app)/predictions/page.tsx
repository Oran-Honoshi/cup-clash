export const dynamic = "force-dynamic";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient }          from "@/lib/supabase/server";
import { PredictionsClient }     from "@/components/predictions/predictions-client";
import { GuestPredictionsShell } from "@/components/predictions/guest-predictions-shell";

function sbAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
  // No user — render the guest shell which:
  //  • Displays matches (same UI as signed-in)
  //  • Stores picks in localStorage via GuestStore
  //  • Fires signup modal on save attempt
  //  • Fires 60-second timer trigger
  //  • Fires returning-guest trigger if they have old picks
  if (!user) {
    return <GuestPredictionsShell />;
  }

  // ── SIGNED-IN: check for localStorage migration ───────────────────────────
  // When migrate=1 is in the URL the client-side MigrateGuestPicks component
  // (rendered inside PredictionsClient) will pick up localStorage predictions
  // and POST them to /api/predictions/migrate — then clear localStorage.
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

  // Solo user — no paid groups, allow solo predictions
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