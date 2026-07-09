"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { parseFollowParam } from "@/lib/auth-wall";

// Mounted on any page reachable via the auth-wall redirect (/scores,
// /standings, /leagues). On landing, if the visitor just authenticated and
// a `?follow=type:id` param is present, complete that follow once and
// strip the param — this is what makes "Follow" work for a signed-out
// visitor without a second click after signup.
export function ConsumeFollowParam({ userId }: { userId: string | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [confirmed, setConfirmed] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const follow = parseFollowParam(searchParams);
    if (!follow) return;

    (async () => {
      const sb = createClient();
      await sb.from("user_follows").upsert(
        { user_id: userId, followed_type: follow.type, followed_id: follow.id },
        { onConflict: "user_id,followed_type,followed_id", ignoreDuplicates: true }
      );
      setConfirmed(follow.type);

      const params = new URLSearchParams(searchParams.toString());
      params.delete("follow");
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (!confirmed) return null;

  return (
    <div
      role="status"
      className="flex items-center gap-2 mb-4"
      style={{
        background: "rgba(0,207,128,0.1)",
        border: "1px solid rgba(0,207,128,0.3)",
        borderRadius: 12,
        padding: "10px 14px",
        fontFamily: "var(--font-ui)",
        fontSize: 13,
        fontWeight: 700,
        color: "var(--ac)",
      }}
    >
      <CheckCircle2 size={16} />
      You&apos;re now following — welcome to Cup Clash!
    </div>
  );
}
