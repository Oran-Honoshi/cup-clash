"use client";

import { MemberAvatar } from "@/components/ui/member-avatar";
import { getTeamColor } from "@/lib/countries";
import { cn } from "@/lib/utils";

// Standardized circular ring treatment on top of the existing MemberAvatar
// rendering (dicebear / preset / uploaded-photo logic lives there, unchanged).

type UserAvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: UserAvatarSize;
  /** Overrides the default subtle ring — e.g. gold/silver/bronze for podium rank, accent for "you". Takes priority over teamCountry. */
  ringColor?: string;
  /** That specific user's own "Your Team" country selection (profiles.country) — renders a subtle team-color ring/glow when set. */
  teamCountry?: string | null;
  className?: string;
}

export function UserAvatar({ name, avatarUrl, size = "md", ringColor, teamCountry, className }: UserAvatarProps) {
  const teamColor = ringColor ? null : getTeamColor(teamCountry);
  const ring = ringColor ?? (teamColor ? `rgb(${teamColor.accent})` : "var(--color-border-secondary)");
  const glow = teamColor ? `, 0 0 6px 0 rgb(${teamColor.accent} / 0.35)` : "";

  return (
    <div
      className={cn("inline-flex shrink-0 rounded-full", className)}
      style={{ boxShadow: `0 0 0 1.5px ${ring}${glow}` }}
    >
      <MemberAvatar name={name} avatarUrl={avatarUrl} size={size} />
    </div>
  );
}
