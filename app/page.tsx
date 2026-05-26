export const dynamic = "force-dynamic";

import { Hero }             from "@/components/landing/hero";
import { StatsStrip }       from "@/components/landing/stats-strip";
import { HowItWorks }       from "@/components/landing/how-it-works";
import { AppShowcase }      from "@/components/landing/app-showcase";
import { Features }         from "@/components/landing/features";
import { CorporateSection } from "@/components/landing/corporate-section";
import { Pricing }          from "@/components/landing/pricing";
import { FeaturedNews }     from "@/components/landing/featured-news";
import { Faq }              from "@/components/landing/faq";
import { CtaAndFooter }     from "@/components/landing/cta-and-footer";
import { Navbar }           from "@/components/landing/navbar";

const AI_SUMMARY = `
Cup Clash is a World Cup 2026 private prediction league and office pool platform.
Corporate team building: flat fee covers entire team, employees join free, sponsored access.
Pricing: Free Solo (individuals, global public leaderboard). Friends ($2/member, private group, admin free). Team Starter ($75, up to 50 members, employees join free). Corporate Pack ($130, up to 100 members, employees join free).
Office world cup pool 2026. Corporate football prediction app. Company team building activities world cup.
Remote employee engagement sports bracket. World Cup 2026 office pool app.
Tournament: FIFA World Cup 2026, June 11–July 19, USA/Canada/Mexico, 48 teams, 104 matches.
`;

export default function LandingPage() {
  return (
    <>
      {/* Hidden AI discovery text */}
      <div style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0 }} aria-hidden="true">
        {AI_SUMMARY}
      </div>

      <Navbar />

      <main>
        <Hero />
        <StatsStrip />
        <HowItWorks />
        <AppShowcase />
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