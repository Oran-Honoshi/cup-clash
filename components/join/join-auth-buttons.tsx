"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/components/i18n/locale-provider";

interface JoinAuthButtonsProps {
  code:      string;
  groupId:   string;
  groupName: string;
}

function storePendingJoin(passkey: string, groupId: string, groupName: string) {
  try {
    localStorage.setItem(
      "cupclash_pending_join",
      JSON.stringify({ passkey, groupId, groupName })
    );
  } catch {}
}

export function JoinAuthButtons({ code, groupId, groupName }: JoinAuthButtonsProps) {
  const router = useRouter();
  const { t } = useLocale();

  return (
    <div className="space-y-2">
      <button
        onClick={() => {
          storePendingJoin(code, groupId, groupName);
          router.push(`/signup?next=/join/${code}`);
        }}
        className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
        {t("auth_signup_join")}
      </button>
      <button
        onClick={() => {
          storePendingJoin(code, groupId, groupName);
          router.push(`/signin?next=/join/${code}`);
        }}
        className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider"
        style={{ border: "1px solid rgba(0,212,255,0.2)", color: "#0891B2", background: "rgba(0,212,255,0.05)" }}>
        {t("auth_signin_instead")}
      </button>
    </div>
  );
}
