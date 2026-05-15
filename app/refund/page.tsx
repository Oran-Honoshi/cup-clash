import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";

export const metadata = {
  title: "Refund Policy | Cup Clash",
  description: "Refund Policy for Cup Clash — 7-day money back guarantee.",
};

export default function RefundPage() {
  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
      <div className="max-w-3xl mx-auto px-5 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-8"
          style={{ color: "#0891B2" }}>
          <ArrowLeft size={15} /> Back to Cup Clash
        </Link>

        <h1 className="font-display text-4xl uppercase font-black mb-2" style={{ color: "#0F172A" }}>
          Refund Policy
        </h1>
        <p className="text-sm mb-10" style={{ color: "#94a3b8" }}>Last updated: May 15, 2026</p>

        {/* Highlight box */}
        <div className="rounded-2xl p-6 mb-10"
          style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.25)" }}>
          <div className="font-display text-2xl uppercase font-black mb-2" style={{ color: "#0F172A" }}>
            7-Day Money Back Guarantee
          </div>
          <p style={{ color: "#475569" }}>
            If you're not satisfied with Cup Clash, we'll refund your $2 platform fee within 7 days of payment — no questions asked, as long as the tournament hasn't started yet.
          </p>
        </div>

        <div className="space-y-8 text-base leading-relaxed" style={{ color: "#475569" }}>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>Eligibility</h2>
            <p>You are eligible for a full refund if:</p>
            <div className="mt-3 space-y-2">
              {[
                "Your payment was made within the last 7 days",
                "The FIFA World Cup 2026 has not yet started (tournament starts June 11, 2026)",
                "Your account has not been suspended for Terms of Service violations",
              ].map(item => (
                <div key={item} className="flex items-start gap-2.5">
                  <Check size={16} className="shrink-0 mt-0.5" style={{ color: "#059669" }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>Non-Refundable Situations</h2>
            <p>Refunds are not available if:</p>
            <ul className="mt-3 space-y-1 list-disc list-inside">
              <li>More than 7 days have passed since payment</li>
              <li>The FIFA World Cup 2026 tournament has started (June 11, 2026)</li>
              <li>Your account was suspended for violating our Terms of Service</li>
            </ul>
            <p className="mt-3 text-sm" style={{ color: "#94a3b8" }}>
              Note: The $2 platform fee covers access to Cup Clash's technology. It is separate from any prize pool, buy-in, or funds managed between group members. Cup Clash is not responsible for and cannot refund any money exchanged directly between group members.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>How to Request a Refund</h2>
            <p>Email us at <a href="mailto:support@cupclash.live" style={{ color: "#0891B2" }}>support@cupclash.live</a> with:</p>
            <ul className="mt-3 space-y-1 list-disc list-inside">
              <li>Your account email address</li>
              <li>The group name you paid to join</li>
              <li>Your reason for requesting a refund (optional)</li>
            </ul>
            <p className="mt-3">We process refunds within 3-5 business days. The refund will be returned to your original payment method via Paddle.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>Contact</h2>
            <p>Refund requests: <a href="mailto:support@cupclash.live" style={{ color: "#0891B2" }}>support@cupclash.live</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}