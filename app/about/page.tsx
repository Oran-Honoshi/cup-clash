import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";

export const metadata: Metadata = {
  title: "About Cup Clash — Free Social Prediction Game for World Cup 2026",
  description: "Cup Clash is a free, skill-based social prediction game for FIFA World Cup 2026. Create a private group with friends or colleagues, predict all 104 matches, and compete on a live leaderboard. No subscriptions, no gambling.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #080C16 0%, #0B1222 100%)" }}>
      <div className="max-w-3xl mx-auto px-5 py-16">

        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-10 transition-opacity hover:opacity-70"
          style={{ color: "#00D4FF" }}>
          ← Cup Clash
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)" }}>
            <Trophy size={20} className="text-[#080C16]" />
          </div>
          <span className="font-display text-xl uppercase font-black text-white">
            Cup<span style={{ color: "#00D4FF" }}>Clash</span>
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl uppercase font-black mb-4 text-white leading-tight">
          About Cup Clash
        </h1>
        <p className="text-lg mb-12" style={{ color: "rgba(255,255,255,0.55)" }}>
          The free social prediction game for FIFA World Cup 2026.
        </p>

        <div className="space-y-10" style={{ color: "rgba(255,255,255,0.75)" }}>

          <section>
            <h2 className="font-display text-2xl uppercase font-black mb-3 text-white">What is Cup Clash?</h2>
            <p className="text-base leading-relaxed">
              Cup Clash is a free, skill-based social prediction game built for the FIFA World Cup 2026.
              You create a private group with friends, family, or colleagues — predict the score of every
              match across all 104 games — and compete on a live leaderboard that updates in real-time.
            </p>
            <p className="mt-4 text-base leading-relaxed">
              It is not gambling. There is no house, no odds, and no operator. It is a game of knowledge,
              research, and football intuition.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase font-black mb-3 text-white">Free to play</h2>
            <p className="text-base leading-relaxed">
              Every feature of Cup Clash is free. You can join any group, predict all 104 matches, and
              appear on the leaderboard without paying anything. The optional $2 upgrade removes ads for
              the duration of the tournament — that is all it does.
            </p>
            <p className="mt-4 text-base leading-relaxed">
              Companies can sponsor their whole team for a one-time flat fee ($75 up to 50 employees,
              $130 up to 100), so everyone joins ad-free with no payment screen.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase font-black mb-3 text-white">Skill-based competition</h2>
            <p className="text-base leading-relaxed">
              Correct match outcome earns 10 points. Nail the exact scoreline and you earn a 15-point
              bonus on top (25 total). Predicting the tournament winner earns 100 points. Top scorer and
              top assister are worth 50 each. Every round-by-round knockout pick adds 20 points.
            </p>
            <p className="mt-4 text-base leading-relaxed">
              The final rankings consistently reward members who study teams, follow form, and think
              carefully about tournament structure — not those who guess at random.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase font-black mb-3 text-white">Built for friend circles and offices</h2>
            <p className="text-base leading-relaxed">
              Cup Clash works for any size of group — a 6-person WhatsApp chat or a 100-person company.
              Group admins can customise scoring rules, set custom prizes, and share a passkey invite link.
              The whole tournament runs itself after setup.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase font-black mb-3 text-white">World Cup 2026</h2>
            <p className="text-base leading-relaxed">
              FIFA World Cup 2026 is the largest tournament in the competition&apos;s history: 48 teams,
              104 matches, 16 host cities across the USA, Canada, and Mexico. It runs from June 11 to
              July 19, 2026, ending at MetLife Stadium in New Jersey.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase font-black mb-3 text-white">Contact</h2>
            <p className="text-base leading-relaxed">
              Questions or feedback?{" "}
              <Link href="/contact" className="underline transition-opacity hover:opacity-70" style={{ color: "#00D4FF" }}>
                Reach us here
              </Link>{" "}
              or email{" "}
              <a href="mailto:support@cupclash.live" className="underline transition-opacity hover:opacity-70" style={{ color: "#00D4FF" }}>
                support@cupclash.live
              </a>.
            </p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t flex flex-col sm:flex-row gap-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <Link href="/signup">
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#080C16" }}>
              Play Free <ArrowRight size={14} />
            </button>
          </Link>
          <Link href="/how-it-works">
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:opacity-70"
              style={{ border: "1px solid rgba(0,212,255,0.25)", color: "#00D4FF", background: "rgba(0,212,255,0.06)" }}>
              How it Works
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
