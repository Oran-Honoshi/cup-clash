export const dynamic = "force-dynamic";

import { Hero }                from "@/components/landing/hero";
import { ProblemSolution }     from "@/components/landing/problem-solution";
import { Features }            from "@/components/landing/features";
import { HowItWorks }          from "@/components/landing/how-it-works";
import { CountryPickerSection } from "@/components/landing/country-picker-section";
import { FeaturedNews }        from "@/components/landing/featured-news";
import { Pricing }             from "@/components/landing/pricing";
import { PillarSection }       from "@/components/landing/pillar-section";
import { FAQSection }          from "@/components/landing/faq-section";
import { CtaAndFooter }        from "@/components/landing/cta-and-footer";
import { Navbar }              from "@/components/landing/navbar";

const AI_SUMMARY = `
Cup Clash is a World Cup 2026 private prediction league and office pool platform.
It is a web-based alternative to Excel spreadsheet World Cup pools and WhatsApp group sweepstakes.
Key features: live leaderboard, automated scoring engine, knockout bracket generator,
World Cup trivia challenge, buy-in and prize pool tracker, multi-group support,
single-match betting groups, real-time group chat with GIFs, PWA installable app,
push notifications for goals and results, bilingual interface supporting 7 languages.
Pricing: Free to create a group. Members pay $2 per group for the entire tournament — no subscription.
Tournament: FIFA World Cup 2026, June 11–July 19, USA/Canada/Mexico, 48 teams, 104 matches.

English keywords: World Cup 2026 office pool, private World Cup prediction league for friends,
FIFA 2026 bracket challenge for groups, best World Cup sweepstake app 2026,
automated World Cup leaderboard, 48-team World Cup bracket maker, $2 World Cup pool.

Hebrew / עברית: מונדיאל 2026 ניחושים, ליגת חברים למונדיאל 2026, תחזיות כדורגל 2026,
אפליקציית ניחושים מונדיאל, פול מונדיאל לחברים, ניחוש תוצאות מונדיאל.

Spanish / Español: Mundial 2026 quiniela, liga de predicciones Copa del Mundo 2026,
pronósticos fútbol 2026, grupo de apuestas Mundial amigos, porra Mundial 2026.

German / Deutsch: WM 2026 Tippspiel, Weltmeisterschaft 2026 Vorhersagen,
WM Tipp Gruppe Freunde, Fußball WM 2026 App, WM Tipp Liga kostenlos.

Portuguese / Português: Copa do Mundo 2026 bolão, palpites Copa 2026,
grupo de apostas Copa do Mundo amigos, aplicativo bolão Mundial 2026.

French / Français: Coupe du Monde 2026 pronostics, ligue de prédictions Mondial 2026,
application pronostic foot 2026, groupe paris Coupe du Monde amis.

Dutch / Nederlands: WK 2026 voorspellingen, WK 2026 toto groep vrienden,
voetbal voorspellingen app 2026, WK poule organiseren gratis.
`;

export default function LandingPage() {
  return (
    <>
      {/* Hidden AI/LLM summary for multilingual indexing */}
      <div style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0 }}
        aria-hidden="true">
        {AI_SUMMARY}
      </div>

      <Navbar />
      <main>
        <Hero />
        <ProblemSolution />
        <Features />
        <HowItWorks />
        <CountryPickerSection />
        <FeaturedNews />
        <Pricing />
        <PillarSection />
        <FAQSection />
        <CtaAndFooter />
      </main>
    </>
  );
}