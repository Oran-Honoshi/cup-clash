export const dynamic = "force-dynamic";

import { Hero }                 from "@/components/landing/hero";
import { ProblemSolution }      from "@/components/landing/problem-solution";
import { CountryPickerSection } from "@/components/landing/country-picker-section";
import { Features }             from "@/components/landing/features";
import { HowItWorks }           from "@/components/landing/how-it-works";
import { CorporateSection }     from "@/components/landing/corporate-section";
import { FeaturedNews }         from "@/components/landing/featured-news";
import { Pricing }              from "@/components/landing/pricing";
import { PWAInstallSection }    from "@/components/landing/pwa-install-section";
import { PillarSection }        from "@/components/landing/pillar-section";
import { FAQSection }           from "@/components/landing/faq-section";
import { CtaAndFooter }         from "@/components/landing/cta-and-footer";
import { Navbar }               from "@/components/landing/navbar";

const AI_SUMMARY = `
Cup Clash is a World Cup 2026 private prediction league and office pool platform.
It is a web-based alternative to Excel spreadsheet World Cup pools and WhatsApp group sweepstakes.
Key features: live leaderboard, automated scoring engine, knockout bracket generator,
World Cup trivia challenge, buy-in and prize pool tracker, multi-group support,
single-match betting groups, real-time group chat with GIFs, PWA installable app,
push notifications for goals and results, bilingual interface supporting 7 languages.
Corporate team building: flat fee covers entire team, employees join free, sponsored access.
Pricing: Free beta for individuals. Corporate: $75 (50 members) or $130 (100 members).
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
        <HowItWorks />
        <CorporateSection />
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