"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Share2, Lock, CheckCircle2, XCircle } from "lucide-react";
import { useLocale } from "@/components/i18n/locale-provider";
import { interpolate } from "@/lib/i18n";
import { PlayerPicker } from "@/components/predictions/player-picker";
import { DailyChallengeTeamPicker } from "@/components/daily-challenge/daily-challenge-team-picker";
import { BallLoader } from "@/components/ui/BallLoader";
import { buildDailyPuzzleAuthWallUrl } from "@/lib/auth-wall";
import { loadLocalAttempt, saveLocalAttempt } from "@/lib/daily-challenge-storage";
import type { ClueField, GameType } from "@/lib/services/daily-challenge";

const surface = { background: "var(--sf)", border: "1px solid var(--br)", borderRadius: 22 } as const;

type ClueState = {
  cluesUnlocked: ClueField[];
  values: {
    nationality?: string | null;
    club?: string | null;
    position?: string | null;
    age?: number | null;
    league?: string | null;
    silhouetteUrl?: string | null;
  };
};

type Reveal = {
  fullName: string | null;
  photoUrl: string | null;
  photoAttribution: { licenseShortName: string | null; artist: string | null } | null;
  facts: string[];
};

type TodayResponse = {
  challengeId: string;
  challengeDate: string;
  gameType: GameType;
  tryLimit: number;
  clueOrder: ClueField[];
  clueState: ClueState;
  attempt: { guessCount: number; solved: boolean; outOfTries: boolean; guesses: { player_id: string; correct: boolean }[]; shareText: string | null } | null;
};

type GuessResponse = {
  correct: boolean;
  solved: boolean;
  outOfTries: boolean;
  guessCount: number;
  clueState: ClueState;
  shareText: string | null;
  reveal: Reveal | null;
};

const FOOTBALLER_CLUE_LABEL_KEY: Record<string, "dc_clue_nationality" | "dc_clue_club" | "dc_clue_position" | "dc_clue_age" | "dc_clue_silhouette"> = {
  nationality: "dc_clue_nationality",
  club: "dc_clue_club",
  position: "dc_clue_position",
  age: "dc_clue_age",
  silhouette: "dc_clue_silhouette",
};

const CLUB_CLUE_LABEL_KEY: Record<string, "dc_clue_league" | "dc_clue_crest"> = {
  league: "dc_clue_league",
  silhouette: "dc_clue_crest",
};

function clueLabelKey(gameType: GameType, clue: ClueField) {
  return gameType === "guess_club" ? CLUB_CLUE_LABEL_KEY[clue] : FOOTBALLER_CLUE_LABEL_KEY[clue];
}

export function DailyChallengeClient({ userId }: { userId: string | null }) {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState<TodayResponse | null>(null);
  const [guessCount, setGuessCount] = useState(0);
  const [solved, setSolved] = useState(false);
  const [outOfTries, setOutOfTries] = useState(false);
  const [shareText, setShareText] = useState<string | null>(null);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastGuessCorrect, setLastGuessCorrect] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  const completed = solved || outOfTries;

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/daily-challenge");
      const data = (await res.json()) as TodayResponse;

      if (!userId) {
        const local = loadLocalAttempt(data.challengeDate);
        const wrongCount = local.guesses.filter(g => !g.correct).length;
        if (local.guesses.length > 0) {
          const refetch = await fetch(`/api/daily-challenge?wrongGuesses=${wrongCount}`);
          const refreshed = (await refetch.json()) as TodayResponse;
          setToday(refreshed);
          setGuessCount(local.guesses.length);
          setSolved(local.guesses.some(g => g.correct));
          setOutOfTries(!local.guesses.some(g => g.correct) && local.guesses.length >= refreshed.tryLimit);
          setLoading(false);
          return;
        }
      }

      setToday(data);
      if (data.attempt) {
        setGuessCount(data.attempt.guessCount);
        setSolved(data.attempt.solved);
        setOutOfTries(data.attempt.outOfTries);
        setShareText(data.attempt.shareText);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const wrongGuessCount = guessCount - (solved ? 1 : 0);

  const handleGuess = useCallback(
    async (playerId: string) => {
      if (!today || completed || submitting) return;
      setSubmitting(true);
      try {
        const res = await fetch("/api/daily-challenge/guess", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, priorWrongGuesses: wrongGuessCount }),
        });
        const data = (await res.json()) as GuessResponse;

        setLastGuessCorrect(data.correct);
        setGuessCount(data.guessCount);
        setSolved(data.solved);
        setOutOfTries(data.outOfTries);
        setShareText(data.shareText);
        setReveal(data.reveal);
        setToday(prev => (prev ? { ...prev, clueState: data.clueState } : prev));
        setSelectedName("");

        if (!userId) {
          const local = loadLocalAttempt(today.challengeDate);
          saveLocalAttempt(today.challengeDate, {
            guesses: [...local.guesses, { player_id: playerId, correct: data.correct }],
          });
        }
      } finally {
        setSubmitting(false);
      }
    },
    [today, completed, submitting, userId, wrongGuessCount]
  );

  const handleShare = useCallback(async () => {
    if (!shareText) return;
    const url = typeof window !== "undefined" ? `${window.location.origin}/daily-challenge` : "";
    const text = `${shareText}\n${url}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [shareText]);

  const handleSignupPrompt = useCallback(() => {
    if (!today) return;
    const url = buildDailyPuzzleAuthWallUrl(`${pathname}?puzzle=${today.challengeDate}`, today.challengeDate);
    router.push(url);
  }, [today, pathname, router]);

  const clueOrder = today?.clueOrder ?? [];
  const clueState = today?.clueState;

  // The "silhouette" clue's value is stored under the `silhouetteUrl` key
  // (ClueState["values"] has no `silhouette` property) — index through this
  // rather than `values[clue]` directly, which always resolved to undefined.
  function clueValue(clue: ClueField): ClueState["values"][keyof ClueState["values"]] {
    if (!clueState) return undefined;
    const key = clue === "silhouette" ? "silhouetteUrl" : (clue as keyof ClueState["values"]);
    return clueState.values[key];
  }

  const dots = useMemo(() => {
    if (!today) return [];
    return Array.from({ length: today.tryLimit }, (_, i) => {
      if (i < guessCount - (solved ? 1 : 0)) return "wrong" as const;
      if (i === guessCount - 1 && solved) return "correct" as const;
      return "empty" as const;
    });
  }, [today, guessCount, solved]);

  if (loading || !today) {
    return (
      <div className="py-16 flex justify-center">
        <BallLoader size="lg" label={t("nav_daily_challenge")} />
      </div>
    );
  }

  const isClub = today.gameType === "guess_club";
  const pageTitle = isClub ? t("dc_club_page_title") : t("dc_page_title");
  const tagline = isClub ? t("dc_club_tagline") : t("dc_tagline");
  const guessPlaceholder = isClub ? t("dc_club_guess_placeholder") : t("dc_guess_placeholder");
  const revealHeading = isClub ? t("dc_club_reveal_heading") : t("dc_reveal_heading");

  return (
    <div className="space-y-5">
      <div>
        <div className="label-caps mb-1">{isClub ? "🛡️" : "⚽"} {pageTitle}</div>
        <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight" style={{ color: "var(--tx)" }}>
          {pageTitle}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--t2)" }}>{tagline}</p>
      </div>

      {/* Try counter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold" style={{ color: "var(--t2)" }}>
          {interpolate(t("dc_try_of"), {
            current: Math.min(guessCount + (completed ? 0 : 1), today.tryLimit),
            total: today.tryLimit,
          })}
        </span>
        <div className="flex gap-1.5">
          {dots.map((d, i) => (
            <span
              key={i}
              className="h-2.5 w-2.5 rounded-full"
              style={{
                background: d === "correct" ? "#00c46a" : d === "wrong" ? "#f87171" : "var(--ip)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Clues */}
      <div className="p-5 cc-elevated grid grid-cols-2 sm:grid-cols-5 gap-3" style={surface}>
        {clueOrder.map(clue => {
          const unlocked = clueState?.cluesUnlocked.includes(clue) ?? false;
          const value = clueValue(clue);
          return (
            <div key={clue} className="flex flex-col items-center gap-1.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--t2)" }}>
                {t(clueLabelKey(today.gameType, clue))}
              </span>
              {!unlocked ? (
                <div className="flex items-center justify-center h-10 w-10 rounded-xl" style={{ background: "var(--ip)" }}>
                  <Lock size={14} style={{ color: "var(--t2)" }} />
                </div>
              ) : clue === "silhouette" ? (
                value ? (
                  <img
                    src={value as string}
                    alt=""
                    className={isClub ? "h-14 w-14 rounded-xl object-contain p-1.5" : "h-14 w-14 rounded-xl object-cover"}
                    style={{ filter: "brightness(0)", background: "var(--ip)" }}
                  />
                ) : (
                  <span className="text-xs" style={{ color: "var(--t2)" }}>—</span>
                )
              ) : (
                <span className="text-sm font-bold" style={{ color: "var(--tx)" }}>
                  {value ?? "—"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Result banner */}
      {lastGuessCorrect === false && !completed && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)" }}>
          <XCircle size={16} style={{ color: "#f87171" }} />
          <span className="text-sm font-bold" style={{ color: "#f87171" }}>{t("dc_result_incorrect")}</span>
        </div>
      )}

      {/* Guess input or completed state */}
      {!completed ? (
        <div className="p-5 cc-elevated" style={surface}>
          {isClub ? (
            <DailyChallengeTeamPicker
              value={selectedName}
              onSelect={setSelectedName}
              onSelectTeam={team => handleGuess(team.id)}
              label={guessPlaceholder}
            />
          ) : (
            <PlayerPicker
              value={selectedName}
              onSelect={setSelectedName}
              onSelectPlayer={player => handleGuess(player.id)}
              includeGK
              label={guessPlaceholder}
            />
          )}
        </div>
      ) : (
        <div className="p-5 cc-elevated space-y-4" style={surface}>
          <div className="flex items-center gap-2">
            {solved ? <CheckCircle2 size={18} style={{ color: "#00c46a" }} /> : <XCircle size={18} style={{ color: "#f87171" }} />}
            <span className="text-base font-black" style={{ color: "var(--tx)" }}>
              {solved ? t("dc_result_correct") : t("dc_result_out_of_tries")}
            </span>
          </div>

          {reveal && (
            <div className="flex items-center gap-4">
              {reveal.photoUrl && (
                <img
                  src={reveal.photoUrl}
                  alt={reveal.fullName ?? ""}
                  className={isClub ? "h-20 w-20 rounded-2xl object-contain p-2" : "h-20 w-20 rounded-2xl object-cover"}
                  style={{ background: "var(--ip)" }}
                />
              )}
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--t2)" }}>{revealHeading}</div>
                <div className="text-lg font-black" style={{ color: "var(--tx)" }}>{reveal.fullName}</div>
              </div>
            </div>
          )}

          {reveal && reveal.facts.length > 0 && (
            <ul className="space-y-1">
              {reveal.facts.map((fact, i) => (
                <li key={i} className="text-sm" style={{ color: "var(--t2)" }}>• {fact}</li>
              ))}
            </ul>
          )}

          {reveal?.photoAttribution?.artist && (
            <p className="text-[11px]" style={{ color: "var(--t2)" }}>
              {interpolate(t("dc_photo_attribution"), {
                artist: reveal.photoAttribution.artist,
                license: reveal.photoAttribution.licenseShortName ?? "",
              })}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold cc-elevated-interactive"
              style={{ background: "var(--ac)", color: "#03110c" }}
            >
              <Share2 size={15} />
              {copied ? t("dc_share_copied") : t("dc_share_button")}
            </button>

            {!userId && (
              <button
                type="button"
                onClick={handleSignupPrompt}
                className="px-4 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: "var(--ip)", color: "var(--tx)" }}
              >
                {t("dc_signup_cta")}
              </button>
            )}
          </div>

          {!userId && <p className="text-xs" style={{ color: "var(--t2)" }}>{t("dc_signup_prompt")}</p>}
        </div>
      )}
    </div>
  );
}
