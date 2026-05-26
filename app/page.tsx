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
