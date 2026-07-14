import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Match } from "@/lib/types";
import { zoneFontVars } from "@/lib/fonts/zone-fonts";
import { ZONES } from "@/lib/zones";

export type HomePersona = "anonymous" | "following-no-group" | "group-member";

interface PersonaHeroProps {
  persona: HomePersona;
  nextMatch: Match | null;
  group?: { name: string; rank: number; totalPlayers: number } | null;
}

const HOME_ACCENT = ZONES.find(z => z.key === "home")!.accent;

function formatCountdown(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  if (diffMs <= 0) return "Live now";
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `Locks in ${days}d ${hours % 24}h`;
  if (hours > 0) return `Locks in ${hours}h ${Math.floor((diffMs % 3_600_000) / 60_000)}m`;
  return `Locks in ${Math.floor(diffMs / 60_000)}m`;
}

const wrapperStyle: React.CSSProperties = {
  borderRadius: 18,
  border: "1px solid var(--br)",
  background: `linear-gradient(135deg, color-mix(in srgb, ${HOME_ACCENT} 14%, var(--sf)), var(--sf))`,
  padding: 20,
};
const eyebrowStyle: React.CSSProperties = {
  fontFamily: "var(--font-zone-body)", fontSize: 11, fontWeight: 700,
  textTransform: "uppercase", letterSpacing: "0.1em", color: HOME_ACCENT,
};
const headlineStyle: React.CSSProperties = {
  fontFamily: "var(--font-zone-display)", fontSize: 22, fontWeight: 700,
  color: "var(--tx)", marginTop: 6, lineHeight: 1.25,
};
const bodyStyle: React.CSSProperties = {
  fontFamily: "var(--font-zone-body)", fontSize: 13, color: "var(--t2)", marginTop: 4,
};
const ctaStyle: React.CSSProperties = {
  fontFamily: "var(--font-zone-body)", fontSize: 13, fontWeight: 700, color: HOME_ACCENT,
  display: "inline-flex", alignItems: "center", gap: 4, marginTop: 14, textDecoration: "none",
};

export function PersonaHero({ persona, nextMatch, group }: PersonaHeroProps) {
  if (persona === "anonymous") {
    return (
      <div className={zoneFontVars} style={wrapperStyle}>
        <div style={eyebrowStyle}>Welcome to Cup Clash</div>
        <h2 style={headlineStyle}>Follow a team to make it yours</h2>
        <p style={bodyStyle}>Track results, get personalized news, and see where you rank once you join a group.</p>
        <Link href="/leagues?tab=teams" style={ctaStyle}>
          Follow a team <ChevronRight size={14} />
        </Link>
      </div>
    );
  }

  if (persona === "following-no-group") {
    return (
      <div className={zoneFontVars} style={wrapperStyle}>
        <div style={eyebrowStyle}>{nextMatch ? "Next up" : "Get started"}</div>
        {nextMatch ? (
          <>
            <h2 style={headlineStyle}>{nextMatch.home} vs {nextMatch.away}</h2>
            <p style={bodyStyle}>{formatCountdown(nextMatch.utcTime ?? nextMatch.time)}</p>
          </>
        ) : (
          <>
            <h2 style={headlineStyle}>No group yet</h2>
            <p style={bodyStyle}>Join or create a group to start competing with friends.</p>
          </>
        )}
        <Link href="/create-group" style={ctaStyle}>
          Join or create a group <ChevronRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className={zoneFontVars} style={wrapperStyle}>
      <div style={eyebrowStyle}>{group?.name ?? "Your group"}</div>
      {nextMatch ? (
        <>
          <h2 style={headlineStyle}>{nextMatch.home} vs {nextMatch.away}</h2>
          <p style={bodyStyle}>{formatCountdown(nextMatch.utcTime ?? nextMatch.time)}</p>
        </>
      ) : (
        <h2 style={headlineStyle}>No upcoming matches</h2>
      )}
      {group && (
        <p style={{ ...bodyStyle, marginTop: 4 }}>
          Ranked #{group.rank} of {group.totalPlayers}
        </p>
      )}
      <Link href="/predictions" style={ctaStyle}>
        View your picks <ChevronRight size={14} />
      </Link>
    </div>
  );
}
