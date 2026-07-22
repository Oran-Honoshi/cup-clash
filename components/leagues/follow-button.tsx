"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Check, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { buildAuthWallUrl, type FollowType } from "@/lib/auth-wall";

interface FollowButtonProps {
  type: FollowType;
  id: string;
  userId: string | null;
  initialFollowing: boolean;
  compact?: boolean;
  onFollowChange?: (following: boolean) => void;
}

export function FollowButton({ type, id, userId, initialFollowing, compact = false, onFollowChange }: FollowButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!userId) {
      const currentPathWithQuery = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
      router.push(buildAuthWallUrl(currentPathWithQuery, { type, id }));
      return;
    }

    setLoading(true);
    const sb = createClient();
    if (following) {
      const { error } = await sb.from("user_follows").delete()
        .eq("user_id", userId).eq("followed_type", type).eq("followed_id", id);
      if (!error) { setFollowing(false); onFollowChange?.(false); }
    } else {
      const { error } = await sb.from("user_follows").upsert(
        { user_id: userId, followed_type: type, followed_id: id },
        { onConflict: "user_id,followed_type,followed_id", ignoreDuplicates: true }
      );
      if (!error) { setFollowing(true); onFollowChange?.(true); }
    }
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-pressed={following}
      className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider transition-all disabled:opacity-60"
      style={{
        fontFamily: "var(--font-ui)",
        fontSize: compact ? 11 : 12,
        padding: compact ? "6px 12px" : "9px 16px",
        borderRadius: 100,
        background: following ? "var(--ac)" : "var(--sf)",
        color: following ? "var(--at)" : "var(--tx)",
        border: following ? "1px solid var(--ac)" : "1px solid var(--br)",
        cursor: loading ? "not-allowed" : "pointer",
      }}
    >
      {following ? <Check size={compact ? 12 : 14} /> : <Plus size={compact ? 12 : 14} />}
      {following ? "Following" : "Follow"}
    </button>
  );
}
