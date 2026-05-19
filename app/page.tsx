export const dynamic = "force-dynamic";

import { Hero }                 from "@/components/landing/hero";
import { ProblemSolution }      from "@/components/landing/problem-solution";
import { CountryPickerSection } from "@/components/landing/country-picker-section";
import { Features }             from "@/components/landing/features";
import { CorporateSection }     from "@/components/landing/corporate-section";
import { HowItWorks }           from "@/components/landing/how-it-works";
import { FeaturedNews }         from "@/components/landing/featured-news";
import { Pricing }              from "@/components/landing/pricing";
import { PWAInstallSection }    from "@/components/landing/pwa-install-section";
import { PillarSection }        from "@/components/landing/pillar-section";
import { FAQSection }           from "@/components/landing/faq-section";
import { CtaAndFooter }         from "@/components/landing/cta-and-footer";
import { Navbar }               from "@/components/landing/navbar";

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

      {/* Fixed nav + bunting strip */}
      <Navbar />

      <main>
        {/* 1. Hero — dual-path CTAs, updated H1 */}
        <Hero />

        {/*
          2. ProblemSolution — "Group Chat Nightmare vs Cup Clash Way"
             Moved up per blueprint (was position 5, now position 4)
        */}
        <ProblemSolution />

        {/*
          3. CountryPickerSection — App UI reveal / flag selector demo
             (was position 3 — kept in the app-reveal slot)
        */}
        <CountryPickerSection />

        {/*
          4. CorporateSection — B2B value prop
             Moved up per blueprint (was after Features, now before)
             Includes top bunting flags divider
        */}
        <CorporateSection />

        {/*
          5. Features — 10-tile grid
             Moved down per blueprint (was position 4, now position 6)
        */}
        <Features />

        {/* 6. HowItWorks — 60-second 1-2-3 setup guide */}
        <HowItWorks />

        {/* 7. FeaturedNews — Intel / Blog / Strategy feed */}
        <FeaturedNews />

        {/* 8. Pricing — updated with playstyle explainer & clarity copy */}
        <Pricing />

        {/* 9. PWA install guide */}
        <PWAInstallSection />

        {/* 10. Pillar section */}
        <PillarSection />

        {/* 11. FAQ & Footer */}
        <FAQSection />
        <CtaAndFooter />
      </main>
    </>
  );
}