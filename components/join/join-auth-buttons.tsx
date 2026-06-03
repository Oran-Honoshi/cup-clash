"use client";

import { useRouter } from "next/navigation";

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

  return (
    <div className="space-y-2">
      <button
        onClick={() => {
          storePendingJoin(code, groupId, groupName);
          router.push(`/signup?next=/join/${code}`);
        }}
        className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
        Create account &amp; Join
      </button>
      <button
        onClick={() => {
          storePendingJoin(code, groupId, groupName);
          router.push(`/signin?next=/join/${code}`);
        }}
        className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider"
        style={{ border: "1px solid rgba(0,212,255,0.2)", color: "#0891B2", background: "rgba(0,212,255,0.05)" }}>
        Already have an account? Sign in
      </button>
    </div>
  );
}
