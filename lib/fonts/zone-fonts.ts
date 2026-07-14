import { Space_Grotesk, Manrope } from "next/font/google";

// Typography for the Zones IA shell only (nav, Home digest, Settings) —
// per zone_design/README.md "Type" tokens. Deliberately NOT wired into the
// root layout: every other existing screen keeps its current fonts
// (Bricolage/Outfit/etc. from app/layout.tsx) unchanged in this pass.
export const zoneDisplayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-zone-display",
  display: "swap",
  weight: ["600", "700"],
});

export const zoneBodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-zone-body",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const zoneFontVars = `${zoneDisplayFont.variable} ${zoneBodyFont.variable}`;
