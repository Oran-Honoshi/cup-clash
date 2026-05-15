import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ArticleMetlife() {
  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
      <div className="max-w-2xl mx-auto px-5 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-8"
          style={{ color: "#0891B2" }}>
          <ArrowLeft size={15} /> Back
        </Link>

        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#00D4FF" }}>Venue</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase font-black mb-4 leading-tight" style={{ color: "#0F172A" }}>
          MetLife Stadium: Why the Final Venue Gives the Home Crowd an Edge
        </h1>
        <p className="text-lg mb-8" style={{ color: "#64748b" }}>
          East Rutherford, New Jersey. 82,500 fans. The largest World Cup Final ever. Here's what the host advantage actually means for the odds.
        </p>

        <div className="space-y-6 text-base leading-relaxed" style={{ color: "#475569" }}>
          <p>
            On July 19, 2026, the largest World Cup Final in history will take place at MetLife Stadium in East Rutherford, New Jersey. With a capacity of 82,500, it will dwarf every previous Final venue. But beyond the size, the location tells a story about host advantage that every prediction league player should understand.
          </p>

          <h2 className="font-display text-2xl uppercase font-black mt-8 mb-3" style={{ color: "#0F172A" }}>
            The USA factor
          </h2>
          <p>
            USA last hosted the World Cup in 1994 and made it to the Round of 16. Hosting is historically significant — home nations at the World Cup have never been eliminated in the group stage. The USA, with a maturing squad featuring Christian Pulisic, Weston McKennie, and Gio Reyna, are a genuine knockout round contender.
          </p>
          <p>
            MetLife serves 60 of the tournament's 104 matches, including the Final. The US team's path could include matches there — and the crowd effect in a stadium that size is measurable. Studies of major tournaments show home teams win 15-20% more often than their world rankings would predict.
          </p>

          <h2 className="font-display text-2xl uppercase font-black mt-8 mb-3" style={{ color: "#0F172A" }}>
            What it means for your predictions
          </h2>
          <p>
            Mexico is a co-host and plays their opening match at the Estadio Azteca before potentially playing knockout matches in the US. Canada, another co-host, has Alphonso Davies — one of the most dangerous attacking players in world football. Three legitimate host nations with home crowd advantages across 16 cities.
          </p>
          <p>
            For your Cup Clash tournament winner pick: consider that no host nation has ever failed to reach the knockout stage. USA at home odds are longer than they should be given the structural advantage. Mexico reaching the Quarter-finals for the first time since 1986 is genuinely plausible.
          </p>

          <h2 className="font-display text-2xl uppercase font-black mt-8 mb-3" style={{ color: "#0F172A" }}>
            The crowd effect in prediction leagues
          </h2>
          <p>
            Most Cup Clash groups will be heavy on traditional favorites — France, Brazil, Argentina, England. The player who correctly identifies which host nation overperforms their pre-tournament ranking, or which dark horse benefits from neutral crowd support in the US, can build a lead that the rest of the group never closes.
          </p>
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