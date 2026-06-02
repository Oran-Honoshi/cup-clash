import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Cup Clash",
  description: "Terms of Service for Cup Clash World Cup 2026 prediction league platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
      <div className="max-w-3xl mx-auto px-5 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-8"
          style={{ color: "#0891B2" }}>
          <ArrowLeft size={15} /> Back to Cup Clash
        </Link>

        <h1 className="font-display text-4xl uppercase font-black mb-2" style={{ color: "#0F172A" }}>
          Terms of Service for Cup Clash
        </h1>
        <p className="text-sm mb-10" style={{ color: "#94a3b8" }}>Effective Date: June 2, 2026</p>

        <div className="space-y-8 text-base leading-relaxed" style={{ color: "#475569" }}>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>1. Agreement to Terms</h2>
            <p>By accessing or using Cup Clash (cupclash.live), you agree to be bound by these Terms. If you do not agree, do not use the application. These Terms are a binding legal agreement between you and Oran Schreiber (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;).</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>2. Eligibility</h2>
            <p>You must be at least 18 years old to create an account and use Cup Clash.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>3. Description of Service</h2>
            <p>Cup Clash is a free, social sports prediction game for the 2026 FIFA World Cup. Users join private groups, predict match scores and tournament outcomes, and compete on leaderboards for points. It is a game of prediction skill, not a gambling platform.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>4. Important Disclaimer Regarding Funds and Prizes</h2>
            <p>Cup Clash does not process, hold, escrow, or distribute any prize money or entry contributions. Any prize pool or entry amounts referenced within a private group are tracked for informational purposes only, between those group members. All financial arrangements between members take place entirely outside of the Cup Clash platform. We disclaim all liability for any disputes, losses, or unfulfilled arrangements between users regarding real-world money or prizes.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>5. Payments and Refunds</h2>
            <p>Cup Clash is free to play. Optional paid features are:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li><strong>Individual Ad-Removal:</strong> A one-time payment of $2 USD removes third-party advertisements for your account for the duration of the current tournament. Processed via PayPal.</li>
              <li><strong>Corporate Ad-Free Access:</strong> Organizations may pay a flat fee ($75 for up to 50 members, $130 for up to 100 members) so all employees in their group enjoy the app ad-free. Processed via PayPal.</li>
            </ul>
            <p className="mt-3"><strong>Refund Policy:</strong> If you believe you are entitled to a refund, contact us at <a href="mailto:hello@cupclash.live" style={{ color: "#0891B2" }}>hello@cupclash.live</a>. Approved refunds are processed through PayPal, and ad-free access is removed upon refund. Except as required by applicable law, fees are otherwise non-transferable.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>6. User Conduct and Account Termination</h2>
            <p>You agree to use Cup Clash only for lawful purposes. You may not cheat, exploit bugs, use automated scripts, or harass other users. We reserve the right to suspend or terminate any account that violates these Terms, without notice.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>7. Sports Data Accuracy</h2>
            <p>Cup Clash relies on third-party sports data feeds. We do not warrant the accuracy, completeness, or timeliness of any scores, schedules, or statistics displayed. We are not responsible for point discrepancies resulting from data delays or errors.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>8. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Oran Schreiber, its operators, and affiliates shall not be liable for any indirect, incidental, or consequential damages resulting from your use of Cup Clash, any inaccuracies in the application, or any financial arrangements between users outside the platform.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>9. Governing Law</h2>
            <p>These Terms are governed by the laws of Israel. Any disputes shall be subject to the exclusive jurisdiction of the courts of Tel Aviv, Israel.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>10. Changes to These Terms</h2>
            <p>We may update these Terms at any time by posting the revised version on this page. Continued use of Cup Clash after changes constitutes acceptance of the new Terms.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>11. Contact</h2>
            <p><strong>Email:</strong> <a href="mailto:hello@cupclash.live" style={{ color: "#0891B2" }}>hello@cupclash.live</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}