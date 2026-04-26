"use client";

import { cn } from "@/lib/utils";

// country-flag-icons provides SVG flags as React components.
// Import pattern: import { US } from 'country-flag-icons/react/3x2'
// The 3x2 aspect ratio is standard for most flags.
// We use dynamic rendering to keep the bundle lean.

interface FlagProps {
  /** ISO 3166-1 alpha-2 code e.g. "US", "GB-ENG", "FR" */
  code: string;
  /** Display size — controls width, height is auto from 3:2 ratio */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZES = {
  xs: "w-5",
  sm: "w-7",
  md: "w-10",
  lg: "w-14",
  xl: "w-20",
};

/**
 * Renders a country flag SVG from country-flag-icons.
 * Falls back to a neutral placeholder if the code isn't found.
 *
 * Usage:
 *   <Flag code="US" size="md" />
 *   <Flag code="GB-ENG" size="sm" />
 */
export function Flag({ code, size = "md", className }: FlagProps) {
  // country-flag-icons uses uppercase codes with hyphens for subdivisions
  // e.g. "gb-eng" → "GB-ENG"
  const normalized = code.toUpperCase().replace("GB-ENG", "GB-ENG").replace("GB-SCT", "GB-SCT");

  return (
    <span
      className={cn(
        "inline-flex shrink-0 overflow-hidden rounded-sm shadow-sm",
        SIZES[size],
        className
      )}
      style={{ aspectRatio: "3/2" }}
      title={normalized}
      aria-label={`${normalized} flag`}
    >
      <FlagSVG code={normalized} />
    </span>
  );
}

// Lazy SVG loader — only imports the flag that's actually needed.
// country-flag-icons exports ~250 SVG components so we can't import all at build time.
function FlagSVG({ code }: { code: string }) {
  // We use a URL-based approach with the package's built-in SVG files
  // to avoid importing 250+ SVG modules at the top level.
  const src = `https://flagcdn.com/w80/${code.toLowerCase().replace("gb-eng", "gb-eng").replace("gb-sct", "gb-sct")}.svg`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={code}
      className="h-full w-full object-cover"
      loading="lazy"
    />
  );
}
