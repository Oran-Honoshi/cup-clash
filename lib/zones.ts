import { Home, Newspaper, Users, Gamepad2, BarChart2, type LucideIcon } from "lucide-react";

// Zones IA — each zone owns one accent color, used for its icon/headline/
// primary actions wherever that zone's content appears (Home digest teasers,
// the zone nav, the "Jump into a zone" grid). Keep this mapping in sync
// across all of those call sites — it's the app's main "which room am I in"
// signal. Source: zone_design/README.md design tokens.
export type ZoneKey = "home" | "news" | "social" | "game" | "stats";

export interface Zone {
  key: ZoneKey;
  label: string;
  href: string;
  icon: LucideIcon;
  accent: string;
}

export const ZONES: Zone[] = [
  { key: "home",   label: "Home",   href: "/home",             icon: Home,      accent: "#E8B84B" },
  { key: "news",   label: "News",   href: "/news",              icon: Newspaper, accent: "#4C8DFF" },
  { key: "social", label: "Social", href: "/groups",            icon: Users,     accent: "#FF6B6B" },
  { key: "game",   label: "Game",   href: "/game",              icon: Gamepad2,  accent: "#B685FF" },
  { key: "stats",  label: "Stats",  href: "/stats",             icon: BarChart2, accent: "#35D0A5" },
];

export function isZoneActive(zone: Zone, pathname: string): boolean {
  if (zone.href === "/home") return pathname === "/home";
  return pathname === zone.href || pathname.startsWith(`${zone.href}/`);
}
