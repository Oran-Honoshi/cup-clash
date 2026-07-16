"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Newspaper } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { interpolate } from "@/lib/i18n";
import { useLocale } from "@/components/i18n/locale-provider";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Chip } from "@/components/ui/chip";
import { wasShownToday, markShownToday, touchAnonLastSeen } from "@/lib/reengagement-storage";

const GAP_MS = 30 * 60 * 1000;

type SheetState =
  | { kind: "closed" }
  | { kind: "group-member"; matchLabel: string; groups: Array<{ groupId: string; groupName: string; rank: number }> }
  | { kind: "non-member"; hasFollows: boolean };

// Mounted once in app/(app)/layout.tsx, alongside JoinPromptModal — a
// self-contained client component that fetches its own eligibility data,
// same pattern the rest of the persistent app shell already uses.
export function ReengagementSheet() {
  const router = useRouter();
  const { t } = useLocale();
  const [state, setState] = useState<SheetState>({ kind: "closed" });
  // /api/reengagement/check has a side effect (resets last_seen_at) on every
  // call, so it must fire at most once per mount — React 18 Strict Mode
  // double-invokes effects in dev, and a plain `cancelled` cleanup flag only
  // stops the resulting setState, not the duplicate request that would
  // otherwise silently consume its own eligibility window.
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    if (wasShownToday()) return;

    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();

      if (!user) {
        const previous = touchAnonLastSeen();
        if (!previous) return;
        if (Date.now() - new Date(previous).getTime() < GAP_MS) return;
        markShownToday();
        setState({ kind: "non-member", hasFollows: false });
        return;
      }

      const res = await fetch("/api/reengagement/check", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json() as
        | { eligible: false }
        | { eligible: true; persona: "following-no-group"; hasFollows: boolean }
        | { eligible: true; persona: "group-member"; matchLabel: string; groups: Array<{ groupId: string; groupName: string; rank: number }> };

      if (!data.eligible) return;
      markShownToday();
      if (data.persona === "following-no-group") {
        setState({ kind: "non-member", hasFollows: data.hasFollows });
      } else {
        setState({ kind: "group-member", matchLabel: data.matchLabel, groups: data.groups });
      }
    })();
  }, []);

  const close = () => setState({ kind: "closed" });

  const goToLeaderboard = (groupId: string) => {
    close();
    router.push(`/groups/${groupId}?tab=leaderboard`);
  };

  if (state.kind === "closed") return null;

  if (state.kind === "group-member") {
    const single = state.groups.length === 1;
    const first = state.groups[0];
    const title = single
      ? interpolate(t("reeng_title_single"), { match: state.matchLabel, rank: first.rank, group: first.groupName })
      : interpolate(t("reeng_title_multi"), { match: state.matchLabel });

    return (
      <BottomSheet open onClose={close} closeLabel={t("reeng_close")}>
        <p className="font-display text-lg font-black leading-snug" style={{ color: "var(--tx)" }}>
          {title}
        </p>

        {single ? (
          <button
            onClick={() => goToLeaderboard(first.groupId)}
            className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
            style={{ background: "var(--ac)", color: "var(--at)" }}
          >
            {t("reeng_cta_take_me_there")} <ArrowRight size={16} />
          </button>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            {state.groups.map(g => (
              <button key={g.groupId} onClick={() => goToLeaderboard(g.groupId)}>
                <Chip label={`${g.groupName} · #${g.rank}`} color="#00D4FF" />
              </button>
            ))}
          </div>
        )}
      </BottomSheet>
    );
  }

  return (
    <BottomSheet open onClose={close} closeLabel={t("reeng_close")}>
      <button
        onClick={() => { close(); router.push("/daily-challenge"); }}
        className="w-full flex items-center justify-between gap-3 py-3.5 px-4 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
        style={{ background: "var(--ip)", color: "var(--tx)" }}
      >
        <span className="flex items-center gap-2"><Sparkles size={16} style={{ color: "var(--ac)" }} /> {t("reeng_anon_guess_cta")}</span>
        <ArrowRight size={16} />
      </button>
      <button
        onClick={() => { close(); router.push(state.hasFollows ? "/news?feed=following" : "/leagues"); }}
        className="w-full flex items-center justify-between gap-3 py-3.5 px-4 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
        style={{ background: "var(--ip)", color: "var(--tx)" }}
      >
        <span className="flex items-center gap-2"><Newspaper size={16} style={{ color: "var(--ac)" }} /> {t("reeng_anon_news_cta")}</span>
        <ArrowRight size={16} />
      </button>
    </BottomSheet>
  );
}
