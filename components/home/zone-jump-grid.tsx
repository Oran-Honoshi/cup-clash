import Link from "next/link";
import { ZONES } from "@/lib/zones";
import { zoneFontVars } from "@/lib/fonts/zone-fonts";

// 3-up "Jump into a zone" grid — the last section on Home, per
// zone_design/README.md ordering ("discovery content last"). Excludes Home
// itself since you're already there.
export function ZoneJumpGrid() {
  const jumpZones = ZONES.filter(z => z.key !== "home");

  return (
    <div className={zoneFontVars}>
      <div style={{ fontFamily: "var(--font-zone-body)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mt)", marginBottom: 8 }}>
        Jump into a zone
      </div>
      <div className="grid grid-cols-3 gap-2">
        {jumpZones.map((zone) => {
          const Icon = zone.icon;
          return (
            <Link
              key={zone.key}
              href={zone.href}
              className="flex flex-col items-center justify-center gap-2 rounded-xl text-center"
              style={{ padding: "18px 8px", background: "var(--sf)", border: "1px solid var(--br)", textDecoration: "none" }}
            >
              <div
                className="flex items-center justify-center rounded-full"
                style={{ width: 36, height: 36, background: `color-mix(in srgb, ${zone.accent} 16%, transparent)`, color: zone.accent }}
              >
                <Icon size={17} />
              </div>
              <span style={{ fontFamily: "var(--font-zone-body)", fontSize: 12, fontWeight: 700, color: "var(--tx)" }}>
                {zone.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
