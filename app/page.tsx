import type { Metadata } from "next";
import { Hero }             from "@/components/landing/hero";
import { CountdownHero }    from "@/components/CountdownHero";
import { Leaderboard }      from "@/components/Leaderboard";
import { MOCK_MEMBERS, MOCK_MATCHES } from "@/lib/mocks/data";

export const metadata: Metadata = {
  title: "Cup Clash — Free Social Prediction Game for World Cup 2026",
  description: "Cup Clash is a free social prediction game for FIFA World Cup 2026. Create a private group with friends or colleagues, predict all 104 matches, and compete on a live leaderboard. Free to join, skill-based, no subscriptions.",
  openGraph: {
    title: "Cup Clash — Free Social Prediction Game for World Cup 2026",
    description: "Predict all 104 World Cup 2026 matches. Free to join, skill-based, compete with friends and colleagues. No subscriptions.",
    type: "website",
  },
  keywords: ["World Cup 2026 prediction game", "free prediction league", "social prediction game", "World Cup 2026 group", "skill-based prediction"],
};
import { StatsStrip }       from "@/components/landing/stats-strip";
import { HowItWorks }       from "@/components/landing/how-it-works";
import { Features }         from "@/components/landing/features";
import { CorporateSection } from "@/components/landing/corporate-section";
import { Pricing }          from "@/components/landing/pricing";
import { FeaturedNews }     from "@/components/landing/featured-news";
import { Faq }              from "@/components/landing/faq";
import { CtaAndFooter }     from "@/components/landing/cta-and-footer";
import { Navbar }           from "@/components/landing/navbar";

const nextMatch = MOCK_MATCHES[0];
const top3 = [...MOCK_MEMBERS].sort((a, b) => b.points - a.points).slice(0, 3);

export default function LandingPage() {
  return (
    <>
      {/* Keyboard skip-link — hidden until focused, then top-left over the navbar. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100]
                   focus:inline-flex focus:items-center focus:px-4 focus:py-2 focus:rounded-full
                   focus:bg-ac focus:text-[#050810] focus:text-xs focus:font-bold
                   focus:uppercase focus:tracking-widest focus:shadow-[0_8px_30px_rgba(0,255,136,0.4)]
                   focus:outline-none focus:ring-2 focus:ring-cyan/60 focus:ring-offset-2 focus:ring-offset-[#080C16]"
      >
        Skip to content
      </a>

      <Navbar />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        <Hero />

        {/* Live countdown to next match */}
        <CountdownHero
          nextMatchIso={nextMatch.time}
          homeTeam={nextMatch.home}
          awayTeam={nextMatch.away}
        />

        {/* Top-3 preview leaderboard */}
        <section className="max-w-xl mx-auto px-4 sm:px-6 py-10">
          <p className="text-xs uppercase tracking-widest text-white/40 font-bold mb-4 text-center">
            Top 3 this week
          </p>
          <Leaderboard members={top3} />
        </section>

        <StatsStrip />
        <HowItWorks />
        <Features />
        <CorporateSection />
        <Pricing />
        <FeaturedNews />
        <Faq />
        <CtaAndFooter />
      </main>
    </>
  );
}
