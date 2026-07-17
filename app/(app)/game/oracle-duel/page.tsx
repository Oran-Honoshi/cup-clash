export const dynamic = "force-dynamic";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getCurrentUserProfile } from "@/lib/services/user-group";
import { OracleDuelScreen } from "@/components/game/oracle-duel-screen";
import { serverT } from "@/lib/server-locale";

export default async function OracleDuelPage() {
  const profile = await getCurrentUserProfile();

  return (
    <div className="space-y-4">
      <Link
        href="/game"
        className="inline-flex items-center gap-1 text-xs font-bold"
        style={{ color: "var(--t2)", textDecoration: "none" }}
      >
        <ChevronLeft size={14} /> {serverT("oracle_duel_back_to_game")}
      </Link>
      <OracleDuelScreen signedIn={!!profile} />
    </div>
  );
}
