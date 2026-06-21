"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Target, Trophy, Puzzle } from "lucide-react";
import { useRouter } from "next/navigation";
import { GroupStagePredictions } from "@/components/predictions/group-stage-predictions";
import { TournamentPicks } from "@/components/dashboard/tournament-picks";
import { BonusQuestions } from "@/components/predictions/bonus-questions";
import { GroupSwipeSelector } from "@/components/groups/group-swipe-selector";
import { GuestStore } from "@/components/ui/guest-signup-modal";
import { useLocale } from "@/components/i18n/locale-provider";
import { useGroupContext } from "@/lib/contexts/group-context";
import { createClient } from "@/lib/supabase/client";
import { WC2026_MATCHES } from "@/lib/schedule";

interface PredictionsClientProps {
  groupId:            string;
  groupName:          string;
  allGroups:          Array<{ id: string; name: string; passkey: string }>;
  userId:             string;
  isPaid:             boolean;
  migrateGuestPicks?: boolean;
  isAdFree?:          boolean;
  isCorporate?:       boolean;
}

// ── Accordion section ─────────────────────────────────────────────────────────

function AccordionSection({
  icon, title, badge, open, onToggle, children,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden" style={{ background: "#0e1f0e", borderRadius: 14, border: open ? "1px solid #1c5a1c" : "1px solid #1a3a1a" }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 text-left"
        style={{ padding: "14px 14px" }}
      >
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span className="font-barlow font-black uppercase flex-1" style={{ fontSize: 15, color: "#e0f2e0" }}>{title}</span>
        {badge}
        {open
          ? <ChevronDown size={14} style={{ color: "#00e5a0", flexShrink: 0 }} />
          : <ChevronRight size={14} style={{ color: "#3a6a3a", flexShrink: 0 }} />
        }
      </button>
      {open && (
        <div style={{ borderTop: "1px solid #162a16" }}>
          {children}
        </div>
      )}
    </div>
  );
}

type SectionKey = "group" | "tournament" | "bonus";

const SECTION_DEFS: Record<SectionKey, { icon: React.ReactNode; title: string }> = {
  group:      { icon: <Target size={16} style={{ color: "#00e5a0" }} />,  title: "Group Stage"       },
  tournament: { icon: <Trophy size={16} style={{ color: "#ffaa00" }} />,  title: "Tournament Picks"  },
  bonus:      { icon: <Puzzle size={16} style={{ color: "#a78bfa" }} />,  title: "Bonus Questions"   },
};

const GROUP_STAGE_MATCH_IDS = WC2026_MATCHES.filter(m => m.stage === "Group").map(m => m.id);
const TOURNAMENT_PRED_TYPES = [
  "winner","top_scorer","top_assister","golden_ball",
  "best_defence","best_young_player",
  "best_third_1","best_third_2","best_third_3","best_third_4",
  "best_third_5","best_third_6","best_third_7","best_third_8",
];

export function PredictionsClient({
  groupId, groupName, allGroups, userId, isPaid, migrateGuestPicks = false, isAdFree, isCorporate,
}: PredictionsClientProps) {
  void isPaid; void groupName;
  const { t } = useLocale();
  void t;
  const [openSection,  setOpenSection]  = useState<SectionKey | null>("group");
  const [sectionOrder, setSectionOrder] = useState<SectionKey[]>(["group", "tournament", "bonus"]);
  const [migrated,     setMigrated]     = useState(false);
  const router = useRouter();
  const { setSelectedGroupId } = useGroupContext();
  void router; void setSelectedGroupId;

  // Guest-picks migration
  useEffect(() => {
    if (!migrateGuestPicks || migrated) return;
    const guestPicks = GuestStore.get();
    if (!guestPicks.length) return;
    setMigrated(true);
    fetch("/api/predictions/migrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, userId, predictions: guestPicks }),
    }).then(res => {
      if (res.ok) {
        GuestStore.clear();
        const url = new URL(window.location.href);
        url.searchParams.delete("migrate");
        window.history.replaceState({}, "", url.toString());
      }
    }).catch(err => console.error("[migrate guest picks]", err));
  }, [migrateGuestPicks, migrated, groupId, userId]);

  // Determine section order: incomplete sections float to top
  useEffect(() => {
    const isSolo = groupId === "00000000-0000-0000-0000-000000000001";
    const sb = createClient();

    Promise.all([
      // How many group-stage match predictions exist for this user+group?
      sb.from("group_predictions")
        .select("match_id", { count: "exact", head: true })
        .eq("group_id", groupId)
        .eq("user_id", userId)
        .in("match_id", GROUP_STAGE_MATCH_IDS),
      // How many tournament picks exist?
      sb.from("group_predictions")
        .select("pred_type", { count: "exact", head: true })
        .eq("group_id", groupId)
        .eq("user_id", userId)
        .in("pred_type", TOURNAMENT_PRED_TYPES),
      // How many bonus questions exist for the group?
      isSolo
        ? Promise.resolve({ count: 0 })
        : sb.from("bonus_questions")
            .select("id", { count: "exact", head: true })
            .eq("group_id", groupId),
      // How many bonus answers has this user provided?
      isSolo
        ? Promise.resolve({ count: 0 })
        : sb.from("bonus_answers")
            .select("question_id", { count: "exact", head: true })
            .eq("group_id", groupId)
            .eq("user_id", userId),
    ]).then(([gsRes, tournRes, bqRes, baRes]) => {
      const gsCount    = gsRes.count    ?? 0;
      const tournCount = tournRes.count ?? 0;
      const bqTotal    = bqRes.count    ?? 0;
      const baCount    = baRes.count    ?? 0;

      // Score: 0 = empty (float first), 1 = partial, 2 = complete / N/A
      const scores: Record<SectionKey, number> = {
        group:      gsCount    === 0                    ? 0
                    : gsCount  >= GROUP_STAGE_MATCH_IDS.length ? 2 : 1,
        tournament: tournCount === 0 ? 0 : 1,
        bonus:      bqTotal    === 0 ? 2           // no questions = N/A, show last
                    : baCount  === 0 ? 0
                    : baCount  >= bqTotal ? 2 : 1,
      };

      const sorted = (["group", "tournament", "bonus"] as SectionKey[])
        .slice()
        .sort((a, b) => scores[a] - scores[b]);

      setSectionOrder(sorted);
      // Auto-open the most incomplete section
      const firstIncomplete = sorted.find(k => scores[k] === 0) ?? sorted[0];
      setOpenSection(firstIncomplete);
    });
  }, [groupId, userId]);

  const toggle = (section: SectionKey) => {
    setOpenSection(prev => prev === section ? null : section);
  };

  return (
    <div className="flex flex-col space-y-3 max-w-2xl mx-auto w-full pb-32 pt-4">

      {/* Group slider — shown above header when user has multiple groups */}
      {allGroups.length > 1 && (
        <div className="-mx-4 sm:-mx-6 -mt-4 mb-2">
          <GroupSwipeSelector groups={allGroups} activeGroupId={groupId} basePath="/predictions" />
        </div>
      )}

      {/* Page header */}
      <div className="pt-2 pb-1">
        <div className="font-barlow font-bold uppercase" style={{ fontSize: 9, letterSpacing: 2, color: "#3a7a3a" }}>
          FIFA World Cup 2026
        </div>
        <h1 className="font-barlow font-black uppercase" style={{ fontSize: 28, color: "#e0f2e0", lineHeight: 1.1 }}>
          My Picks
        </h1>
        {allGroups.length > 0 && (
          <div className="font-barlow font-bold mt-1" style={{ fontSize: 10, color: "#3a7a3a" }}>
            {allGroups.find(g => g.id === groupId)?.name ?? ""}
          </div>
        )}
      </div>

      {/* Accordion sections — ordered by completion (incomplete first) */}
      {sectionOrder.map(key => {
        const def = SECTION_DEFS[key];
        return (
          <AccordionSection
            key={key}
            icon={def.icon}
            title={def.title}
            open={openSection === key}
            onToggle={() => toggle(key)}
          >
            <div className="p-4">
              {key === "group" && (
                <GroupStagePredictions groupId={groupId} userId={userId} locked={false} isAdFree={isAdFree} isCorporate={isCorporate} />
              )}
              {key === "tournament" && (
                <TournamentPicks groupId={groupId} userId={userId} locked={false} />
              )}
              {key === "bonus" && (
                <BonusQuestions groupId={groupId} userId={userId} />
              )}
            </div>
          </AccordionSection>
        );
      })}
    </div>
  );
}