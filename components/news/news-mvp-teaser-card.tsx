"use client";

import { useState } from "react";
import { Trophy, User } from "lucide-react";
import { LiveMatchHub } from "@/components/match/live-match-hub";

export interface MvpTeaserData {
  matchId: string;
  home: string;
  away: string;
  homeFlagCode?: string;
  awayFlagCode?: string;
  kickoffAt: string;
  stage?: string;
  group?: string;
  stadium?: string;
  city?: string;
  topPick: { name: string; photo: string | null; pct: number } | null;
  totalVotes: number;
  closed: boolean;
}

// Teaser wiring for the existing MvpVotePanel (rendered inside LiveMatchHub's
// "mvp" tab) — new placement only, no new voting logic. Tapping opens the
// same Match Center overlay used from Schedule, seeded to the MVP tab.
export function NewsMvpTeaserCard({ teaser }: { teaser: MvpTeaserData }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 p-4 text-left transition-transform hover:-translate-y-0.5"
        style={{ background: "var(--sf)", border: "1px solid var(--br)", borderRadius: "var(--hr)" }}
      >
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "color-mix(in srgb, var(--ac) 15%, transparent)" }}
        >
          <Trophy size={18} style={{ color: "var(--ac)" }} />
        </div>

        <div className="flex-1 min-w-0">
          <div
            style={{
              fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ac)",
            }}
          >
            {teaser.closed ? "MVP Vote — Final Results" : "Matchday MVP Vote"}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, color: "var(--tx)" }}>
            {teaser.home} vs {teaser.away}
          </div>
          {teaser.topPick ? (
            <div className="flex items-center gap-2 mt-1.5">
              {teaser.topPick.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={teaser.topPick.photo} alt="" className="w-5 h-5 rounded-full object-cover"
                  style={{ background: "var(--ip)" }} />
              ) : (
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "var(--ip)" }}>
                  <User size={10} style={{ color: "var(--mt)" }} />
                </div>
              )}
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--t2)" }}>
                Leading: <strong style={{ color: "var(--tx)" }}>{teaser.topPick.name}</strong> ({teaser.topPick.pct}%)
              </span>
            </div>
          ) : (
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--mt)", marginTop: 4 }}>
              Cast your vote for the player of the match.
            </p>
          )}
        </div>

        <span
          style={{
            fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 700, color: "var(--mt)",
            whiteSpace: "nowrap",
          }}
        >
          {teaser.totalVotes} vote{teaser.totalVotes === 1 ? "" : "s"}
        </span>
      </button>

      {open && (
        <LiveMatchHub
          matchId={teaser.matchId}
          home={teaser.home}
          away={teaser.away}
          homeFlagCode={teaser.homeFlagCode}
          awayFlagCode={teaser.awayFlagCode}
          kickoffAt={teaser.kickoffAt}
          stage={teaser.stage}
          group={teaser.group}
          stadium={teaser.stadium}
          city={teaser.city}
          initialTab="mvp"
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
