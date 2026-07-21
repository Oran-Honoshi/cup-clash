"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/i18n/locale-provider";
import { BallLoader } from "@/components/ui/BallLoader";

export function MatchDuelAcceptButton({ token }: { token: string }) {
  const router = useRouter();
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const accept = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/match-duels/invite/${token}/accept`, { method: "POST" });
      if (!res.ok) { setError(true); return; }
      router.push("/game");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={accept}
        disabled={loading}
        className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-60"
        style={{ background: "var(--ac)", color: "#03110c" }}
      >
        {loading ? <BallLoader size="sm" /> : t("match_duel_accept_cta")}
      </button>
      {error && (
        <p className="text-xs text-center" style={{ color: "#f87171" }}>{t("match_duel_accept_error")}</p>
      )}
    </div>
  );
}
