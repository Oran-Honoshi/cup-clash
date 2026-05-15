import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Article48Teams() {
  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
      <div className="max-w-2xl mx-auto px-5 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-8"
          style={{ color: "#0891B2" }}>
          <ArrowLeft size={15} /> Back
        </Link>

        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#00FF88" }}>Strategy</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase font-black mb-4 leading-tight" style={{ color: "#0F172A" }}>
          48 Teams Changes Everything — Here's How to Predict the Chaos
        </h1>
        <p className="text-lg mb-8" style={{ color: "#64748b" }}>
          The new Round of 32 means more upsets, more 3rd-place drama, and more points on the table. Your scoring strategy needs to adapt.
        </p>

        <div className="prose prose-slate max-w-none space-y-6 text-base leading-relaxed" style={{ color: "#475569" }}>
          <p>
            The 2026 FIFA World Cup is the largest in history — 48 teams, 12 groups, and a brand new Round of 32 that didn't exist four years ago. For casual fans, that's more football. For prediction league players, it's a completely different game.
          </p>

          <h2 className="font-display text-2xl uppercase font-black mt-8 mb-3" style={{ color: "#0F172A" }}>
            The 3rd-place problem
          </h2>
          <p>
            In the old 32-team format, every group match mattered equally. In 2026, the best 8 of 12 group-stage 3rd-place finishers advance. This creates a new layer of prediction complexity — you need to predict not just who wins each group, but which third-place teams squeak through.
          </p>
          <p>
            Cup Clash handles this with dedicated "Best 3rd-place" picks before the tournament starts. Get all 8 right and you're looking at a significant points advantage over your group.
          </p>

          <h2 className="font-display text-2xl uppercase font-black mt-8 mb-3" style={{ color: "#0F172A" }}>
            More matches = more opportunities
          </h2>
          <p>
            104 total matches compared to 64 in 2022. That's 40 more chances to score points on correct outcomes and exact scores. The player who correctly predicts a handful of exact scores in the group stage can build an insurmountable lead.
          </p>
          <p>
            Strategy tip: don't spread your attention across all 104 matches equally. Focus your exact score predictions on matches with clear form advantages — favorites playing poor opposition in the group stage are your best shot at exact score bonuses.
          </p>

          <h2 className="font-display text-2xl uppercase font-black mt-8 mb-3" style={{ color: "#0F172A" }}>
            The dark horse opportunity
          </h2>
          <p>
            48 teams means 16 newcomers to the World Cup stage. These are the teams most predictors will overlook for the tournament winner, top scorer, and Golden Ball picks. If a player like Alphonso Davies from Canada or a Moroccan striker has a breakout tournament, the member who picked them will be untouchable.
          </p>
          <p>
            The risk-reward calculation has shifted. A bold pre-tournament pick from outside the traditional powerhouses could be worth 50-100 points — more than most casual predictors score in the entire group stage.
          </p>

          <h2 className="font-display text-2xl uppercase font-black mt-8 mb-3" style={{ color: "#0F172A" }}>
            What this means for your Cup Clash group
          </h2>
          <p>
            The expanded format rewards preparation. Members who research the 3rd-place qualification scenarios, identify dark horse tournament winner candidates, and lock in their predictions before June 11 will have a structural advantage. The tournament picks (winner, top scorer, top assister, Golden Ball) lock before the first match — use every day between now and June 11 to do your homework.
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