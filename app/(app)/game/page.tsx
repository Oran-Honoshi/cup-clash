export const dynamic = "force-dynamic";

import Link from "next/link";
import { User, Shield, Target, Brain, BarChart2 } from "lucide-react";
import { getCurrentUserProfile, getAllUserGroups } from "@/lib/services/user-group";
import { pickGameTypeForDate, todayISO } from "@/lib/services/daily-challenge";
import { DailyLeaderboardPanel } from "@/components/daily-challenge/daily-leaderboard-panel";
import { DuelCard } from "@/components/game/duel-card";
import { MatchDuelCard } from "@/components/game/match-duel-card";
import { OracleGameRoomSection } from "@/components/game/oracle-game-room-section";
import { OracleDuelInviteCard } from "@/components/game/oracle-duel-card";
import { getOracleGameRoomData, getNextOracleMatch } from "@/lib/services/oracle";
import { getMyDuelForMatch } from "@/lib/services/oracle-duels";
import { ZONES } from "@/lib/zones";

const surface = { background: "var(--sf)", border: "1px solid var(--br)", borderRadius: 22 } as const;

// Game Room hub — real content for the Game tab (Phase 1 shipped this as a
// placeholder pointing straight at /daily-challenge). All games here stay
// fully anonymous-playable except the Duel card, which needs an identified
// opponent on both sides.
export default async function GameRoomPage() {
  const profile = await getCurrentUserProfile();
  const zone = ZONES.find(z => z.key === "game")!;
  const todayGameType = pickGameTypeForDate(todayISO());

  const primaryGroupId = profile ? (await getAllUserGroups(profile.id))[0]?.group_id ?? null : null;
  const oracleData = await getOracleGameRoomData(profile?.id ?? null, primaryGroupId);

  const nextOracleDuelMatch = await getNextOracleMatch();
  const myOracleDuelPick = profile && nextOracleDuelMatch
    ? await getMyDuelForMatch(profile.id, nextOracleDuelMatch.match.id)
    : null;

  const grid = [
    {
      key: "footballer",
      title: "Guess the Footballer",
      subtitle: "Progressive clues, one player.",
      icon: User,
      href: "/daily-challenge",
      live: todayGameType === "guess_footballer",
    },
    {
      key: "club",
      title: "Guess the Club",
      subtitle: "League + crest silhouette.",
      icon: Shield,
      href: "/daily-challenge",
      live: todayGameType === "guess_club",
    },
    {
      key: "score",
      title: "Guess the Score",
      subtitle: "One historic match, four tries.",
      icon: Target,
      href: "/game/guess-the-score",
      live: true,
    },
    {
      key: "trivia",
      title: "Daily Trivia",
      subtitle: "Group trivia, points on the line.",
      icon: Brain,
      href: "/trivia",
      live: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: zone.accent, marginBottom: 4 }}>
          Arcade
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, textTransform: "uppercase", color: "var(--tx)", margin: 0 }}>
          Game Room
        </h1>
        <p style={{ fontSize: 14, color: "var(--mt)", fontFamily: "var(--font-ui)", marginTop: 4 }}>
          Free-to-play mini-games. Sign in only to save results to a leaderboard.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {grid.map(cell => {
          const Icon = cell.icon;
          const isDailyChallengeGame = cell.key === "footballer" || cell.key === "club";
          const cardContent = (
            <>
              <div className="flex items-center justify-between">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `color-mix(in srgb, ${zone.accent} 15%, transparent)` }}
                >
                  <Icon size={16} style={{ color: zone.accent }} />
                </div>
                {isDailyChallengeGame && (
                  <span
                    className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                    style={{
                      background: cell.live ? `color-mix(in srgb, ${zone.accent} 20%, transparent)` : "var(--ip)",
                      color: cell.live ? zone.accent : "var(--mt)",
                    }}
                  >
                    {cell.live ? "Today" : "Tomorrow"}
                  </span>
                )}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800, color: "var(--tx)" }}>
                {cell.title}
              </div>
              <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--t2)", margin: 0 }}>
                {cell.subtitle}
              </p>
            </>
          );

          // The two daily-challenge games alternate day-to-day — only one is
          // "live" at a time. The other's card must not navigate at all: it
          // used to still link to /daily-challenge, which silently rendered
          // whichever game actually was live with no explanation.
          if (isDailyChallengeGame && !cell.live) {
            return (
              <div
                key={cell.key}
                aria-disabled="true"
                className="flex flex-col gap-2 p-4"
                style={{ ...surface, opacity: 0.55, cursor: "default" }}
              >
                {cardContent}
              </div>
            );
          }

          return (
            <Link
              key={cell.key}
              href={cell.href}
              className="flex flex-col gap-2 p-4 transition-transform hover:-translate-y-0.5"
              style={{ ...surface, textDecoration: "none" }}
            >
              {cardContent}
            </Link>
          );
        })}
      </div>

      <DuelCard userId={profile?.id ?? null} />

      <MatchDuelCard userId={profile?.id ?? null} />

      <OracleDuelInviteCard
        match={nextOracleDuelMatch?.match ?? null}
        prediction={nextOracleDuelMatch?.prediction ?? null}
        existing={myOracleDuelPick ? { home: myOracleDuelPick.homeScore, away: myOracleDuelPick.awayScore } : null}
        signedIn={!!profile}
      />

      <OracleGameRoomSection cards={oracleData.cards} record={oracleData.record} hasMore={oracleData.hasMore} />

      <div>
        <div className="flex items-center gap-2 mb-2">
          <BarChart2 size={14} style={{ color: zone.accent }} />
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--t2)" }}>
            Global Rank
          </span>
        </div>
        <DailyLeaderboardPanel groupId={null} />
      </div>
    </div>
  );
}
