"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Trophy } from "lucide-react";
import { interpolate } from "@/lib/i18n";
import { useLocale } from "@/components/i18n/locale-provider";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { dismissHouseInvite } from "@/lib/house-group-storage";
import type { HouseGroupNudgeResult } from "@/lib/nudges/check-house-group";

interface HouseGroupInviteSheetProps {
  data: HouseGroupNudgeResult;
  onClose: () => void;
}

// Purely presentational — eligibility is resolved once by the nudge
// coordinator (components/nudges/nudge-coordinator.tsx), which is gated to
// /home and /game routes there (see NUDGE_REGISTRY). Shown at most once ever
// per browser (lib/house-group-storage.ts) until the user joins or explicitly
// dismisses — deliberately not a daily cap, per the original brief's request
// for a distinct trigger from reengagement.
export function HouseGroupInviteSheet({ data, onClose }: HouseGroupInviteSheetProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [joining, setJoining] = useState(false);

  const close = () => {
    dismissHouseInvite();
    onClose();
  };

  const join = async () => {
    setJoining(true);
    try {
      const res = await fetch("/api/join-free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: data.groupId }),
      });
      if (!res.ok) { setJoining(false); return; }
      dismissHouseInvite();
      onClose();
      router.push(`/groups/${data.groupId}`);
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
            {interpolate(t("hgi_title"), { name: data.groupName })}
          </p>
          <p className="ta-meta mt-0.5">
            {interpolate(t("hgi_subtitle"), { count: data.memberCount })}
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
