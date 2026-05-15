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
          Terms of Service
        </h1>
        <p className="text-sm mb-10" style={{ color: "#94a3b8" }}>Last updated: May 15, 2026</p>

        <div className="space-y-8 text-base leading-relaxed" style={{ color: "#475569" }}>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>1. Acceptance of Terms</h2>
            <p>By accessing or using Cup Clash ("the Service") at cupclash.live, you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>2. Description of Service</h2>
            <p>Cup Clash is a social prediction league platform for the FIFA World Cup 2026. The Service allows users to create private groups, submit match predictions, and track scores on a leaderboard. Cup Clash is a platform tool only — we do not operate, manage, or facilitate gambling or betting activities.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>3. Payments</h2>
            <p>Group members pay a one-time platform access fee of $2 USD per group to unlock predictions and group features. This fee is charged by Paddle.com as Merchant of Record on behalf of Cup Clash. The fee is for platform access only and is not a buy-in, wager, or stake in any prize pool.</p>
            <p className="mt-3">Prize pools, buy-ins, and payouts between group members are entirely managed by the group admin outside of Cup Clash. Cup Clash takes no percentage of any prize money and does not hold, transfer, or guarantee any funds between users.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>4. Refund Policy</h2>
            <p>You may request a full refund of your $2 platform access fee within 7 days of payment, provided the tournament has not yet started (June 11, 2026). After the tournament begins, or after 7 days from payment, the fee is non-refundable. To request a refund, contact us at support@cupclash.live.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>5. User Accounts</h2>
            <p>You must create an account to use the Service. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must be at least 18 years old to create an account.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>6. Acceptable Use</h2>
            <p>You agree not to use the Service to: violate any applicable law; harass, abuse, or harm other users; submit false or misleading information; attempt to gain unauthorized access to the Service or other users' accounts; or use the Service for any commercial purpose other than as intended.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>7. Intellectual Property</h2>
            <p>All content, features, and functionality of the Service are owned by Cup Clash and are protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>8. Disclaimers</h2>
            <p>The Service is provided "as is" without warranties of any kind. Cup Clash does not guarantee the accuracy of prediction scores, leaderboard calculations, or any other data displayed on the platform. We are not responsible for disputes between group members regarding prize pools or payments.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Cup Clash shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to loss of profits, data, or goodwill.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>10. Termination</h2>
            <p>We reserve the right to suspend or terminate your account at our discretion if you violate these Terms. You may terminate your account at any time by contacting support@cupclash.live.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>11. Changes to Terms</h2>
            <p>We may update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>12. Contact</h2>
            <p>For questions about these Terms, contact us at: <a href="mailto:support@cupclash.live" style={{ color: "#0891B2" }}>support@cupclash.live</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}