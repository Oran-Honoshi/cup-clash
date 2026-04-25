import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export function FinalCTA() {
  return (
    <section className="px-5 sm:px-8 py-20">
      <div
        className="relative mx-auto max-w-5xl rounded-[28px] overflow-hidden p-12 sm:p-20 text-center"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgb(var(--accent) / 0.95), rgb(var(--brand-2) / 0.95) 60%, rgb(var(--accent-glow) / 0.85))",
          boxShadow: "0 32px 80px rgb(var(--accent) / 0.4)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

        {/* Stadium light streak */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="relative">
          <Logo size="lg" showWordmark={false} className="justify-center mb-8" />
          <h2 className="font-display text-5xl sm:text-7xl uppercase text-white leading-[0.9] tracking-tight">
            Your group's tournament,
            <br />
            on the line.
          </h2>
          <p className="mt-6 text-lg text-white/85 max-w-xl mx-auto">
            Set up your league in under a minute. The 2026 World Cup is closer
            than you think.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              variant="secondary"
              rightIcon={<ArrowRight size={18} />}
            >
              Start your group
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-pitch-950/60 backdrop-blur-md text-pitch-300 px-5 sm:px-8 py-14">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 text-sm leading-relaxed max-w-xs text-pitch-400">
              Private prediction leagues for the friends, family, and group
              chats who take football a little too seriously.
            </p>
          </div>

          <FooterColumn
            title="Product"
            links={[
              ["Features", "#features"],
              ["How it works", "#how-it-works"],
              ["Pricing", "#pricing"],
            ]}
          />
          <FooterColumn
            title="Company"
            links={[["About", "#"], ["Contact", "#"]]}
          />
          <FooterColumn
            title="Legal"
            links={[["Privacy", "#"], ["Terms", "#"]]}
          />
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-pitch-400">
          <span>© 2026 Cup Clash. Not affiliated with FIFA.</span>
          <span>
            Predictions only — no gambling or wagering on this platform.
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-white mb-4">
        {title}
      </div>
      <ul className="space-y-2.5 text-sm">
        {links.map(([label, href]) => (
          <li key={label}>
            <a href={href} className="hover:text-white transition-colors">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
