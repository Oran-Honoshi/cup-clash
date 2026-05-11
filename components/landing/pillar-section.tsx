// Add this section to app/page.tsx BEFORE the final CTA section
// This is the "Ultimate Guide" pillar content for SEO

export function PillarSection() {
  return (
    <section id="guide" className="py-24 px-5 sm:px-8"
      style={{ background: "rgba(0,212,255,0.02)", borderTop: "1px solid rgba(0,212,255,0.08)" }}>
      <div className="max-w-4xl mx-auto">
        <div className="label-caps mb-3 text-center">The Guide</div>
        <h2 className="font-display text-4xl sm:text-5xl uppercase text-center mb-4" style={{ color: "#0F172A" }}>
          The Ultimate Guide to<br />
          <span style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            World Cup 2026 Social Leagues
          </span>
        </h2>
        <p className="text-center text-lg mb-12 max-w-2xl mx-auto" style={{ color: "#64748b" }}>
          Turn every match into a duel. 104 Matches. 48 Teams. 1 Champion in your friend group.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Left column — what's new in 2026 */}
          <div className="rounded-2xl p-6 space-y-4"
            style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.12)" }}>
            <h3 className="font-display text-2xl uppercase font-black" style={{ color: "#0F172A" }}>
              Why 2026 is Different
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>
              The 2026 FIFA World Cup is the largest in history — 48 teams, 12 groups, 104 matches across USA, Canada and Mexico. That&apos;s 38 more matches than 2022. More matches means more predictions, more upsets, and more chances to dominate your group.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>
              The new Round of 32 adds a knockout round that didn&apos;t exist before — creating more variance and more opportunities for underdog picks to score you big points.
            </p>
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { num: "48",  label: "Teams"   },
                { num: "104", label: "Matches" },
                { num: "16",  label: "Cities"  },
              ].map(({ num, label }) => (
                <div key={label} className="rounded-xl p-3 text-center"
                  style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.12)" }}>
                  <div className="font-display text-3xl font-black" style={{ color: "#0F172A" }}>{num}</div>
                  <div className="text-xs uppercase tracking-widest" style={{ color: "#64748b" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — how to win your league */}
          <div className="rounded-2xl p-6 space-y-4"
            style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.12)" }}>
            <h3 className="font-display text-2xl uppercase font-black" style={{ color: "#0F172A" }}>
              How to Win Your League
            </h3>
            <div className="space-y-3">
              {[
                { tip: "Target exact scores in group stage", why: "25 pts vs 10 pts — the biggest gap is between exact and outcome. Group stage has more predictable favorites." },
                { tip: "Pick a dark horse for the tournament", why: "100 points for the winner. Morocco, USA and Japan are historically undervalued by casual predictors." },
                { tip: "Lock in your bonus picks early", why: "Tournament winner, top scorer and assister lock before June 11. Don't miss the deadline." },
                { tip: "Use the Copy Predictions feature", why: "In multiple groups? Copy your predictions in one click — adjust only the ones you want to change." },
              ].map(({ tip, why }) => (
                <div key={tip} className="flex gap-3">
                  <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "rgba(0,255,136,0.15)", border: "1px solid rgba(0,255,136,0.3)" }}>
                    <span style={{ color: "#059669", fontSize: "10px" }}>✓</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: "#0F172A" }}>{tip}</div>
                    <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>{why}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Long-tail keyword content block */}
        <div className="rounded-2xl p-8"
          style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.12)" }}>
          <h3 className="font-display text-2xl uppercase font-black mb-4" style={{ color: "#0F172A" }}>
            Why Cup Clash beats a spreadsheet
          </h3>
          <div className="grid sm:grid-cols-2 gap-6 text-sm" style={{ color: "#475569" }}>
            <div className="space-y-3">
              <p><strong style={{ color: "#0F172A" }}>No more WhatsApp chaos.</strong> Stop scrolling through 400 messages trying to find who predicted what. Cup Clash locks predictions automatically before kickoff — with a timestamp as proof.</p>
              <p><strong style={{ color: "#0F172A" }}>No more Excel formulas.</strong> Points calculate automatically in real time. When Germany scores, the leaderboard updates instantly for every member in your group.</p>
            </div>
            <div className="space-y-3">
              <p><strong style={{ color: "#0F172A" }}>No more chasing payments.</strong> The admin tracks who&apos;s paid and who hasn&apos;t. Every member sees the prize pot growing. The pressure to pay is built in.</p>
              <p><strong style={{ color: "#0F172A" }}>Works on any phone.</strong> Cup Clash is a PWA — add it to your homescreen and it works like a native app. No App Store needed. No updates required.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}