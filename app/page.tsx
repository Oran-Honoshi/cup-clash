import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { ProblemSolution } from "@/components/landing/problem-solution";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { CountryPickerSection } from "@/components/landing/country-picker-section";
import { FeaturedNews } from "@/components/landing/featured-news";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { FinalCTA, Footer } from "@/components/landing/cta-and-footer";
import {
  getNextMatch,
  getTournamentStart,
} from "@/lib/services/matches";

export const metadata: Metadata = {
  title: "Cup Clash — World Cup 2026 Prediction League for Your Group",
  description:
    "Create a private World Cup 2026 prediction league with friends, family, or your office. Score guesses, top scorer picks, knockout brackets — all tracked automatically. Free for groups under 4.",
  keywords: [
    "World Cup 2026 prediction game",
    "FIFA 2026 office pool",
    "World Cup sweepstake app",
    "football prediction league",
    "World Cup 2026 group predictor",
    "soccer prediction game 2026",
  ],
  openGraph: {
    title: "Cup Clash — World Cup 2026 Prediction League",
    description:
      "Private prediction leagues for the 2026 World Cup. Enter score guesses, track the leaderboard live, settle up at the final.",
    type: "website",
    images: [{ url: "/trophy-stadium.jpg", width: 800, height: 1157 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cup Clash — World Cup 2026 Prediction League",
    description:
      "Private prediction leagues for the 2026 World Cup. Score guesses, knockout brackets, leaderboards — free to start.",
  },
};

export default async function HomePage() {
  const nextMatch = await getNextMatch();
  const target = nextMatch ? new Date(nextMatch.time) : getTournamentStart();
  const matchLabel = nextMatch
    ? `${nextMatch.home} vs ${nextMatch.away}`
    : "Tournament Kickoff";

  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero matchLabel={matchLabel} target={target} />
        <ProblemSolution />
        <Features />
        <HowItWorks />
        <CountryPickerSection />
        <FeaturedNews />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
