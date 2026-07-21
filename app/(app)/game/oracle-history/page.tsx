export const dynamic = "force-dynamic";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getCurrentUserProfile, getAllUserGroups } from "@/lib/services/user-group";
import { getOracleHistoryData } from "@/lib/services/oracle";
import { OracleHistoryClient } from "@/components/game/oracle-history-client";
import { serverT } from "@/lib/server-locale";

export default async function OracleHistoryPage() {
  const profile = await getCurrentUserProfile();
  const primaryGroupId = profile ? (await getAllUserGroups(profile.id))[0]?.group_id ?? null : null;
  const { cards } = await getOracleHistoryData(profile?.id ?? null, primaryGroupId);

  return (
    <div className="space-y-4">
      <Link
        href="/game"
        className="inline-flex items-center gap-1 text-xs font-bold"
        style={{ color: "var(--t2)", textDecoration: "none" }}
      >
        <ChevronLeft size={14} /> {serverT("oracle_duel_back_to_game")}
      </Link>

      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, textTransform: "uppercase", color: "var(--tx)", margin: 0 }}>
          {serverT("oracle_history_page_title")}
        </h1>
        <p style={{ fontSize: 13, color: "var(--mt)", fontFamily: "var(--font-ui)", marginTop: 4 }}>
          {serverT("oracle_history_page_subtitle")}
        </p>
      </div>

      <OracleHistoryClient cards={cards} signedIn={!!profile} />
    </div>
  );
}
