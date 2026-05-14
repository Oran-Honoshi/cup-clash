// components/ui/member-avatar.tsx
// Replace Next.js Image with plain img tags for DiceBear and other avatar URLs

"use client";

import { cn } from "@/lib/utils";

interface MemberAvatarProps {
  name:      string;
  avatarUrl?: string | null;
  size?:     "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
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

export function MemberAvatar({ name, avatarUrl, size = "md", className }: MemberAvatarProps) {
  const sizeClass = SIZE_MAP[size];
  const src = avatarUrl || getDiceBearUrl(name);

  return (
    <div className={cn("rounded-full overflow-hidden shrink-0 flex items-center justify-center", sizeClass, className)}
      style={{ background: "linear-gradient(135deg, #00D4FF22, #00FF8822)", border: "1px solid rgba(0,212,255,0.2)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        className="w-full h-full object-cover"
        onError={e => {
          // On error show initials fallback
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

export function dicebearUrl(name: string, style = "adventurer") {
  const seed = encodeURIComponent(name.toLowerCase().trim());
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}

export const SOCCER_PRESETS = [
  { id: "gk",  label: "Goalkeeper", emoji: "🧤", style: "adventurer"       },
  { id: "def", label: "Defender",   emoji: "🛡️",  style: "adventurer-neutral" },
  { id: "mid", label: "Midfielder", emoji: "⚡",  style: "fun-emoji"         },
  { id: "fwd", label: "Forward",    emoji: "🎯",  style: "lorelei"           },
  { id: "fan", label: "Super Fan",  emoji: "📣",  style: "notionists"        },
];