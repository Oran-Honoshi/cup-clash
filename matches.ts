import type { Country, CountryCode } from "@/lib/types";

// Each country's theme is an RGB triplet (no commas) so it can be
// fed straight into the `rgb(var(--accent) / <alpha>)` Tailwind pattern.
export const COUNTRIES: Record<CountryCode, Country> = {
  ARG: {
    code: "ARG",
    name: "Argentina",
    flag: "🇦🇷",
    theme: { accent: "117 192 232", accentGlow: "180 220 245" },
  },
  BRA: {
    code: "BRA",
    name: "Brazil",
    flag: "🇧🇷",
    theme: { accent: "254 221 0", accentGlow: "255 240 130" },
  },
  ENG: {
    code: "ENG",
    name: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    theme: { accent: "220 38 38", accentGlow: "252 165 165" },
  },
  FRA: {
    code: "FRA",
    name: "France",
    flag: "🇫🇷",
    theme: { accent: "59 130 246", accentGlow: "147 197 253" },
  },
  ESP: {
    code: "ESP",
    name: "Spain",
    flag: "🇪🇸",
    theme: { accent: "234 88 12", accentGlow: "253 186 116" },
  },
  GER: {
    code: "GER",
    name: "Germany",
    flag: "🇩🇪",
    theme: { accent: "234 179 8", accentGlow: "253 224 71" },
  },
  POR: {
    code: "POR",
    name: "Portugal",
    flag: "🇵🇹",
    theme: { accent: "5 150 105", accentGlow: "110 231 183" },
  },
  ITA: {
    code: "ITA",
    name: "Italy",
    flag: "🇮🇹",
    theme: { accent: "37 99 235", accentGlow: "147 197 253" },
  },
  NED: {
    code: "NED",
    name: "Netherlands",
    flag: "🇳🇱",
    theme: { accent: "249 115 22", accentGlow: "253 186 116" },
  },
  ISR: {
    code: "ISR",
    name: "Israel",
    flag: "🇮🇱",
    theme: { accent: "59 130 246", accentGlow: "147 197 253" },
  },
  USA: {
    code: "USA",
    name: "USA",
    flag: "🇺🇸",
    theme: { accent: "239 68 68", accentGlow: "252 165 165" },
  },
  MEX: {
    code: "MEX",
    name: "Mexico",
    flag: "🇲🇽",
    theme: { accent: "22 163 74", accentGlow: "134 239 172" },
  },
};

export const DEFAULT_COUNTRY: CountryCode = "ARG";

export const ALL_COUNTRIES = Object.values(COUNTRIES);
