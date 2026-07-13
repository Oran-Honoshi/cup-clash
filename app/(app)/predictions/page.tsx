export const dynamic = "force-dynamic";

import { sbAdmin } from "@/lib/supabase/admin";
import { createClient }          from "@/lib/supabase/server";
import { PredictionsClient }     from "@/components/predictions/predictions-client";
import { GuestPredictionsShell } from "@/components/predictions/guest-predictions-shell";
import { AdBanner }              from "@/components/ads/ad-banner";
import { GroupPersistRedirect }  from "@/components/app/group-persist-redirect";
import { GroupSwipeSelector }    from "@/components/groups/group-swipe-selector";
import { getAllMatches }          from "@/lib/services/matches";
import Link from "next/link";

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
            padding: "12px 18px",
            minHeight: 44,
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
  const [{ data: { user } }, allMatches] = await Promise.all([
    sb.auth.getUser(),
    getAllMatches(),
  ]);

  // ── GUEST MODE ────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="pb-32">
        <GuestPredictionsBanner />
        <GuestPredictionsShell />
        <AdBanner isAdFree={false} isCorporate={false} />
      </div>
    );
  }

  // ── SIGNED-IN: check for localStorage migration ───────────────────────────
  const shouldMigrate = searchParams.migrate === "1";

  // Get all groups this user belongs to
  const { data: memberships } = await sbAdmin()
    .from("group_members")
    .select("group_id, groups(id, name, passkey)")
    .eq("user_id", user.id);

  const groups = (memberships ?? [])
    .map((m: unknown) => {
      const row = m as {
        group_id: string;
        groups: { id: string; name: string; passkey: string } | null;
      };
      return row.groups;
    })
    .filter(Boolean) as Array<{ id: string; name: string; passkey: string }>;

  // Solo user: no groups yet, allow solo predictions
  if (!groups.length) {
    return (
      <>
        <PredictionsClient
          groupId="00000000-0000-0000-0000-000000000001"
          groupName="My Predictions"
          allGroups={[]}
          userId={user.id}
          isPaid={true}
          migrateGuestPicks={shouldMigrate}
          isAdFree={false}
          isCorporate={false}
          allMatches={allMatches}
        />
        <AdBanner isAdFree={false} isCorporate={false} />
      </>
    );
  }

  // Use group from URL param, or first group
  const activeGroupId =
    searchParams.group && groups.find((g) => g.id === searchParams.group)
      ? searchParams.group
      : groups[0].id;

  const activeGroup = groups.find((g) => g.id === activeGroupId)!;

  type AdStatus = { is_ad_free: boolean; groups: { is_corporate_paid: boolean } | null } | null;
  const { data: adStatusRaw } = await sbAdmin()
    .from("group_members")
    .select("is_ad_free, groups(is_corporate_paid)")
    .eq("user_id", user.id)
    .eq("group_id", activeGroupId)
    .maybeSingle();
  const adStatus = adStatusRaw as AdStatus;
  const isAdFree    = adStatus?.is_ad_free ?? false;
  const isCorporate = adStatus?.groups?.is_corporate_paid ?? false;

  return (
    <div className="pb-32">
      <GroupPersistRedirect groups={groups} basePath="/predictions" />
      {groups.length > 1 && (
        <div className="-mx-4 sm:-mx-6">
          <GroupSwipeSelector groups={groups} activeGroupId={activeGroupId} basePath="/predictions" />
        </div>
      )}
      <PredictionsClient
        groupId={activeGroupId}
        groupName={activeGroup.name}
        allGroups={groups}
        userId={user.id}
        isPaid={true}
        migrateGuestPicks={shouldMigrate}
        isAdFree={isAdFree}
        isCorporate={isCorporate}
        allMatches={allMatches}
      />
      <AdBanner isAdFree={isAdFree} isCorporate={isCorporate} />
    </div>
  );
}