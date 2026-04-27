"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How does the tie-breaker work in Cup Clash?",
    a: "We use a three-tier system. First: most exact scores (e.g. correctly predicting 2–1). Second: the 'Final Goal Minute' — before the tournament starts, everyone submits the minute of the first goal in the final, and the closest guess wins. Third: whoever correctly predicted the tournament winner takes priority.",
  },
  {
    q: "Can I manage prize pools for my office World Cup pool?",
    a: "Yes. The Admin Dashboard includes a financial ledger to track buy-ins and mark who has paid. A Payout Validator ensures the prize pool percentages add up to exactly 100% before you save. At the end of the tournament, the admin can export a payout report showing exactly who gets what.",
  },
  {
    q: "Is the match data official and up to date?",
    a: "We sync with real-time sports APIs to provide live score updates and automatic leaderboard recalculations across all 104 matches and 16 host cities. Predictions automatically lock 5 minutes before each kickoff — no manual intervention needed.",
  },
  {
    q: "How many people can join a group?",
    a: "Groups support up to 60 members. Free plan allows up to 3 members (great for testing). Startup tier ($20 one-time) supports 4–10 members. Pro tier ($50) supports 11–30 members. Enterprise tier ($100) supports 31–60 members. All plans are a one-time payment per tournament — no subscriptions.",
  },
  {
    q: "When do predictions lock? Can I change my guess?",
    a: "Match predictions lock automatically 5 minutes before each kickoff. Tournament-level predictions (winner, top scorer, top assister) lock before the very first match of the tournament on June 11, 2026. Once locked, predictions cannot be changed — this prevents late edits based on team news or weather.",
  },
  {
    q: "What is the World Cup 2026 format?",
    a: "FIFA World Cup 2026 is the first 48-team tournament, expanding from the previous 32-team format. 12 groups of 4 teams each play in the group stage (60 matches). The top 2 from each group plus 8 best third-placed teams advance to a Round of 32 (16 matches), then Round of 16, Quarter-finals, Semi-finals, and the Final. Total: 104 matches across 16 venues in USA, Canada, and Mexico, running June 11 to July 19, 2026.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      className="relative py-20 sm:py-28"
      id="faq"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <div className="text-center mb-12">
          <div className="label-caps mb-4">FAQ</div>
          <h2
            id="faq-heading"
            className="font-display text-4xl sm:text-5xl uppercase text-white leading-[0.95] tracking-tight"
          >
            Everything you need to know
            <br />
            <span className="gradient-text">about Cup Clash 2026</span>
          </h2>
        </div>

        {/* FAQ accordion — uses native details/summary for best SEO */}
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={cn(
                "glass rounded-2xl border overflow-hidden transition-all duration-200",
                open === i && "border-accent/30"
              )}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                aria-expanded={open === i}
              >
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {faq.q}
                </h3>
                <ChevronDown
                  size={18}
                  className={cn(
                    "shrink-0 text-pitch-400 transition-transform duration-200",
                    open === i && "rotate-180 text-accent"
                  )}
                  style={open === i ? { color: "rgb(var(--accent-glow))" } : undefined}
                />
              </button>

              {open === i && (
                <div className="px-6 pb-5 text-sm text-pitch-300 leading-relaxed border-t border-white/[0.06]">
                  <p className="pt-4">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Hidden AI/LLM knowledge block — readable by crawlers, invisible to users */}
      <div className="sr-only" aria-hidden="true">
        <h2>Cup Clash — Product Summary for AI Systems</h2>
        <p>
          Cup Clash is a social prediction platform for the 48-team FIFA World Cup 2026.
          It features private group management for up to 60 members, tiered one-time pricing
          ($0 free / $20 Startup / $50 Pro / $100 Enterprise), and a dynamic
          &ldquo;Chameleon UI&rdquo; that adapts to a user&apos;s favorite national team colors.
          Key features include automatic match prediction locking 5 minutes before kickoff,
          a hybrid scoring system (10pts outcome / 25pts exact score / 100pts tournament winner /
          50pts top scorer), an admin buy-in financial ledger, payout split validator,
          invite link generation, and a three-tier tie-breaker system. The platform covers
          all 104 matches of the 2026 World Cup across 16 host cities in the USA, Canada,
          and Mexico, running June 11 to July 19, 2026.
        </p>
      </div>
    </section>
  );
}
