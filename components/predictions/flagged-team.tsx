"use client";

import { useState } from "react";

interface FlaggedTeamProps {
  name: string;
  flagCode?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

// Name → flagCode fallback for callers that pass a country name without an
// explicit ISO code. Lowercase, hyphenated subdivisions where applicable.
// SVGs are self-hosted in /public/flags/ — see PRODUCT.md privacy principle.
// Covers both API-Football names (players table) and our normalized display names (schedule.ts).
const TEAM_FLAGS: Record<string, string> = {
  // CONCACAF
  USA: "us", Canada: "ca", Mexico: "mx", Panama: "pa", Haiti: "ht", "Curaçao": "cw",
  // CONMEBOL
  Argentina: "ar", Brazil: "br", Colombia: "co", Uruguay: "uy", Ecuador: "ec", Paraguay: "py",
  // UEFA
  England: "gb-eng", France: "fr", Spain: "es", Germany: "de", Portugal: "pt",
  Netherlands: "nl", Belgium: "be", Austria: "at", Switzerland: "ch", Scotland: "gb-sct",
  "Bosnia & Herzegovina": "ba", Croatia: "hr",
  "Czech Republic": "cz", Czechia: "cz",
  Norway: "no", Sweden: "se",
  "Türkiye": "tr", Turkey: "tr",
  // CAF
  Morocco: "ma", Senegal: "sn", Egypt: "eg", Algeria: "dz", Tunisia: "tn",
  Ghana: "gh", "Cape Verde Islands": "cv", "Cabo Verde": "cv",
  "South Africa": "za", "Ivory Coast": "ci", "Côte d'Ivoire": "ci", "Congo DR": "cd",
  // AFC
  Japan: "jp", "South Korea": "kr", "Korea Republic": "kr",
  Iran: "ir", "IR Iran": "ir",
  Australia: "au", Jordan: "jo", Iraq: "iq", Uzbekistan: "uz",
  Qatar: "qa", "Saudi Arabia": "sa",
  // OFC
  "New Zealand": "nz",
};

const VALID_CODE = /^[a-z]{2}(-[a-z]{2,3})?$/;

// Inline-text size scale — independently tuned from <Flag>'s 3:2 sizing so
// the swatch sits cleanly next to a line of running text. Heights are
// intentionally slightly shorter than 3:2 (4:3-ish) for vertical alignment
// with descenders.
const SIZES = {
  xs: { h: "h-3", w: "w-4", text: "text-xs"   },
  sm: { h: "h-4", w: "w-5", text: "text-sm"   },
  md: { h: "h-4", w: "w-6", text: "text-base" },
  lg: { h: "h-5", w: "w-7", text: "text-lg"   },
} as const;

export function FlaggedTeam({ name, flagCode, size = "sm", className = "" }: FlaggedTeamProps) {
  const dims = SIZES[size];
  const isTbd = name === "TBD" || !name;

  const rawCode = flagCode ?? TEAM_FLAGS[name];
  const normalized = (rawCode ?? "").trim().toLowerCase();
  const usableCode = !isTbd && VALID_CODE.test(normalized) ? normalized : null;

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {isTbd ? (
        <FlagSlot dims={dims} />
      ) : usableCode ? (
        <FlagImage code={usableCode} alt={name} dims={dims} />
      ) : null}
      <span
        className={`${dims.text} font-bold`}
        style={{ color: isTbd ? "rgba(255,255,255,0.4)" : "#ffffff" }}
      >
        {isTbd ? "TBD" : name}
      </span>
    </span>
  );
}

function FlagImage({ code, alt, dims }: { code: string; alt: string; dims: typeof SIZES[keyof typeof SIZES] }) {
  // If the static asset is missing (e.g. an unrecognized FIFA-issued code) we
  // fall back to the neutral slot rather than rendering a broken-image icon.
  const [errored, setErrored] = useState(false);
  if (errored) return <FlagSlot dims={dims} />;

  return (
    <span
      className={`relative ${dims.h} ${dims.w} rounded-sm overflow-hidden shrink-0 inline-block`}
      style={{ border: "1px solid rgba(0,0,0,0.08)" }}
    >
      <img
        src={`/flags/${code}.svg`}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable={false}
        onError={() => setErrored(true)}
        className="absolute inset-0 h-full w-full object-cover select-none"
      />
    </span>
  );
}

function FlagSlot({ dims }: { dims: typeof SIZES[keyof typeof SIZES] }) {
  return (
    <span
      aria-hidden="true"
      className={`${dims.h} ${dims.w} rounded-sm inline-block shrink-0`}
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
    />
  );
}
