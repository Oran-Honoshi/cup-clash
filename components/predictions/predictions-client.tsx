"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Target, Trophy, Puzzle } from "lucide-react";
import { useRouter } from "next/navigation";
import { GroupStagePredictions } from "@/components/predictions/group-stage-predictions";
import { TournamentPicks } from "@/components/dashboard/tournament-picks";
import { BonusQuestions } from "@/components/predictions/bonus-questions";
import { GuestStore } from "@/components/ui/guest-signup-modal";
import { useLocale } from "@/components/i18n/locale-provider";
import { useGroupContext } from "@/lib/contexts/group-context";

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

export function PredictionsClient({
  groupId, groupName, allGroups, userId, isPaid, migrateGuestPicks = false, isAdFree, isCorporate,
}: PredictionsClientProps) {
  const { t } = useLocale();
  const [openSection, setOpenSection] = useState<"group" | "tournament" | "bonus" | null>("group");
  const [migrated,    setMigrated]    = useState(false);
  const router = useRouter();
  const { setSelectedGroupId } = useGroupContext();

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

  const toggle = (section: "group" | "tournament" | "bonus") => {
    setOpenSection(prev => prev === section ? null : section);
  };

  void router; void setSelectedGroupId; void allGroups; void groupName; void isPaid; void t;

  return (
    <div className="flex flex-col space-y-3 max-w-2xl mx-auto w-full pb-32 pt-4">

      {/* Page header */}
      <div className="pt-2 pb-1">
        <div className="font-barlow font-bold uppercase" style={{ fontSize: 9, letterSpacing: 2, color: "#3a7a3a" }}>
          FIFA World Cup 2026
        </div>
        <h1 className="font-barlow font-black uppercase" style={{ fontSize: 28, color: "#e0f2e0", lineHeight: 1.1 }}>
          My Picks
        </h1>
      </div>

      {/* Accordion sections */}
      <AccordionSection
        icon={<Target size={16} style={{ color: "#00e5a0" }} />}
        title="Group Stage"
        open={openSection === "group"}
        onToggle={() => toggle("group")}
      >
        <div className="p-4">
          <GroupStagePredictions groupId={groupId} userId={userId} locked={false} isAdFree={isAdFree} isCorporate={isCorporate} />
        </div>
      </AccordionSection>

      <AccordionSection
        icon={<Trophy size={16} style={{ color: "#ffaa00" }} />}
        title="Tournament Picks"
        open={openSection === "tournament"}
        onToggle={() => toggle("tournament")}
      >
        <div className="p-4">
          <TournamentPicks groupId={groupId} userId={userId} locked={false} />
        </div>
      </AccordionSection>

      <AccordionSection
        icon={<Puzzle size={16} style={{ color: "#a78bfa" }} />}
        title="Bonus Questions"
        open={openSection === "bonus"}
        onToggle={() => toggle("bonus")}
      >
        <div className="p-4">
          <BonusQuestions groupId={groupId} userId={userId} />
        </div>
      </AccordionSection>
    </div>
  );
}