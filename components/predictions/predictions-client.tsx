"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { GroupStagePredictions } from "@/components/predictions/group-stage-predictions";
import { KnockoutPredictions } from "@/components/predictions/knockout-predictions";
import { LeaguePredictions } from "@/components/predictions/league-predictions";
import { TournamentPicks } from "@/components/dashboard/tournament-picks";
import { BonusQuestions } from "@/components/predictions/bonus-questions";
import { GuestStore } from "@/components/ui/guest-signup-modal";
import { useGroupContext } from "@/lib/contexts/group-context";
import { NextMatchCard } from "@/components/dashboard/next-match-card";
import { RecentResultsStrip } from "@/components/predictions/recent-results-strip";
import { LiveMatchHub } from "@/components/match/live-match-hub";
import { getNextScheduleMatch, toMatchType, type ScheduleMatch } from "@/lib/schedule";

interface PredictionsClientProps {
  groupId:            string;
  groupName:          string;
  // null/omitted = World Cup 2026 (every group's implicit competition before
  // groups.competition_id existed). Set = a league-format competition, which
  // has no group letters/knockout bracket, so the tab set/section content
  // differs (see isLeagueFormat below).
  groupCompetitionId?: string | null;
  groupCompetitionName?: string | null;
  allGroups:          Array<{ id: string; name: string; passkey: string }>;
  userId:             string;
  isPaid:             boolean;
  migrateGuestPicks?: boolean;
  isAdFree?:          boolean;
  isCorporate?:       boolean;
  allMatches?:        ScheduleMatch[];
  // Shows the Home-dashboard-style hero next-match card above the tabs.
  // Opt-in: only meaningful for a real, authenticated group context (Group
  // Detail's Predictions sub-sector) — not the standalone solo/guest
  // predictions flows, which use a placeholder groupId or no auth session.
  showNextMatchHero?: boolean;
}

type SectionKey = "group" | "knockout" | "league" | "tournament" | "bonus";

const WC_TABS: { key: SectionKey; label: string }[] = [
  { key: "group",      label: "GROUP STAGE" },
  { key: "knockout",   label: "KNOCKOUT" },
  { key: "tournament", label: "TOURNAMENT PICKS" },
  { key: "bonus",      label: "BONUS QUESTIONS" },
];

// League-format competitions (Premier League, La Liga, ...) have no group
// letters/knockout bracket — a single flat "MATCHES" tab replaces both.
const LEAGUE_TABS: { key: SectionKey; label: string }[] = [
  { key: "league",     label: "MATCHES" },
  { key: "tournament", label: "TOURNAMENT PICKS" },
  { key: "bonus",      label: "BONUS QUESTIONS" },
];

export function PredictionsClient({
  groupId, groupName, groupCompetitionId = null, groupCompetitionName = null, allGroups, userId, isPaid, migrateGuestPicks = false, isAdFree, isCorporate, allMatches = [],
  showNextMatchHero = false,
}: PredictionsClientProps) {
  void isPaid; void allGroups;

  const { predictions: ctxPredictions, refreshPredictions, setActiveUserId } = useGroupContext();

  const isLeagueFormat = Boolean(groupCompetitionId);
  const TABS = isLeagueFormat ? LEAGUE_TABS : WC_TABS;

  const [activeTab, setActiveTab] = useState<SectionKey>(TABS[0].key);
  const [migrated,  setMigrated]  = useState(false);
  const [openMatchId, setOpenMatchId] = useState<string | null>(null);

  // WC groups track "Group Stage predicted" specifically (the counter next
  // to the tab pills); a league-format group has no such distinction, so it
  // counts every predictable match instead.
  const trackedMatchIds = isLeagueFormat
    ? allMatches.filter(m => m.status !== "finished").map(m => m.id)
    : allMatches.filter(m => m.stage === "Group").map(m => m.id);
  const predictedCount = trackedMatchIds.filter(id => ctxPredictions[id] != null).length;

  const nextMatch = useMemo(() => {
    if (!showNextMatchHero) return null;
    const next = getNextScheduleMatch(allMatches, groupCompetitionId);
    return next ? toMatchType(next) : null;
  }, [showNextMatchHero, allMatches, groupCompetitionId]);

  const carouselRef  = useRef<HTMLDivElement>(null);
  const sectionRefs  = useRef<(HTMLDivElement | null)[]>(TABS.map(() => null));
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
    background: "var(--sf)",
    borderRadius: 14,
    border: "1px solid var(--br)",
    padding: 12,
    boxSizing: "border-box",
  };

  return (
    <div className="flex flex-col max-w-2xl mx-auto w-full pb-32 pt-4">

      {/* Webkit scrollbar suppression */}
      <style>{`.cc-carousel::-webkit-scrollbar{display:none}`}</style>

      {/* Page header */}
      <div className="pt-2 pb-3">
        <div className="ta-section-label">
          {groupCompetitionName ?? "FIFA World Cup 2026"}
        </div>
        <h1 className="ta-screen-title" style={{ color: "var(--tx)", lineHeight: 1.1 }}>
          My Picks
        </h1>
        {groupName && (
          <div className="ta-meta mt-1">
            {groupName}
          </div>
        )}
      </div>

      {nextMatch && (
        <div className="pb-4">
          <NextMatchCard match={nextMatch} groupId={groupId} onOpenMatchCenter={setOpenMatchId} />
        </div>
      )}

      {showNextMatchHero && (
        <RecentResultsStrip groupId={groupId} userId={userId} groupCompetitionId={groupCompetitionId} allMatches={allMatches} />
      )}

      {/* ── Match Center overlay ─────────────────────────────────── */}
      {openMatchId && nextMatch && openMatchId === nextMatch.id && (
        <LiveMatchHub
          matchId={nextMatch.id}
          home={nextMatch.home}
          away={nextMatch.away}
          homeFlagCode={nextMatch.homeFlagCode}
          awayFlagCode={nextMatch.awayFlagCode}
          kickoffAt={nextMatch.time}
          stage={nextMatch.stage}
          group={nextMatch.group}
          stadium={nextMatch.stadium}
          city={nextMatch.city}
          groupId={groupId}
          onClose={() => setOpenMatchId(null)}
        />
      )}

      {/* Sticky tab pills + progress counter */}
      <div
        className="sticky top-0 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6"
        style={{
          background: "rgba(18,23,31,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {/* Tab pill row */}
        <div
          className="cc-carousel flex gap-1.5 pt-2 pb-1.5 overflow-x-auto"
          style={{
            scrollbarWidth: "none",
            WebkitMaskImage: "linear-gradient(to right, black calc(100% - 28px), transparent 100%)",
            maskImage: "linear-gradient(to right, black calc(100% - 28px), transparent 100%)",
          }}
        >
          {TABS.map((tab, i) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); scrollToSection(i); }}
                className="ta-subtab-label shrink-0"
                style={{
                  padding: "6px 12px",
                  borderRadius: 20,
                  border: "1px solid transparent",
                  background: active ? "var(--ac)" : "var(--ip)",
                  color: active ? "var(--at)" : "var(--t2)",
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
        <div className="ta-meta pb-2">
          {predictedCount}/{trackedMatchIds.length} MATCHES PREDICTED
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

        {isLeagueFormat ? (
          /* ── Section: MATCHES (league-format competitions) ─────── */
          <div ref={el => { sectionRefs.current[TABS.findIndex(t => t.key === "league")] = el; }} className="cc-elevated" style={cardStyle}>
            <div className="flex items-center justify-between mb-3">
              <span className="ta-match-label" style={{ color: "var(--tx)" }}>
                Matches
              </span>
              <span className="ta-meta">
                {predictedCount}/{trackedMatchIds.length} PREDICTED
              </span>
            </div>
            <LeaguePredictions key={groupId} groupId={groupId} userId={userId} allMatches={allMatches} />
          </div>
        ) : (
          <>
            {/* ── Section: GROUP STAGE ─────────────────────────────── */}
            <div ref={el => { sectionRefs.current[TABS.findIndex(t => t.key === "group")] = el; }} className="cc-elevated" style={cardStyle}>
              <div className="flex items-center justify-between mb-3">
                <span className="ta-match-label" style={{ color: "var(--tx)" }}>
                  Group Stage
                </span>
                <span className="ta-meta">
                  {predictedCount}/{trackedMatchIds.length} PREDICTED
                </span>
              </div>
              <GroupStagePredictions
                key={groupId}
                groupId={groupId}
                userId={userId}
                locked={false}
                isAdFree={isAdFree}
                isCorporate={isCorporate}
                allMatches={allMatches}
              />
            </div>

            {/* ── Section: KNOCKOUT ───────────────────────────────── */}
            <div ref={el => { sectionRefs.current[TABS.findIndex(t => t.key === "knockout")] = el; }} className="cc-elevated" style={cardStyle}>
              <div className="mb-3">
                <span className="ta-match-label" style={{ color: "var(--tx)" }}>
                  Knockout
                </span>
              </div>
              <KnockoutPredictions key={groupId} groupId={groupId} userId={userId} allMatches={allMatches} />
            </div>
          </>
        )}

        {/* ── Section: TOURNAMENT PICKS ───────────────────────── */}
        <div ref={el => { sectionRefs.current[TABS.findIndex(t => t.key === "tournament")] = el; }} className="cc-elevated" style={cardStyle}>
          <div className="mb-3">
            <span className="ta-match-label" style={{ color: "var(--tx)" }}>
              Tournament Picks
            </span>
          </div>
          <TournamentPicks key={groupId} groupId={groupId} userId={userId} locked={false} isLeagueFormat={isLeagueFormat} competitionId={groupCompetitionId} competitionName={groupCompetitionName} />
        </div>

        {/* ── Section: BONUS QUESTIONS ────────────────────────── */}
        <div ref={el => { sectionRefs.current[TABS.findIndex(t => t.key === "bonus")] = el; }} className="cc-elevated" style={cardStyle}>
          <div className="mb-3">
            <span className="ta-match-label" style={{ color: "var(--tx)" }}>
              Bonus Questions
            </span>
          </div>
          <BonusQuestions key={groupId} groupId={groupId} userId={userId} />
        </div>

      </div>
    </div>
  );
}
