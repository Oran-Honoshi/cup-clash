/**
 * MemberAvatar — renders a member's avatar with three tiers:
 *
 * 1. Uploaded photo  → <img> with their real photo URL
 * 2. DiceBear preset → illustrated soccer-role icon via DiceBear HTTP API
 * 3. DiceBear auto   → unique illustrated face generated from their username seed
 *
 * Uses DiceBear's free CDN API (https://api.dicebear.com) — zero npm packages,
 * zero bundle size impact. SVGs are generated server-side and cached by CDN.
 */

import { cn } from "@/lib/utils";

// ─── DiceBear config ─────────────────────────────────────────────────────────

const DICEBEAR_BASE = "https://api.dicebear.com/9.x";

// Soccer role presets — each maps to a DiceBear "icons" seed that produces
// a clean, recognizable sports/role icon.
export const SOCCER_PRESETS = [
  { id: "striker",   label: "Striker",   icon: "⚽", seed: "soccer-ball",    bg: "e74c3c" },
  { id: "keeper",    label: "Keeper",    icon: "🧤", seed: "hand-wave",      bg: "2980b9" },
  { id: "captain",   label: "Captain",   icon: "🏆", seed: "crown",          bg: "f39c12" },
  { id: "coach",     label: "Coach",     icon: "📋", seed: "clipboard",      bg: "27ae60" },
  { id: "analyst",   label: "Analyst",   icon: "📊", seed: "bar-chart",      bg: "8e44ad" },
  { id: "wildcard",  label: "Wild Card", icon: "🃏", seed: "playing-card",   bg: "16a085" },
  { id: "legend",    label: "Legend",    icon: "⭐", seed: "star",           bg: "d35400" },
  { id: "speedster", label: "Speedster", icon: "⚡", seed: "lightning",      bg: "c0392b" },
  { id: "pundit",    label: "Pundit",    icon: "🎙️", seed: "microphone",    bg: "2c3e50" },
  { id: "champion",  label: "Champion",  icon: "🥇", seed: "medal",          bg: "b7950b" },
  { id: "fan",       label: "Super Fan", icon: "🎉", seed: "confetti",       bg: "e91e8c" },
  { id: "referee",   label: "Referee",   icon: "🟨", seed: "whistle",        bg: "555555" },
] as const;

export type PresetId = typeof SOCCER_PRESETS[number]["id"];

/**
 * Build a DiceBear avataaars URL for a given username.
 * Produces a consistent illustrated face — same name always = same face.
 */
export function dicebearUrl(seed: string, size = 80): string {
  const params = new URLSearchParams({
    seed,
    size: String(size),
    backgroundColor: "transparent",
    // avataaars options — realistic illustrated style
    mouth: "smile,twinkle,tongue",
    eyes: "default,happy,wink",
    eyebrows: "default,raised,unibrow",
    accessories: "prescription01,prescription02,sunglasses",
    accessoriesColor: "transparent",
    clothesColor: "3c4f5c,65c9ff,ff488e,ffdeb5,b1e2ff,c6e2ff,e6e6e6,ff5c5c",
    top: "longHair,shortHair,hat,hijab,turban,winterHat1,winterHat2",
    skinColor: "light,pale,golden,brown,dark",
  });
  return `${DICEBEAR_BASE}/avataaars/svg?${params}`;
}

/**
 * Build a DiceBear "icons" URL for a preset role.
 * These are clean flat icons, not faces.
 */
function presetIconUrl(preset: typeof SOCCER_PRESETS[number], size = 80): string {
  return `${DICEBEAR_BASE}/icons/svg?seed=${preset.seed}&size=${size}&backgroundColor=${preset.bg}&backgroundType=solid&radius=50&icon=${preset.seed}&scale=75`;
}

// ─── Avatar component ─────────────────────────────────────────────────────────

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_PX: Record<AvatarSize, number>     = { xs: 24, sm: 32, md: 40, lg: 48, xl: 80 };
const SIZE_CLASS: Record<AvatarSize, string>  = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-20 w-20",
};

interface MemberAvatarProps {
  /** Member display name — used as DiceBear seed for auto-avatar */
  name: string;
  /** Stored avatar value: a photo URL, "preset:keeperId", or null for auto */
  avatarUrl?: string | null;
  size?: AvatarSize;
  className?: string;
  dim?: boolean;
  /** Show a thin ring around the avatar */
  ring?: boolean;
}

export function MemberAvatar({
  name,
  avatarUrl,
  size = "md",
  className,
  dim = false,
  ring = false,
}: MemberAvatarProps) {
  const px = SIZE_PX[size];
  const sizeClass = SIZE_CLASS[size];
  const ringClass = ring ? "ring-2 ring-white/20" : "";
  const dimClass  = dim  ? "opacity-70"           : "";

  const base = cn(sizeClass, "rounded-full object-cover shrink-0", ringClass, dimClass, className);

  // ── 1. Real uploaded photo ──────────────────────────────────────────────────
  if (avatarUrl && !avatarUrl.startsWith("preset:") && !avatarUrl.startsWith("dicebear:")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={avatarUrl} alt={name} width={px} height={px} className={base} />
    );
  }

  // ── 2. Soccer role preset ───────────────────────────────────────────────────
  if (avatarUrl?.startsWith("preset:")) {
    const presetId = avatarUrl.replace("preset:", "") as PresetId;
    const preset = SOCCER_PRESETS.find(p => p.id === presetId);
    if (preset) {
      // For presets, render emoji in a colored circle — DiceBear icons API
      // doesn't have exact soccer roles, so we use styled emoji circles
      // which look great and are consistent.
      return (
        <div
          className={cn(sizeClass, "rounded-full flex items-center justify-center shrink-0 select-none", ringClass, dimClass, className)}
          style={{ backgroundColor: `#${preset.bg}`, fontSize: px * 0.45 }}
          title={preset.label}
          aria-label={preset.label}
        >
          {preset.icon}
        </div>
      );
    }
  }

  // ── 3. DiceBear auto-avatar (default) ──────────────────────────────────────
  // Generated from the member's name — consistent, unique, illustrated face
  const url = dicebearUrl(name, px * 2); // 2× for retina
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={name}
      width={px}
      height={px}
      className={base}
      style={{ background: "rgba(255,255,255,0.06)" }}
      loading="lazy"
    />
  );
}
