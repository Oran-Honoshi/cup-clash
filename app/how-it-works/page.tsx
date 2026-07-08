import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Trophy, Target, Users, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "How it Works — Cup Clash Free World Cup Prediction Game",
  description: "Learn how Cup Clash works: scoring rules, how to predict match scores, the leaderboard, knockout bracket picks, and tie-breakers. Skill-based, free to play.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl p-6 sm:p-8"
      style={{ background: "rgba(18,14,38,0.5)", backdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.1)" }}>
      <h2 className="font-display text-2xl uppercase font-black mb-5 text-white">{title}</h2>
      {children}
    </section>
  );
}

function ScoreRow({ label, pts, detail, accent = "#00FF88" }: { label: string; pts: string; detail?: string; accent?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b last:border-0"
      style={{ borderColor: "rgba(255,255,255,0.07)" }}>
      <div>
        <div className="text-sm font-bold text-white">{label}</div>
        {detail && <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{detail}</div>}
      </div>
      <div className="font-display font-black text-lg shrink-0" style={{ color: accent }}>+{pts}</div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #080C16 0%, #0B1222 100%)" }}>
      <div className="max-w-3xl mx-auto px-5 py-16">

        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-10 transition-opacity hover:opacity-70"
          style={{ color: "#00D4FF" }}>
          ← Cup Clash
        </Link>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6"
          style={{ borderColor: "rgba(0,212,255,0.3)", background: "rgba(0,212,255,0.08)" }}>
          <Zap size={11} style={{ color: "#00D4FF" }} fill="#00D4FF" />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#00D4FF" }}>
            Skill-based · Free to play
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl uppercase font-black mb-4 text-white leading-tight">
          How It Works
        </h1>
        <p className="text-lg mb-12" style={{ color: "rgba(255,255,255,0.55)" }}>
          Cup Clash is a free social prediction game for FIFA World Cup 2026.
          Here is everything you need to know.
        </p>

        <div className="space-y-5">

          <Section title="1. Create or join a group">
            <div className="space-y-3 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-black text-xs"
                  style={{ background: "rgba(0,255,136,0.15)", color: "#00FF88" }}>1</div>
                <p><strong className="text-white">Create a group</strong> — sign up, name your group, and customise scoring rules. Free, no card required.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-black text-xs"
                  style={{ background: "rgba(0,255,136,0.15)", color: "#00FF88" }}>2</div>
                <p><strong className="text-white">Share your passkey</strong> — a unique invite code your friends use to join your group. Share via WhatsApp, email, Slack, or any link.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-black text-xs"
                  style={{ background: "rgba(0,255,136,0.15)", color: "#00FF88" }}>3</div>
                <p><strong className="text-white">Everyone joins free</strong> — all members can predict immediately, appear on the leaderboard, and use every feature at no cost.</p>
              </div>
            </div>
          </Section>

          <Section title="2. Make your predictions">
            <div className="text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.7)" }}>
              <p>Before each match, enter your predicted scoreline — e.g. Brazil 2–1 France. Predictions lock automatically <strong className="text-white">5 minutes before kickoff</strong>. Once locked they cannot be changed.</p>
              <p className="mt-3">You can also make tournament-level picks: who wins the trophy, who is the top scorer, who is the top assister, and more. These are set once before the tournament (or before the applicable phase) and earn points when results come in.</p>
            </div>
          </Section>

          <Section title="3. Scoring rules">
            <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.6)" }}>
              Default point values — every value is customisable by your group admin.
            </p>

            <div className="mb-6">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
                Per match
              </div>
              <ScoreRow label="Correct outcome" pts="10" detail="Win / Draw / Loss — direction only" accent="#00FF88" />
              <ScoreRow label="Exact scoreline" pts="25" detail="Correct outcome (10 pts) + exact score bonus (15 pts)" accent="#00FF88" />
              <ScoreRow label="Knockout advancement" pts="20" detail="Correct team advances in R32, R16, QF, SF" accent="#00D4FF" />
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
                Tournament picks (set once)
              </div>
              <ScoreRow label="Tournament winner" pts="100" detail="Predict the World Cup champion" accent="#fbbf24" />
              <ScoreRow label="Top scorer (Golden Boot)" pts="50" detail="Predict the tournament's leading goalscorer" accent="#fbbf24" />
              <ScoreRow label="Top assister" pts="50" detail="Predict the tournament's leading assister" accent="#fbbf24" />
              <ScoreRow label="Best defence" pts="40" detail="Team conceding fewest goals" accent="#f97316" />
              <ScoreRow label="Golden Ball" pts="40" detail="Best player of the tournament" accent="#f97316" />
              <ScoreRow label="Best young player" pts="30" detail="Best player under 21" accent="#94a3b8" />
            </div>
          </Section>

          <Section title="4. Leaderboard">
            <div className="text-sm leading-relaxed space-y-3" style={{ color: "rgba(255,255,255,0.7)" }}>
              <p>The leaderboard updates in real-time as match results come in. Every group member is shown — there is no minimum score required to appear.</p>
              <p><strong className="text-white">Tie-breaker</strong> — if two or more members have identical points, ties are broken in order: (1) most exact score predictions, (2) closest guess to the minute of the first goal in the Final, (3) a correct Tournament Winner pick. If members are still tied after all three, it's a genuine tie — the group admin can split the prize for that position between them.</p>
            </div>
          </Section>

          <Section title="5. Phases of the tournament">
            <div className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
              <div className="space-y-3">
                {[
                  { phase: "Group Stage", dates: "Jun 11 – Jun 29", matches: "72 matches across 12 groups", icon: <Users size={14} /> },
                  { phase: "Round of 32", dates: "Jul 1 – Jul 6", matches: "16 knockout matches", icon: <Target size={14} /> },
                  { phase: "Round of 16", dates: "Jul 6 – Jul 8", matches: "8 knockout matches", icon: <Target size={14} /> },
                  { phase: "Quarter-Finals", dates: "Jul 9 – Jul 11", matches: "4 matches", icon: <Target size={14} /> },
                  { phase: "Semi-Finals", dates: "Jul 14 – Jul 15", matches: "2 matches", icon: <Target size={14} /> },
                  { phase: "Third Place Playoff", dates: "Jul 18", matches: "1 match", icon: <Target size={14} /> },
                  { phase: "Final", dates: "Jul 19", matches: "MetLife Stadium, New Jersey", icon: <Trophy size={14} /> },
                ].map(({ phase, dates, matches, icon }) => (
                  <div key={phase} className="flex items-start gap-3 py-2.5 border-b last:border-0"
                    style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                    <div className="mt-0.5" style={{ color: "#00D4FF" }}>{icon}</div>
                    <div>
                      <div className="font-bold text-white">{phase}</div>
                      <div style={{ color: "rgba(255,255,255,0.45)" }}>{dates} · {matches}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section title="6. Free vs Ad-free">
            <div className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
              <p>Every feature of Cup Clash is available for free — predictions, leaderboard, chat, and all scoring rules. Free members see occasional ads that help keep the platform running.</p>
              <p className="mt-3">The optional <strong className="text-white">$2 upgrade</strong> removes ads for the duration of the 2026 World Cup tournament. It is strictly an ad-free toggle — it does not unlock any extra features or change your standing on the leaderboard.</p>
              <p className="mt-3">Corporate-sponsored groups are ad-free for all employees at no individual cost.</p>
            </div>
          </Section>

        </div>

        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row gap-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <Link href="/signup">
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#080C16" }}>
              Play Free <ArrowRight size={14} />
            </button>
          </Link>
          <Link href="/about">
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:opacity-70"
              style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", background: "transparent" }}>
              About Cup Clash
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}
