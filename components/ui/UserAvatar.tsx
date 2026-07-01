"use client";

import { MemberAvatar } from "@/components/ui/member-avatar";
import { cn } from "@/lib/utils";

// Standardized circular ring treatment on top of the existing MemberAvatar
// rendering (dicebear / preset / uploaded-photo logic lives there, unchanged).

type UserAvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: UserAvatarSize;
  /** Overrides the default subtle ring — e.g. gold/silver/bronze for podium rank, accent for "you". */
  ringColor?: string;
  className?: string;
}

export function UserAvatar({ name, avatarUrl, size = "md", ringColor, className }: UserAvatarProps) {
  return (
    <div
      className={cn("inline-flex shrink-0 rounded-full", className)}
      style={{ boxShadow: `0 0 0 1.5px ${ringColor ?? "var(--color-border-secondary)"}` }}
    >
      <MemberAvatar name={name} avatarUrl={avatarUrl} size={size} />
    </div>
  );
}
