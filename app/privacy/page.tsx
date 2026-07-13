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
          Privacy Policy for Cup Clash
        </h1>
        <p className="text-sm mb-10" style={{ color: "#94a3b8" }}>Effective Date: June 2, 2026</p>

        <div className="space-y-8 text-base leading-relaxed" style={{ color: "#475569" }}>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>1. Introduction</h2>
            <p>Welcome to Cup Clash (cupclash.live). This Privacy Policy explains how Oran Schreiber (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) collects, uses, shares, and protects your personal data when you use our progressive web application. Cup Clash is operated from Israel and we are committed to protecting your privacy in accordance with applicable data protection laws, including the GDPR where applicable.</p>
            <p className="mt-3">Please also read our <Link href="/terms" style={{ color: "#0891B2", fontWeight: 600 }}>Terms of Service</Link>.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>2. Information We Collect and Why</h2>
            <p>We collect only the minimum data necessary to provide a skill-based, social sports prediction experience.</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li><strong>Account Information:</strong> Your name and email address, used to authenticate your account and send important app updates.</li>
              <li><strong>Game Data:</strong> Your match and tournament predictions, group memberships, and leaderboard points, used to operate the core game.</li>
              <li><strong>Payment Information:</strong> If you purchase the optional ad-removal feature, the transaction is processed securely through PayPal. We do not store your financial or card details — we only receive confirmation from PayPal that a payment was successful.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>3. Cookies and Third-Party Advertising</h2>
            <p>We use cookies to keep you logged in, remember your preferences, and analyze traffic.</p>
            <h3 className="font-bold mt-4 mb-2" style={{ color: "#0F172A" }}>Google AdSense and Advertising Cookies</h3>
            <p>Cup Clash displays third-party advertisements provided by Google AdSense to users on the free tier.</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>Google and its partners use cookies to serve ads based on your prior visits to Cup Clash or other websites.</li>
              <li>You may opt out of personalized advertising by visiting Google&apos;s Ads Settings at <a href="https://www.google.com/settings/ads" style={{ color: "#0891B2" }}>https://www.google.com/settings/ads</a></li>
              <li>You may also opt out of third-party advertising cookies via <a href="https://aboutads.info" style={{ color: "#0891B2" }}>https://aboutads.info</a></li>
              <li>For more information on how Google uses data when you use our app, visit: <a href="https://policies.google.com/technologies/partner-sites" style={{ color: "#0891B2" }}>https://policies.google.com/technologies/partner-sites</a></li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>4. Data Sharing and Transfer</h2>
            <p>We do not sell, rent, or trade your personal data. We share data only with third-party service providers (such as our hosting provider and PayPal) to the extent necessary to operate the app. Your data may be transferred to and processed in countries outside your home jurisdiction. We ensure appropriate safeguards are in place for any such transfers.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>5. Data Retention and Your Rights</h2>
            <p>We retain your personal data only as long as necessary to fulfill the purposes outlined in this policy.</p>
            <p className="mt-3">You have the right to access, update, or delete your data, restrict or object to processing, and request data portability, regardless of where you are located.</p>
            <p className="mt-3">You can delete your account yourself at any time from <strong>Profile &gt; Delete My Account</strong> within the app. When you do, we permanently erase your personal information (name, photo, and other profile details) and permanently disable the account so it can never be signed into again. Predictions and results tied to your account remain visible to other members of your groups under a generic &ldquo;Deleted User&rdquo; label, so their leaderboard history and entry/prize-pool records are not affected by your deletion. This action is immediate and cannot be undone.</p>
            <p className="mt-3">If you'd prefer we handle the deletion for you, or have any other request regarding your data, contact us at <a href="mailto:hello@cupclash.live" style={{ color: "#0891B2" }}>hello@cupclash.live</a>. We will respond within the legally required timeframe.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>6. Children&apos;s Privacy and Age Requirements</h2>
            <p>Cup Clash is intended for users aged <strong>13 and over</strong>. Users between the ages of 13 and 17 must have parental or guardian consent before using this service. For children under 13, a parent or guardian must create and manage the account on their behalf.</p>
            <h3 className="font-bold mt-4 mb-2" style={{ color: "#0F172A" }}>COPPA Notice (US Users)</h3>
            <p>This service is not directed at children under 13. We do not knowingly collect personal information from children under 13 without verifiable parental consent. If you believe a child under 13 has provided personal information without parental consent, please contact us at <a href="mailto:hello@cupclash.live" style={{ color: "#0891B2" }}>hello@cupclash.live</a> and we will delete that information promptly.</p>
            <h3 className="font-bold mt-4 mb-2" style={{ color: "#0F172A" }}>GDPR Article 8 Notice (EU/EEA Users)</h3>
            <p>For users in the EU/EEA under the age of 16, the processing of personal data requires parental or guardian consent under GDPR Article 8. By using this service, you confirm that you are at least 16 years old, or that you have obtained the necessary parental or guardian consent. If we become aware that personal data has been collected from a minor without the required consent, we will delete it immediately.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>7. Contact Us</h2>
            <ul className="space-y-1 list-none">
              <li><strong>Email:</strong> <a href="mailto:hello@cupclash.live" style={{ color: "#0891B2" }}>hello@cupclash.live</a></li>
              <li><strong>Operator:</strong> Oran Schreiber, Israel</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
