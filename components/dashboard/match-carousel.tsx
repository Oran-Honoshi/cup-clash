"use client";

import { useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NextMatchCard } from "@/components/dashboard/next-match-card";
import { cn } from "@/lib/utils";
import { FOCUS_RING } from "@/lib/a11y";
import type { Match } from "@/lib/types";

interface MatchCarouselProps {
  matches: Match[];
  groupId: string;
}

export function MatchCarousel({ matches, groupId }: MatchCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    setActive(Math.min(Math.round(el.scrollLeft / el.clientWidth), matches.length - 1));
  }, [matches.length]);

  const goTo = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(i, matches.length - 1));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
    setActive(clamped);
  }, [matches.length]);

  if (!matches.length) return null;
  if (matches.length === 1) return <NextMatchCard match={matches[0]} groupId={groupId} />;

  return (
    <div>
      {/* Scrollable track */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="carousel-track"
        style={{
          display: "flex",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
        }}
      >
        {matches.map((match, i) => (
          <div
            key={match.id}
            style={{ scrollSnapAlign: "start", flex: "0 0 100%", minWidth: "100%" }}
          >
            <NextMatchCard
              match={match}
              groupId={groupId}
              cardLabel={i === 0 ? undefined : "Upcoming"}
            />
          </div>
        ))}
      </div>

      {/* Dots + prev/next */}
      <div className="flex items-center justify-center gap-2.5 mt-3">
        <button
          onClick={() => goTo(active - 1)}
          disabled={active === 0}
          aria-label="Previous match"
          className={cn("flex items-center justify-center rounded-lg transition-all", FOCUS_RING)}
          style={{
            width: 24, height: 24,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "transparent",
            color: active === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
            cursor: active === 0 ? "not-allowed" : "pointer",
          }}
        >
          <ChevronLeft size={13} />
        </button>

        {matches.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Match ${i + 1} of ${matches.length}`}
            className={cn("border-0 p-0 cursor-pointer", FOCUS_RING)}
            style={{
              height: 6,
              width: i === active ? 20 : 6,
              borderRadius: 3,
              background: i === active ? "#00D4FF" : "rgba(255,255,255,0.2)",
              transition: "all 0.25s",
            }}
          />
        ))}

        <button
          onClick={() => goTo(active + 1)}
          disabled={active === matches.length - 1}
          aria-label="Next match"
          className={cn("flex items-center justify-center rounded-lg transition-all", FOCUS_RING)}
          style={{
            width: 24, height: 24,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "transparent",
            color: active === matches.length - 1 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
            cursor: active === matches.length - 1 ? "not-allowed" : "pointer",
          }}
        >
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}
