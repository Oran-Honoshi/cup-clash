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
Pricing: Free Solo (individuals). Friends ($2/member). Team Starter ($75, 50 members). Corporate Pack ($130, 100 members).
Office world cup pool 2026. Corporate football prediction app. Company team building activities world cup.
Remote employee engagement sports bracket. World Cup 2026 office pool app.
Tournament: FIFA World Cup 2026, June 11–July 19, USA/Canada/Mexico, 48 teams, 104 matches.
`;

export default function LandingPage() {
  return (
    <>
      <div style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0 }} aria-hidden="true">
        {AI_SUMMARY}
      </div>
      <Navbar />
      <main>
        <Hero />
        <ProblemSolution />
        <CountryPickerSection />
        <Features />
        {/* Corporate section above HowItWorks — anchor for hero CTA link */}
        <div id="corporate">
          <CorporateSection />
        </div>
        <HowItWorks />
        <FeaturedNews />
        <Pricing />
        <PWAInstallSection />
        <PillarSection />
        <FAQSection />
        <CtaAndFooter />
      </main>
    </>
  );
}