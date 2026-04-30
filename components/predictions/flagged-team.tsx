"use client";

import Image from "next/image";
import { flagUrl } from "@/lib/countries";

interface FlaggedTeamProps {
  name: string;
  flagCode?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const TEAM_FLAGS: Record<string, string> = {
  "Mexico": "mx", "USA": "us", "Canada": "ca", "Brazil": "br",
  "Argentina": "ar", "France": "fr", "England": "gb-eng", "Germany": "de",
  "Spain": "es", "Portugal": "pt", "Netherlands": "nl", "Italy": "it",
  "Belgium": "be", "Croatia": "hr", "Morocco": "ma", "Senegal": "sn",
  "Japan": "jp", "South Korea": "kr", "Australia": "au", "Uruguay": "uy",
  "Colombia": "co", "Ecuador": "ec", "Chile": "cl", "Peru": "pe",
  "Nigeria": "ng", "Ghana": "gh", "Egypt": "eg", "Cameroon": "cm",
  "Saudi Arabia": "sa", "Iran": "ir", "Qatar": "qa", "South Africa": "za",
  "Serbia": "rs", "Switzerland": "ch", "Denmark": "dk", "Poland": "pl",
  "Ukraine": "ua", "Turkey": "tr", "Czech Republic": "cz", "Austria": "at",
  "Wales": "gb-wls", "Scotland": "gb-sct", "Norway": "no", "Sweden": "se",
};

export function FlaggedTeam({ name, flagCode, size = "sm", className = "" }: FlaggedTeamProps) {
  const code = flagCode ?? TEAM_FLAGS[name] ?? null;

  const dims = {
    xs: { px: 14, h: "h-3", w: "w-4",  text: "text-xs"  },
    sm: { px: 18, h: "h-4", w: "w-5",  text: "text-sm"  },
    md: { px: 22, h: "h-4", w: "w-6",  text: "text-base"},
    lg: { px: 28, h: "h-5", w: "w-7",  text: "text-lg"  },
  }[size];

  if (name === "TBD") {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className}`}>
        <span className={`${dims.h} ${dims.w} rounded-sm bg-slate-100 inline-block border border-slate-200`} />
        <span className={`${dims.text} font-bold text-slate-400`}>TBD</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {code && (
        <span className={`relative ${dims.h} ${dims.w} rounded-sm overflow-hidden shrink-0 inline-block`}
          style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
          <Image src={flagUrl(code, 20)} alt={name} fill className="object-cover" unoptimized />
        </span>
      )}
      <span className={`${dims.text} font-bold`} style={{ color: "#0F172A" }}>{name}</span>
    </span>
  );
}