import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ArticleDarkHorses() {
  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
      <div className="max-w-2xl mx-auto px-5 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-8"
          style={{ color: "#0891B2" }}>
          <ArrowLeft size={15} /> Back
        </Link>

        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#d97706" }}>Dark Horses</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase font-black mb-4 leading-tight" style={{ color: "#0F172A" }}>
          5 Teams Your Group Hasn't Picked to Win — But Probably Should
        </h1>
        <p className="text-lg mb-8" style={{ color: "#64748b" }}>
          Morocco proved Africa can go deep. Japan is built for knockouts. USA are hosting. The 2026 winner might be in your group chat's blind spot.
        </p>

        <div className="space-y-6 text-base leading-relaxed" style={{ color: "#475569" }}>
          <p>
            Every Cup Clash group has the same tournament winner picks clustered around the same five or six teams. France, Brazil, Argentina, England, Germany, Spain. And every tournament, at least one of those teams exits embarrassingly early while a team nobody picked makes a run.
          </p>
          <p>
            Here are five teams worth serious consideration for your pre-tournament picks — and why the group chat has already dismissed them unfairly.
          </p>

          <h2 className="font-display text-2xl uppercase font-black mt-8 mb-3" style={{ color: "#0F172A" }}>
            1. USA — the host factor is real
          </h2>
          <p>
            Pulisic, McKennie, Reyna, Weah. The US squad has genuine quality and a maturing core. Playing at home, with 82,500 fans at MetLife for the Final — no host nation has ever been eliminated in the group stage. The USA is a genuine dark horse for a Semi-final run.
          </p>

          <h2 className="font-display text-2xl uppercase font-black mt-8 mb-3" style={{ color: "#0F172A" }}>
            2. Morocco — 2022 proved the template works
          </h2>
          <p>
            Morocco's 2022 Semi-final run wasn't a fluke — it was a tactical masterclass. Organized defensively, dangerous on the counter, with Achraf Hakimi providing elite quality at right-back. They've only gotten better. African nations with strong defensive systems historically overperform at the World Cup.
          </p>

          <h2 className="font-display text-2xl uppercase font-black mt-8 mb-3" style={{ color: "#0F172A" }}>
            3. Japan — the knockout specialists
          </h2>
          <p>
            Japan beat Germany and Spain in 2022's group stage. Their Premier League and Bundesliga players give them genuine quality, and their pressing system is among the most sophisticated in international football. In a bracket with potential upsets in every round, Japan reaching the Quarter-finals is more likely than most groups acknowledge.
          </p>

          <h2 className="font-display text-2xl uppercase font-black mt-8 mb-3" style={{ color: "#0F172A" }}>
            4. Canada — Alphonso Davies changes everything
          </h2>
          <p>
            Davies is one of the five best left-backs in world football. Canada has never made it out of the group stage — but they've never had a player of Davies' quality before. Co-hosting gives them home crowds in some matches. Jonathan David is a proven striker. Don't sleep on Canada reaching the Round of 16.
          </p>

          <h2 className="font-display text-2xl uppercase font-black mt-8 mb-3" style={{ color: "#0F172A" }}>
            5. Turkey — Arda Güler's coming-out party
          </h2>
          <p>
            Arda Güler is 19 years old and already one of the most technically gifted midfielders in Europe. Hakan Çalhanoğlu provides leadership and creativity. Turkey at a major tournament, with this squad, in this form, has the ingredients for a surprise run. Nobody in your group will have picked them. If they reach the Quarter-finals, the points advantage is enormous.
          </p>

          <div className="rounded-2xl p-5 mt-8" style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)" }}>
            <p className="font-bold text-sm" style={{ color: "#0F172A" }}>
              💡 Cup Clash strategy tip
            </p>
            <p className="text-sm mt-1" style={{ color: "#64748b" }}>
              Tournament winner picks lock before June 11. You don't need to pick the actual winner — you need to pick a team nobody else in your group picked. If your dark horse makes the Semi-finals, you&apos;re likely looking at 50-100 bonus points over the field.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t" style={{ borderColor: "#e2e8f0" }}>
          <div className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: "#94a3b8" }}>Ready to play?</div>
          <Link href="/signup">
            <button className="px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider"
              style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
              Create your group — free
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}