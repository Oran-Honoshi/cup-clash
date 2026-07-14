import { BarChart2 } from "lucide-react";
import { zoneFontVars } from "@/lib/fonts/zone-fonts";
import { ZONES } from "@/lib/zones";

// Statistician zone placeholder — real build (accuracy chart, standings,
// history/compare sub-sectors) is Phase 3. Phase 1 only needs this reachable
// from the Stats tab so the 5-tab shell has somewhere real to land.
export default function StatsPage() {
  const zone = ZONES.find(z => z.key === "stats")!;

  return (
    <div className={`flex flex-col items-center justify-center text-center gap-4 py-24 ${zoneFontVars}`}>
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{ width: 56, height: 56, background: `color-mix(in srgb, ${zone.accent} 14%, transparent)` }}
      >
        <BarChart2 size={26} style={{ color: zone.accent }} />
      </div>
      <h1 style={{ fontFamily: "var(--font-zone-display)", fontSize: 24, fontWeight: 700, color: "var(--tx)", textTransform: "uppercase" }}>
        Statistician zone
      </h1>
      <p style={{ fontFamily: "var(--font-zone-body)", fontSize: 14, color: "var(--mt)", maxWidth: 320 }}>
        Coming soon — your personal stats, competition standings, and history all in one place.
      </p>
    </div>
  );
}
