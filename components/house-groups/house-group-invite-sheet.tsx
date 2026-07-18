"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { interpolate } from "@/lib/i18n";
import { useLocale } from "@/components/i18n/locale-provider";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { wasHouseInviteDismissed, dismissHouseInvite } from "@/lib/house-group-storage";

type SheetState =
  | { kind: "closed" }
  | { kind: "open"; groupId: string; groupName: string; memberCount: number };

// Trigger: specifically on Home/Game Room entry (not every route, unlike
// ReengagementSheet which fires once per app-shell mount) — the (app) layout
// persists across client-side navigation, so this watches pathname changes
// rather than relying on a remount. Shown at most once ever per browser
// (see lib/house-group-storage.ts) until the user joins or explicitly
// dismisses — deliberately not the 30-min-gap/daily-cap logic reengagement
// uses, per the brief's request for a distinct trigger.
export function HouseGroupInviteSheet() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLocale();
  const [state, setState] = useState<SheetState>({ kind: "closed" });
  const [joining, setJoining] = useState(false);
  const checkedRef = useRef(false);

  useEffect(() => {
    const isEntryRoute = pathname === "/home" || pathname === "/game";
    if (!isEntryRoute || checkedRef.current) return;
    if (wasHouseInviteDismissed()) return;
    checkedRef.current = true;

    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;

      const res = await fetch("/api/house-groups/check", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json() as
        | { eligible: false }
        | { eligible: true; group: { id: string; name: string; memberCount: number } };

      if (!data.eligible) return;
      setState({ kind: "open", groupId: data.group.id, groupName: data.group.name, memberCount: data.group.memberCount });
    })();
  }, [pathname]);

  const close = () => {
    dismissHouseInvite();
    setState({ kind: "closed" });
  };

  if (state.kind === "closed") return null;

  const join = async () => {
    setJoining(true);
    try {
      const res = await fetch("/api/join-free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: state.groupId }),
      });
      if (!res.ok) { setJoining(false); return; }
      dismissHouseInvite();
      setState({ kind: "closed" });
      router.push(`/groups/${state.groupId}`);
    } catch {
      setJoining(false);
    }
  };

  return (
    <BottomSheet open onClose={close} closeLabel={t("hgi_dismiss")}>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center shrink-0" style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(217,119,6,0.12)" }}>
          <Trophy size={20} style={{ color: "#d97706" }} />
        </div>
        <div className="min-w-0">
          <p className="font-display text-base font-black leading-snug" style={{ color: "var(--tx)" }}>
            {interpolate(t("hgi_title"), { name: state.groupName })}
          </p>
          <p className="ta-meta mt-0.5">
            {interpolate(t("hgi_subtitle"), { count: state.memberCount })}
          </p>
        </div>
      </div>

      <button
        onClick={join}
        disabled={joining}
        className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-60"
        style={{ background: "var(--ac)", color: "var(--at)" }}
      >
        {joining ? t("hgi_joining") : <>{t("hgi_cta_join")} <ArrowRight size={16} /></>}
      </button>
    </BottomSheet>
  );
}
