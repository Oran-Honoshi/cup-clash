"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

// Circular counterpart to components/ui/flag.tsx — same self-hosted
// /flags/*.svg source (no third-party flag CDN), cropped to a circle
// instead of a rounded rectangle for use in avatar-adjacent contexts.

type FlagBadgeSize = "sm" | "md" | "lg";
type FlagBadgeShape = "circle" | "hexagon";

const SIZE_PX: Record<FlagBadgeSize, number> = { sm: 24, md: 32, lg: 48 };

// Theme D "Chalk Talk" renders flags as hexagons instead of circles.
const HEXAGON_CLIP = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

interface FlagBadgeProps {
  /**
   * ISO 3166-1 alpha-2 lowercase, e.g. "us", "br". Subdivisions use
   * "gb-eng", "gb-sct", "gb-wls". A full "http(s)://" URL is also accepted
   * (club badge logos from API-Football) and rendered directly instead of
   * being resolved against the self-hosted /flags/*.svg set.
   */
  code?: string | null;
  size?: FlagBadgeSize;
  /** Country name for screen readers/tooltip. Omit when adjacent text already names the country. */
  label?: string;
  className?: string;
  /** Defaults to "circle", or "hexagon" automatically under Theme D. Pass explicitly to override. */
  shape?: FlagBadgeShape;
}

const KNOWN_PLACEHOLDERS = new Set(["", "un", "tbd", "xx"]);
const VALID_CODE = /^[a-z]{2}(-[a-z]{2,3})?$/;

export function FlagBadge({ code, size = "md", label, className, shape }: FlagBadgeProps) {
  const [errored, setErrored] = useState(false);
  const { appTheme } = useTheme();
  const px = SIZE_PX[size];
  const resolvedShape: FlagBadgeShape = shape ?? (appTheme === "d" ? "hexagon" : "circle");

  const trimmed = (code ?? "").trim();
  const isUrl = /^https?:\/\//i.test(trimmed);
  const normalized = trimmed.toLowerCase();
  const isPlaceholder =
    !isUrl && (!normalized || KNOWN_PLACEHOLDERS.has(normalized) || !VALID_CODE.test(normalized));
  const showImage = !isPlaceholder && !errored;
  const imgSrc = isUrl ? trimmed : `/flags/${normalized}.svg`;

  const a11y = label
    ? { role: "img" as const, "aria-label": `${label} flag` }
    : { "aria-hidden": true as const };

  return (
    <span
      {...a11y}
      title={label}
      data-flag-code={normalized || undefined}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-white/[0.04]",
        resolvedShape === "circle" && "rounded-full",
        className,
      )}
      style={{
        width: px,
        height: px,
        border: "1.5px solid var(--br)",
        clipPath: resolvedShape === "hexagon" ? HEXAGON_CLIP : undefined,
      }}
    >
      {showImage ? (
        <img
          src={imgSrc}
          alt=""
          width={px}
          height={px}
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setErrored(true)}
          className="h-full w-full object-cover select-none"
        />
      ) : (
        <span
          className="font-bold uppercase select-none"
          style={{ fontSize: Math.max(8, Math.round(px * 0.32)), color: "rgba(255,255,255,0.5)" }}
        >
          {(isUrl ? (label ?? "") : normalized).replace(/[^a-z0-9]/gi, "").slice(0, 2).toUpperCase()}
        </span>
      )}
    </span>
  );
}
