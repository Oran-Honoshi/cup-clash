"use client";

interface FormatOptions {
  showDate?: boolean;
  showDay?:  boolean;
}

/**
 * Format an ISO match kickoff string into the viewer's local time.
 * Always runs client-side — never call from Server Components.
 */
export function formatMatchTime(isoString: string, options: FormatOptions = {}): string {
  const date = new Date(isoString);

  const timePart = date.toLocaleTimeString("en-GB", {
    hour:   "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts: string[] = [];

  if (options.showDay) {
    parts.push(date.toLocaleDateString("en-GB", { weekday: "short" }));
  }

  if (options.showDate) {
    parts.push(date.toLocaleDateString("en-GB", { month: "short", day: "numeric" }));
  }

  parts.push(timePart);
  return parts.join(" ");
}
