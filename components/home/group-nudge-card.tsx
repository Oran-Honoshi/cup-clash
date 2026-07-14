import Link from "next/link";
import { Users, ChevronRight } from "lucide-react";
import { ZONES } from "@/lib/zones";
import { zoneFontVars } from "@/lib/fonts/zone-fonts";

const SOCIAL_ACCENT = ZONES.find(z => z.key === "social")!.accent;

// Shown to anonymous/solo (no-group) personas only — a soft nudge, never a
// hard wall, per zone_design/README.md persona guidance.
export function GroupNudgeCard() {
  return (
    <Link
      href="/create-group"
      className={`flex items-center gap-3 rounded-xl ${zoneFontVars}`}
      style={{ padding: 14, background: "var(--sf)", border: "1px solid var(--br)", textDecoration: "none" }}
    >
      <div
        className="flex items-center justify-center shrink-0 rounded-xl"
        style={{ width: 44, height: 44, background: `color-mix(in srgb, ${SOCIAL_ACCENT} 16%, transparent)`, color: SOCIAL_ACCENT }}
      >
        <Users size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ fontFamily: "var(--font-zone-display)", fontSize: 15, fontWeight: 700, color: "var(--tx)" }}>
          Join or create a group
        </div>
        <div style={{ fontFamily: "var(--font-zone-body)", fontSize: 12, color: "var(--mt)", marginTop: 2 }}>
          Compete with friends and climb a real leaderboard
        </div>
      </div>
      <ChevronRight size={16} style={{ color: "var(--mt)" }} />
    </Link>
  );
}
