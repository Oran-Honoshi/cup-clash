"use client";

import { useCallback, useState } from "react";

// Extracted from daily-challenge-client.tsx's handleShare (2nd caller is
// match-duel-card.tsx) — native share sheet when available, clipboard copy
// as the fallback, with a short-lived `copied` flag the caller can render
// as "Copied!" feedback on the share button itself.
export function useWebShare() {
  const [copied, setCopied] = useState(false);

  const share = useCallback(async (text: string) => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, []);

  return { share, copied };
}
