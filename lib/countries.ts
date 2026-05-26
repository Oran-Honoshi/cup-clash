import type { Country, CountryCode } from "@/lib/types";

// Flag SVGs are self-hosted under /public/flags/ — see PRODUCT.md privacy
// principle and DESIGN.md "Don't ship third-party flag CDN calls".
// Usage: flagUrl(country.flagCode) → "/flags/us.svg"

export const COUNTRIES: Record<CountryCode, Country> = {
  // ── CONCACAF ──────────────────────────────────────────────────────────────
  USA: { code: "USA", name: "USA",         flagCode: "us", theme: { accent: "178 34 34",   accentGlow: "220 100 100" } },
  CAN: { code: "CAN", name: "Canada",      flagCode: "ca", theme: { accent: "220 38 38",   accentGlow: "252 165 165" } },
  MEX: { code: "MEX", name: "Mexico",      flagCode: "mx", theme: { accent: "22 163 74",   accentGlow: "134 239 172" } },
  JAM: { code: "JAM", name: "Jamaica",     flagCode: "jm", theme: { accent: "234 179 8",   accentGlow: "253 224 71"  } },
  PAN: { code: "PAN", name: "Panama",      flagCode: "pa", theme: { accent: "220 38 38",   accentGlow: "252 165 165" } },
  CRC: { code: "CRC", name: "Costa Rica",  flagCode: "cr", theme: { accent: "37 99 235",   accentGlow: "147 197 253" } },
  HON: { code: "HON", name: "Honduras",    flagCode: "hn", theme: { accent: "37 99 235",   accentGlow: "147 197 253" } },
  TTO: { code: "TTO", name: "Trinidad & Tobago", flagCode: "tt", theme: { accent: "220 38 38", accentGlow: "252 165 165" } },

  // ── CONMEBOL ──────────────────────────────────────────────────────────────
  ARG: { code: "ARG", name: "Argentina",   flagCode: "ar", theme: { accent: "117 192 232", accentGlow: "180 220 245" } },
  BRA: { code: "BRA", name: "Brazil",      flagCode: "br", theme: { accent: "254 221 0",   accentGlow: "255 240 130" } },
  COL: { code: "COL", name: "Colombia",    flagCode: "co", theme: { accent: "234 179 8",   accentGlow: "253 224 71"  } },
  URU: { code: "URU", name: "Uruguay",     flagCode: "uy", theme: { accent: "59 130 246",  accentGlow: "147 197 253" } },
  ECU: { code: "ECU", name: "Ecuador",     flagCode: "ec", theme: { accent: "234 179 8",   accentGlow: "253 224 71"  } },
  VEN: { code: "VEN", name: "Venezuela",   flagCode: "ve", theme: { accent: "220 38 38",   accentGlow: "252 165 165" } },

  // ── UEFA ──────────────────────────────────────────────────────────────────
  ENG: { code: "ENG", name: "England",     flagCode: "gb-eng", theme: { accent: "220 38 38",  accentGlow: "252 165 165" } },
  FRA: { code: "FRA", name: "France",      flagCode: "fr",     theme: { accent: "59 130 246", accentGlow: "147 197 253" } },
  ESP: { code: "ESP", name: "Spain",       flagCode: "es",     theme: { accent: "234 88 12",  accentGlow: "253 186 116" } },
  GER: { code: "GER", name: "Germany",     flagCode: "de",     theme: { accent: "234 179 8",  accentGlow: "253 224 71"  } },
  POR: { code: "POR", name: "Portugal",    flagCode: "pt",     theme: { accent: "5 150 105",  accentGlow: "110 231 183" } },
  NED: { code: "NED", name: "Netherlands", flagCode: "nl",     theme: { accent: "249 115 22", accentGlow: "253 186 116" } },
  BEL: { code: "BEL", name: "Belgium",     flagCode: "be",     theme: { accent: "220 38 38",  accentGlow: "252 165 165" } },
  ITA: { code: "ITA", name: "Italy",       flagCode: "it",     theme: { accent: "37 99 235",  accentGlow: "147 197 253" } },
  AUT: { code: "AUT", name: "Austria",     flagCode: "at",     theme: { accent: "220 38 38",  accentGlow: "252 165 165" } },
  CHE: { code: "CHE", name: "Switzerland", flagCode: "ch",     theme: { accent: "220 38 38",  accentGlow: "252 165 165" } },
  SCO: { code: "SCO", name: "Scotland",    flagCode: "gb-sct", theme: { accent: "37 99 235",  accentGlow: "147 197 253" } },
  DNK: { code: "DNK", name: "Denmark",     flagCode: "dk",     theme: { accent: "190 30 45",  accentGlow: "240 100 115" } },
  HUN: { code: "HUN", name: "Hungary",     flagCode: "hu",     theme: { accent: "220 38 38",  accentGlow: "252 165 165" } },
  SRB: { code: "SRB", name: "Serbia",      flagCode: "rs",     theme: { accent: "190 30 45",  accentGlow: "240 100 115" } },
  SVK: { code: "SVK", name: "Slovakia",    flagCode: "sk",     theme: { accent: "37 99 235",  accentGlow: "147 197 253" } },
  GRE: { code: "GRE", name: "Greece",      flagCode: "gr",     theme: { accent: "37 99 235",  accentGlow: "147 197 253" } },

  // ── CAF ───────────────────────────────────────────────────────────────────
  MAR: { code: "MAR", name: "Morocco",     flagCode: "ma", theme: { accent: "5 150 105",   accentGlow: "110 231 183" } },
  SEN: { code: "SEN", name: "Senegal",     flagCode: "sn", theme: { accent: "22 163 74",   accentGlow: "134 239 172" } },
  NGA: { code: "NGA", name: "Nigeria",     flagCode: "ng", theme: { accent: "22 163 74",   accentGlow: "134 239 172" } },
  EGY: { code: "EGY", name: "Egypt",       flagCode: "eg", theme: { accent: "220 38 38",   accentGlow: "252 165 165" } },
  CMR: { code: "CMR", name: "Cameroon",    flagCode: "cm", theme: { accent: "22 163 74",   accentGlow: "134 239 172" } },
  CIV: { code: "CIV", name: "Côte d'Ivoire", flagCode: "ci", theme: { accent: "249 115 22", accentGlow: "253 186 116" } },
  MLI: { code: "MLI", name: "Mali",        flagCode: "ml", theme: { accent: "22 163 74",   accentGlow: "134 239 172" } },
  RSA: { code: "RSA", name: "South Africa", flagCode: "za", theme: { accent: "22 163 74",  accentGlow: "134 239 172" } },
  TUN: { code: "TUN", name: "Tunisia",     flagCode: "tn", theme: { accent: "220 38 38",   accentGlow: "252 165 165" } },

  // ── AFC ───────────────────────────────────────────────────────────────────
  JPN: { code: "JPN", name: "Japan",       flagCode: "jp", theme: { accent: "188 0 45",    accentGlow: "240 100 130" } },
  KOR: { code: "KOR", name: "South Korea", flagCode: "kr", theme: { accent: "205 32 44",   accentGlow: "240 120 130" } },
  IRN: { code: "IRN", name: "Iran",        flagCode: "ir", theme: { accent: "22 163 74",   accentGlow: "134 239 172" } },
  AUS: { code: "AUS", name: "Australia",   flagCode: "au", theme: { accent: "0 82 165",    accentGlow: "100 160 220" } },
  JOR: { code: "JOR", name: "Jordan",      flagCode: "jo", theme: { accent: "22 163 74",   accentGlow: "134 239 172" } },
  IRQ: { code: "IRQ", name: "Iraq",        flagCode: "iq", theme: { accent: "22 163 74",   accentGlow: "134 239 172" } },
  UZB: { code: "UZB", name: "Uzbekistan",  flagCode: "uz", theme: { accent: "37 99 235",   accentGlow: "147 197 253" } },
  OMA: { code: "OMA", name: "Oman",        flagCode: "om", theme: { accent: "22 163 74",   accentGlow: "134 239 172" } },

  // ── OFC ───────────────────────────────────────────────────────────────────
  NZL: { code: "NZL", name: "New Zealand", flagCode: "nz", theme: { accent: "37 99 235",   accentGlow: "147 197 253" } },
};

export const ALL_COUNTRIES = Object.values(COUNTRIES);

/** The three 2026 host nations — shown prominently on the landing page */
export const HOST_NATIONS: CountryCode[] = ["USA", "CAN", "MEX"];

/**
 * Returns the local SVG path for a flag, e.g. "br" → "/flags/br.svg".
 *
 * The legacy `width` parameter is accepted for source-compatibility with
 * callers from the flagcdn era and is intentionally ignored — SVGs scale
 * losslessly, so a single asset replaces the per-width PNG variants.
 */
export function flagUrl(flagCode: string, _width?: 20 | 40 | 80 | 160): string {
  return `/flags/${flagCode}.svg`;
}
