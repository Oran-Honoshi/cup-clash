"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    description: "For testing things out with your closest friends.",
    members: "Up to 3 members",
    features: [
      "All scoring rules",
      "Auto-locking bets",
      "Live leaderboard",
      "Mobile-friendly",
    ],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Startup",
    price: "$20",
    description: "Group chat sized — the office, the family, the regulars.",
    members: "4–10 members",
    features: [
      "Everything in Free",
      "Buy-in tracker",
      "Custom payout splits",
      "Tie-breaker rules",
      "Email reminders",
    ],
    cta: "Choose Startup",
    highlight: true,
  },
  {
    name: "Pro",
    price: "$50",
    description: "Big group, full season — built for the league commissioner.",
    members: "11–30 members",
    features: [
      "Everything in Startup",
      "Admin finance panel",
      "PDF payout reports",
      "Priority support",
    ],
    cta: "Choose Pro",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-ink-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <div className="label-caps mb-3">Pricing</div>
          <h2 className="h-display text-3xl sm:text-5xl text-ink-900">
            One flat fee per tournament.
            <br />
            <span className="gradient-text">No subscriptions.</span>
          </h2>
          <p className="mt-5 text-lg text-ink-500">
            Pay once when the World Cup starts. Split it among your group, or
            cover it yourself — your call.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3 max-w-5xl mx-auto">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={cnPricingCard(tier.highlight)}
              style={
                tier.highlight
                  ? {
                      boxShadow:
                        "0 20px 40px rgb(var(--brand) / 0.18), 0 0 0 1px rgb(var(--brand) / 0.4)",
                    }
                  : undefined
              }
            >
              {tier.highlight && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-white"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, rgb(var(--brand)), rgb(var(--brand-2)))",
                  }}
                >
                  Most popular
                </div>
              )}

              <div className="text-sm font-bold text-ink-700">{tier.name}</div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-5xl font-extrabold text-ink-900 tracking-tight">
                  {tier.price}
                </span>
                <span className="text-sm text-ink-500">/ tournament</span>
              </div>
              <div className="mt-2 text-xs font-semibold text-ink-500">
                {tier.members}
              </div>
              <p className="mt-4 text-sm text-ink-500 leading-relaxed">
                {tier.description}
              </p>

              <Button
                variant={tier.highlight ? "primary" : "outline"}
                size="md"
                shape="pill"
                className="mt-6 w-full"
              >
                {tier.cta}
              </Button>

              <ul className="mt-7 space-y-2.5 pt-6 border-t border-ink-100">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-ink-700">
                    <Check
                      size={16}
                      className="mt-0.5 shrink-0"
                      style={{ color: "rgb(var(--brand))" }}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center text-xs text-ink-400">
          The app helps you track the buy-in. Money exchange happens directly
          between members — Cup Clash never handles cash.
        </div>
      </div>
    </section>
  );
}

function cnPricingCard(highlight: boolean) {
  const base =
    "relative bg-white border rounded-[20px] p-7 transition-all duration-200 hover:-translate-y-1";
  return highlight
    ? `${base} border-transparent`
    : `${base} border-ink-100 shadow-card hover:shadow-card-hover`;
}
