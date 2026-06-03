"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { X, Users, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/components/i18n/locale-provider";

interface PendingJoin {
  passkey:   string;
  groupId:   string;
  groupName: string;
}

export function JoinPromptModal() {
  const router   = useRouter();
  const pathname = usePathname();
  const { t }    = useLocale();
  const [pending, setPending] = useState<PendingJoin | null>(null);

  useEffect(() => {
    // If already on the join page — clear and let that page handle it
    if (pathname.startsWith("/join/")) {
      localStorage.removeItem("cupclash_pending_join");
      return;
    }

    const raw = localStorage.getItem("cupclash_pending_join");
    if (!raw) return;

    try {
      const data = JSON.parse(raw) as PendingJoin;

      // Check if user is already a member (if so, clear silently)
      const sb = createClient();
      sb.auth.getUser().then(async ({ data: { user } }) => {
        if (!user) return;
        const { data: membership } = await sb
          .from("group_members")
          .select("id")
          .eq("group_id", data.groupId)
          .eq("user_id", user.id)
          .maybeSingle();
        if (membership) {
          // Already a member — clear and don't bother them
          localStorage.removeItem("cupclash_pending_join");
        } else {
          setPending(data);
        }
      });
    } catch {
      localStorage.removeItem("cupclash_pending_join");
    }
  }, [pathname]);

  if (!pending) return null;

  const dismiss = () => {
    localStorage.removeItem("cupclash_pending_join");
    setPending(null);
  };

  const goJoin = () => {
    localStorage.removeItem("cupclash_pending_join");
    router.push(`/join/${pending.passkey}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}>
      <div
        className="w-full sm:max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: "rgba(12,9,30,0.98)",
          border: "1px solid rgba(0,212,255,0.25)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}>
        {/* Gradient bar */}
        <div className="h-1" style={{ background: "linear-gradient(90deg, #00D4FF, #00FF88)" }} />

        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#00D4FF" }}>
                {t("grp_invited_to")}
              </div>
              <div className="font-display text-2xl uppercase font-black text-white leading-tight">
                {pending.groupName}
              </div>
            </div>
            <button
              onClick={dismiss}
              className="h-8 w-8 flex items-center justify-center rounded-lg shrink-0 transition-colors hover:bg-white/[0.08]"
              style={{ color: "rgba(255,255,255,0.4)" }}>
              <X size={16} />
            </button>
          </div>

          {/* Passkey pill */}
          <div
            className="rounded-xl px-4 py-3 flex items-center justify-between"
            style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.18)" }}>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "rgba(0,212,255,0.7)" }}>
                {t("grp_passkey")}
              </div>
              <div className="font-mono font-black text-xl tracking-widest text-white">
                {pending.passkey}
              </div>
            </div>
            <Users size={20} style={{ color: "rgba(0,212,255,0.4)" }} />
          </div>

          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            {t("grp_complete_step")}
          </p>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={dismiss}
              className="flex-1 py-3 rounded-xl font-bold text-sm transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)",
              }}>
              {t("common_later")}
            </button>
            <button
              onClick={goJoin}
              className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
              style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
              {t("common_joinGroup")} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
