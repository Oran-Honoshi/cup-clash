import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Cup Clash",
  description: "Privacy Policy for Cup Clash World Cup 2026 prediction league platform.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
      <div className="max-w-3xl mx-auto px-5 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-8"
          style={{ color: "#0891B2" }}>
          <ArrowLeft size={15} /> Back to Cup Clash
        </Link>

        <h1 className="font-display text-4xl uppercase font-black mb-2" style={{ color: "#0F172A" }}>
          Privacy Policy
        </h1>
        <p className="text-sm mb-10" style={{ color: "#94a3b8" }}>Last updated: May 15, 2026</p>

        <div className="space-y-8 text-base leading-relaxed" style={{ color: "#475569" }}>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>1. Information We Collect</h2>
            <p>We collect the following information when you use Cup Clash:</p>
            <ul className="mt-3 space-y-1 list-disc list-inside">
              <li><strong>Account information:</strong> name, email address, country</li>
              <li><strong>Usage data:</strong> predictions submitted, groups joined, login timestamps</li>
              <li><strong>Payment data:</strong> processed securely by Paddle — we do not store card details</li>
              <li><strong>Device data:</strong> browser type, operating system, IP address (for security)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="mt-3 space-y-1 list-disc list-inside">
              <li>Provide and operate the Cup Clash platform</li>
              <li>Process payments via Paddle</li>
              <li>Send welcome emails and group invitations (when requested by group admin)</li>
              <li>Send push notifications for match results (with your permission)</li>
              <li>Improve the Service and fix bugs</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>3. Information Sharing</h2>
            <p>We do not sell your personal data. We share data only with:</p>
            <ul className="mt-3 space-y-1 list-disc list-inside">
              <li><strong>Paddle.com</strong> — payment processing (Merchant of Record)</li>
              <li><strong>Supabase</strong> — secure database hosting</li>
              <li><strong>Resend</strong> — transactional email delivery</li>
              <li><strong>Vercel</strong> — hosting and infrastructure</li>
              <li><strong>Law enforcement</strong> — when required by applicable law</li>
            </ul>
            <p className="mt-3">Your name and prediction scores are visible to other members of your group.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>4. Data Retention</h2>
            <p>We retain your account data for as long as your account is active. You may request deletion of your account and associated data at any time by emailing support@cupclash.live. Payment records may be retained for legal and accounting purposes for up to 7 years.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>5. Cookies</h2>
            <p>Cup Clash uses essential cookies for authentication and session management. We do not use advertising cookies, tracking cookies, or third-party analytics. No usage data is sent to advertising networks or analytics vendors.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>6. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="mt-3 space-y-1 list-disc list-inside">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
            </ul>
            <p className="mt-3">To exercise these rights, contact us at support@cupclash.live.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>7. Security</h2>
            <p>We use industry-standard security measures including encrypted connections (HTTPS), secure authentication via Supabase, and row-level security on all database tables. No system is completely secure — please use a strong, unique password.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>8. Children</h2>
            <p>Cup Clash is not intended for users under 18. We do not knowingly collect data from minors. If you believe a minor has created an account, contact us at support@cupclash.live.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>9. Contact</h2>
            <p>For privacy questions: <a href="mailto:support@cupclash.live" style={{ color: "#0891B2" }}>support@cupclash.live</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}