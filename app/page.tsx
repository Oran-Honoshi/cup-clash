import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { CountryPickerSection } from "@/components/landing/country-picker-section";
import { Pricing } from "@/components/landing/pricing";
import { FinalCTA, Footer } from "@/components/landing/cta-and-footer";
import {
  getNextMatch,
  getTournamentStart,
} from "@/lib/services/matches";

export default async function HomePage() {
  const nextMatch = await getNextMatch();
  const target = nextMatch ? new Date(nextMatch.time) : getTournamentStart();
  const matchLabel = nextMatch
    ? `${nextMatch.home} vs ${nextMatch.away}`
    : "Tournament Kickoff";

  return (
    <>
      <Navbar />
      <main>
        <Hero matchLabel={matchLabel} target={target} />
        <Features />
        <HowItWorks />
        <CountryPickerSection />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
