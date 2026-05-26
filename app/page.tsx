import { Hero }             from "@/components/landing/hero";
import { StatsStrip }       from "@/components/landing/stats-strip";
import { HowItWorks }       from "@/components/landing/how-it-works";
import { Features }         from "@/components/landing/features";
import { CorporateSection } from "@/components/landing/corporate-section";
import { Pricing }          from "@/components/landing/pricing";
import { FeaturedNews }     from "@/components/landing/featured-news";
import { Faq }              from "@/components/landing/faq";
import { CtaAndFooter }     from "@/components/landing/cta-and-footer";
import { Navbar }           from "@/components/landing/navbar";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
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
