import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";

const NEWS = [
  {
    tag: "Strategy",
    headline: "Expansion Era: How the 48-team format changes your prediction strategy",
    sub: "With 12 groups instead of 8, more upsets are statistically guaranteed. Here's how to adapt your scoring picks for the new format.",
    href: "/schedule",
    cta: "See full schedule",
  },
  {
    tag: "The Final",
    headline: "The MetLife Miracle: Why New York/NJ was chosen for the July 19 Final",
    sub: "MetLife Stadium seats 82,500, has a retractable field, and sits 15 miles from Manhattan. Inside the politics of the biggest match in US sports history.",
    href: "/schedule#final",
    cta: "Final details",
  },
  {
    tag: "Dark Horses",
    headline: "Debutants to Watch: Can Haiti or Curaçao pull off a Group Stage upset?",
    sub: "Both nations qualify for their first-ever World Cup. Curaçao's dual-nationality squad includes several Eredivisie regulars. Don't sleep on them in your predictions.",
    href: "/schedule",
    cta: "Group stage matches",
  },
];

export function FeaturedNews() {
  return (
    <section className="relative py-20 sm:py-24 border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="label-caps mb-3">Insights</div>
            <h2 className="font-display text-3xl sm:text-5xl uppercase text-white leading-[0.95] tracking-tight">
              Tournament Intel
            </h2>
          </div>
          <Link
            href="/schedule"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-pitch-400 hover:text-white transition-colors"
          >
            Full schedule <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {NEWS.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="group glass rounded-2xl p-6 hover:-translate-y-1 transition-all duration-200 hover:shadow-card block"
            >
              {/* Tag */}
              <span
                className="inline-block text-[10px] font-bold uppercase tracking-widest mb-3 px-2.5 py-1 rounded-full border"
                style={{
                  color: "rgb(var(--accent-glow))",
                  borderColor: "rgb(var(--accent) / 0.3)",
                  backgroundColor: "rgb(var(--accent) / 0.08)",
                }}
              >
                {item.tag}
              </span>

              {/* Headline */}
              <h3 className="font-bold text-white text-base leading-snug mb-2 group-hover:text-pitch-100 transition-colors">
                {item.headline}
              </h3>

              {/* Sub */}
              <p className="text-sm text-pitch-400 leading-relaxed">
                {item.sub}
              </p>

              {/* CTA */}
              <div
                className="mt-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-colors"
                style={{ color: "rgb(var(--accent-glow))" }}
              >
                {item.cta}
                <ExternalLink size={11} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
