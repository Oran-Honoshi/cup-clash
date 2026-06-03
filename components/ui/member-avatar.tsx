// components/ui/member-avatar.tsx
// Replace Next.js Image with plain img tags for DiceBear and other avatar URLs

"use client";

import { cn } from "@/lib/utils";

interface MemberAvatarProps {
  name:       string;
  avatarUrl?: string | null;
  size?:      "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  ring?:      boolean;
}

const SIZE_MAP = {
  xs: "h-6 w-6 text-[9px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getDiceBearUrl(name: string) {
  const seed = encodeURIComponent(name.toLowerCase().trim());
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}

export function MemberAvatar({ name, avatarUrl, size = "md", className, ring }: MemberAvatarProps) {
  const sizeClass = SIZE_MAP[size];

  // Handle preset:* avatar IDs
  if (avatarUrl?.startsWith("preset:")) {
    const presetId = avatarUrl.slice(7);
    const preset   = SOCCER_PRESETS.find(p => p.id === presetId);
    return (
      <div className={cn("rounded-full shrink-0 flex items-center justify-center font-bold", sizeClass, className)}
        style={{ background: preset ? `#${preset.bg}30` : "rgba(0,212,255,0.15)", border: ring ? "2px solid #00D4FF" : `1px solid #${preset?.bg ?? "00D4FF"}60` }}>
        <span style={{ fontSize: size === "xs" ? 10 : size === "sm" ? 14 : size === "md" ? 18 : size === "lg" ? 22 : 28 }}>
          {preset?.icon ?? "⚽"}
        </span>
      </div>
    );
  }

  const src = avatarUrl && !avatarUrl.startsWith("dicebear:") ? avatarUrl : getDiceBearUrl(name);

  return (
    <div className={cn("rounded-full overflow-hidden shrink-0 flex items-center justify-center", sizeClass, className)}
      style={{ background: "linear-gradient(135deg, #00D4FF22, #00FF8822)", border: ring ? "2px solid #00D4FF" : "1px solid rgba(0,212,255,0.2)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        className="w-full h-full object-cover"
        onError={e => {
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
          const parent = target.parentElement;
          if (parent && !parent.querySelector("span")) {
            const span = document.createElement("span");
            span.className = "font-black text-cyan-600";
            span.textContent = getInitials(name);
            parent.appendChild(span);
          }
        }}
      />
    </div>
  );
}

// ── Exports needed by profile page ───────────────────────────────────────────

export function dicebearUrl(name: string, sizeOrStyle: number | string = "adventurer") {
  const seed  = encodeURIComponent(name.toLowerCase().trim());
  const style = typeof sizeOrStyle === "string" ? sizeOrStyle : "adventurer";
  const size  = typeof sizeOrStyle === "number" ? sizeOrStyle : 160;
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9&size=${size}`;
}

export const SOCCER_PRESETS = [
  { id: "gk",  label: "Goalkeeper", icon: "🧤", emoji: "🧤", style: "adventurer",         bg: "00D4FF" },
  { id: "def", label: "Defender",   icon: "🛡️",  emoji: "🛡️",  style: "adventurer-neutral", bg: "00FF88" },
  { id: "mid", label: "Midfielder", icon: "⚡",  emoji: "⚡",  style: "fun-emoji",           bg: "8b5cf6" },
  { id: "fwd", label: "Forward",    icon: "🎯",  emoji: "🎯",  style: "lorelei",             bg: "f59e0b" },
  { id: "fan", label: "Super Fan",  icon: "📣",  emoji: "📣",  style: "notionists",          bg: "ec4899" },
];