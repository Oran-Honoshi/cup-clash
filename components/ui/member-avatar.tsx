import { cn } from "@/lib/utils";

const PRESET_EMOJIS: Record<string, string> = {
  keeper:   "🧤",
  striker:  "⚽",
  captain:  "🏆",
  coach:    "📋",
  fan:      "🎉",
  analyst:  "📊",
  wildcard: "🃏",
  legend:   "⭐",
  referee:  "🟨",
  pundit:   "🎙️",
  trophy:   "🥇",
  boot:     "👟",
};

type AvatarSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
};

const EMOJI_SIZE: Record<AvatarSize, string> = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
};

interface MemberAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: AvatarSize;
  className?: string;
  dim?: boolean;
}

export function MemberAvatar({ name, avatarUrl, size = "md", className, dim = false }: MemberAvatarProps) {
  const sizeClass = SIZE_CLASSES[size];

  // Photo upload
  if (avatarUrl && !avatarUrl.startsWith("preset:")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className={cn(sizeClass, "rounded-full object-cover shrink-0 ring-2 ring-white/10", dim && "opacity-75", className)}
      />
    );
  }

  // Preset emoji avatar
  if (avatarUrl?.startsWith("preset:")) {
    const presetId = avatarUrl.replace("preset:", "");
    const emoji = PRESET_EMOJIS[presetId];
    if (emoji) {
      return (
        <div
          className={cn(sizeClass, "rounded-full flex items-center justify-center shrink-0", dim && "opacity-75", className)}
          style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--brand)), rgb(var(--brand-2)))" }}
        >
          <span className={EMOJI_SIZE[size]}>{emoji}</span>
        </div>
      );
    }
  }

  // Initials fallback
  return (
    <div
      className={cn(sizeClass, "rounded-full flex items-center justify-center shrink-0 text-white font-bold", dim && "opacity-75", className)}
      style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--brand)), rgb(var(--brand-2)))" }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
