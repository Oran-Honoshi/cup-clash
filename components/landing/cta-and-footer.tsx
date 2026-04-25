import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export function FinalCTA() {
  return (
    <section className="px-5 sm:px-8 py-20">
      <div
        className="relative mx-auto max-w-5xl rounded-[28px] overflow-hidden p-12 sm:p-16 text-center"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgb(var(--brand)), rgb(var(--brand-2)) 60%, rgb(var(--accent)))",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/5 blur-2xl" />

        <div className="relative">
          <Logo size="lg" showWordmark={false} className="justify-center mb-6" />
          <h2 className="h-display text-3xl sm:text-5xl text-white">
            Your group's tournament,
            <br />
            on the line.
          </h2>
          <p className="mt-5 text-lg text-white/80 max-w-xl mx-auto">
            Set up your league in under a minute. The 2026 World Cup is closer
            than you think.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              variant="dark"
              className="bg-white !text-ink-900 hover:!bg-white hover:brightness-95"
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
    <footer className="bg-ink-900 text-white/70 px-5 sm:px-8 py-14">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 text-sm leading-relaxed max-w-xs">
              Private prediction leagues for the friends, family, and group
              chats who take football a little too seriously.
            </p>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-white mb-3">
              Product
            </div>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How it works</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-white mb-3">
              Company
            </div>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-white mb-3">
              Legal
            </div>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <span>© 2026 Cup Clash. Not affiliated with FIFA.</span>
          <span className="text-white/40">
            Predictions only — no gambling or wagering on this platform.
          </span>
        </div>
      </div>
    </footer>
  );
}
