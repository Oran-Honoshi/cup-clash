"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { GroupStagePredictions } from "@/components/predictions/group-stage-predictions";
import { KnockoutPredictions } from "@/components/predictions/knockout-predictions";
import { TournamentPicks } from "@/components/dashboard/tournament-picks";
import { BonusQuestions } from "@/components/predictions/bonus-questions";
import { GuestStore } from "@/components/ui/guest-signup-modal";
import { useGroupContext } from "@/lib/contexts/group-context";
import type { ScheduleMatch } from "@/lib/schedule";

interface PredictionsClientProps {
  groupId:            string;
  groupName:          string;
  allGroups:          Array<{ id: string; name: string; passkey: string }>;
  userId:             string;
  isPaid:             boolean;
  migrateGuestPicks?: boolean;
  isAdFree?:          boolean;
  isCorporate?:       boolean;
  allMatches?:        ScheduleMatch[];
}

type SectionKey = "group" | "knockout" | "tournament" | "bonus";

const TABS: { key: SectionKey; label: string }[] = [
  { key: "group",      label: "GROUP STAGE" },
  { key: "knockout",   label: "KNOCKOUT" },
  { key: "tournament", label: "TOURNAMENT PICKS" },
  { key: "bonus",      label: "BONUS QUESTIONS" },
];

export function PredictionsClient({
  groupId, groupName, allGroups, userId, isPaid, migrateGuestPicks = false, isAdFree, isCorporate, allMatches = [],
}: PredictionsClientProps) {
  void isPaid; void allGroups;

  const { predictions: ctxPredictions, refreshPredictions, setActiveUserId } = useGroupContext();

  const [activeTab, setActiveTab] = useState<SectionKey>("group");
  const [migrated,  setMigrated]  = useState(false);

  const groupStageMatchIds = allMatches.filter(m => m.stage === "Group").map(m => m.id);
  const predictedCount = groupStageMatchIds.filter(id => ctxPredictions[id] != null).length;

  const carouselRef  = useRef<HTMLDivElement>(null);
  const sectionRefs  = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  // Prevent observer from overriding an in-flight programmatic scroll
  const scrollingRef = useRef(false);

  // ── Guest-picks migration ───────────────────────────────────────────────────
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

  // ── Populate context predictions so count stays in sync with other pages ─────
  useEffect(() => {
    setActiveUserId(userId);
    refreshPredictions(groupId, userId);
  }, [groupId, userId, refreshPredictions, setActiveUserId]);

  // ── Scroll carousel to section by index ─────────────────────────────────────
  const scrollToSection = useCallback((index: number) => {
    const carousel = carouselRef.current;
    const el = sectionRefs.current[index];
    if (!carousel || !el) return;
    scrollingRef.current = true;
    const offset = el.getBoundingClientRect().left - carousel.getBoundingClientRect().left;
    carousel.scrollBy({ left: offset, behavior: "smooth" });
    // Release lock after animation (~400ms)
    setTimeout(() => { scrollingRef.current = false; }, 500);
  }, []);

  // ── IntersectionObserver — sync active tab with visible section ─────────────
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const observers: IntersectionObserver[] = [];
    sectionRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !scrollingRef.current) {
            setActiveTab(TABS[i].key);
          }
        },
        { root: carousel, threshold: 0.5 },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  const cardStyle: React.CSSProperties = {
    flex: "none",
    width: "85%",
    scrollSnapAlign: "start",
    background: "#0c1c0c",
    borderRadius: 14,
    border: "1px solid #1a3a1a",
    padding: 12,
    boxSizing: "border-box",
  };

  return (
    <div className="flex flex-col max-w-2xl mx-auto w-full pb-32 pt-4">

      {/* Webkit scrollbar suppression */}
      <style>{`.cc-carousel::-webkit-scrollbar{display:none}`}</style>

      {/* Page header */}
      <div className="pt-2 pb-3">
        <div className="font-barlow font-bold uppercase" style={{ fontSize: 9, letterSpacing: 2, color: "#3a7a3a" }}>
          FIFA World Cup 2026
        </div>
        <h1 className="font-barlow font-black uppercase" style={{ fontSize: 28, color: "#e0f2e0", lineHeight: 1.1 }}>
          My Picks
        </h1>
        {groupName && (
          <div className="font-barlow font-bold mt-1" style={{ fontSize: 10, color: "#3a7a3a" }}>
            {groupName}
          </div>
        )}
      </div>

      {/* Sticky tab pills + progress counter */}
      <div
        className="sticky top-0 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6"
        style={{
          background: "rgba(6,4,15,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {/* Tab pill row */}
        <div
          className="cc-carousel flex gap-1.5 pt-2 pb-1.5 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {TABS.map((tab, i) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); scrollToSection(i); }}
                className="font-barlow font-black uppercase shrink-0"
                style={{
                  fontSize: 10,
                  letterSpacing: 0.8,
                  padding: "6px 12px",
                  borderRadius: 20,
                  border: active ? "1px solid #00e5a0" : "1px solid #1a3a1a",
                  background: active ? "#162a16" : "transparent",
                  color: active ? "#00e5a0" : "#3a7a3a",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Progress counter */}
        <div
          className="font-barlow font-bold pb-2"
          style={{ fontSize: 9, color: "#3a7a3a", letterSpacing: 1 }}
        >
          {predictedCount}/{groupStageMatchIds.length} MATCHES PREDICTED
        </div>
      </div>

      {/* Horizontal snap carousel */}
      <div
        ref={carouselRef}
        className="cc-carousel flex mt-3"
        style={{
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          gap: 8,
        }}
      >

        {/* ── Section 1: GROUP STAGE ─────────────────────────────── */}
        <div ref={el => { sectionRefs.current[0] = el; }} style={cardStyle}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-barlow font-black uppercase" style={{ fontSize: 12, fontWeight: 700, color: "#e0f2e0" }}>
              Group Stage
            </span>
            <span className="font-barlow font-bold" style={{ fontSize: 10, color: "#3a7a3a" }}>
              {predictedCount}/{groupStageMatchIds.length} PREDICTED
            </span>
          </div>
          <GroupStagePredictions
            groupId={groupId}
            userId={userId}
            locked={false}
            isAdFree={isAdFree}
            isCorporate={isCorporate}
            allMatches={allMatches}
          />
        </div>

        {/* ── Section 2: KNOCKOUT ───────────────────────────────── */}
        <div ref={el => { sectionRefs.current[1] = el; }} style={cardStyle}>
          <div className="mb-3">
            <span className="font-barlow font-black uppercase" style={{ fontSize: 12, fontWeight: 700, color: "#e0f2e0" }}>
              Knockout
            </span>
          </div>
          <KnockoutPredictions groupId={groupId} userId={userId} allMatches={allMatches} />
        </div>

        {/* ── Section 3: TOURNAMENT PICKS ───────────────────────── */}
        <div ref={el => { sectionRefs.current[2] = el; }} style={cardStyle}>
          <div className="mb-3">
            <span className="font-barlow font-black uppercase" style={{ fontSize: 12, fontWeight: 700, color: "#e0f2e0" }}>
              Tournament Picks
            </span>
          </div>
          <TournamentPicks groupId={groupId} userId={userId} locked={false} />
        </div>

        {/* ── Section 4: BONUS QUESTIONS ────────────────────────── */}
        <div ref={el => { sectionRefs.current[3] = el; }} style={cardStyle}>
          <div className="mb-3">
            <span className="font-barlow font-black uppercase" style={{ fontSize: 12, fontWeight: 700, color: "#e0f2e0" }}>
              Bonus Questions
            </span>
          </div>
          <BonusQuestions groupId={groupId} userId={userId} />
        </div>

      </div>
    </div>
  );
}
