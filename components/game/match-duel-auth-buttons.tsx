"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/components/i18n/locale-provider";
import { buildMatchDuelAuthWallUrl } from "@/lib/auth-wall";

// Mirrors JoinAuthButtons (app/join/[code]) — signup/signin, both carrying
// next= back to this same invite page so /duel/[token] can auto-accept on
// return (see buildMatchDuelAuthWallUrl).
export function MatchDuelAuthButtons({ token }: { token: string }) {
  const router = useRouter();
  const { t } = useLocale();
  const path = `/duel/${token}`;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => router.push(buildMatchDuelAuthWallUrl(path, token))}
        className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider"
        style={{ background: "var(--ac)", color: "#03110c" }}
      >
        {t("match_duel_signup_to_accept")}
      </button>
      <button
        type="button"
        onClick={() => router.push(buildMatchDuelAuthWallUrl(path, token).replace("/signup?", "/signin?"))}
        className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider"
        style={{ border: "1px solid var(--br)", color: "var(--t2)", background: "var(--ip)" }}
      >
        {t("match_duel_signin_instead")}
      </button>
    </div>
  );
}
