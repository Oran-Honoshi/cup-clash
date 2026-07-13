"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { parsePuzzleParam } from "@/lib/auth-wall";
import { loadLocalAttempt, clearLocalAttempt } from "@/lib/daily-challenge-storage";
import { useLocale } from "@/components/i18n/locale-provider";

// Mounted on the Daily Challenge page (the `next` redirect target already
// points back here). On landing, if the visitor just authenticated and a
// `?puzzle=<date>` param is present, save whatever guesses they made
// anonymously — mirrors <ConsumeFollowParam>'s "resume after auth" pattern,
// with its own param since persisting a guess history isn't a
// FollowAction{type,id} the way following a team/competition is.
export function ConsumeDailyChallengeParam({ userId }: { userId: string | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const challengeDate = parsePuzzleParam(searchParams);
    if (!challengeDate) return;

    (async () => {
      const local = loadLocalAttempt(challengeDate);
      if (local.guesses.length > 0) {
        const res = await fetch("/api/daily-challenge/save-anon-attempt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ challengeDate, guesses: local.guesses }),
        });
        if (res.ok) {
          clearLocalAttempt(challengeDate);
          setSaved(true);
        }
      }

      const params = new URLSearchParams(searchParams.toString());
      params.delete("puzzle");
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (!saved) return null;

  return (
    <div
      role="status"
      className="flex items-center gap-2 mb-4"
      style={{
        background: "rgba(0,207,128,0.1)",
        border: "1px solid rgba(0,207,128,0.3)",
        borderRadius: 12,
        padding: "10px 14px",
        fontFamily: "var(--font-ui)",
        fontSize: 13,
        fontWeight: 700,
        color: "var(--ac)",
      }}
    >
      <CheckCircle2 size={16} />
      {t("dc_signup_saved")}
    </div>
  );
}
