"use client";

import { useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

// Flag SVGs are self-hosted in /public/flags/ — see PRODUCT.md privacy
// principle and DESIGN.md "Don't ship third-party flag CDN calls". The set
// shipped in this repo is country-flag-icons (MIT, 3x2 aspect, ~180KB total),
// served as individual static files so the browser caches each independently.

type FlagSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZES: Record<FlagSize, { w: number; cls: string }> = {
  xs: { w: 20, cls: "w-5" },
  sm: { w: 28, cls: "w-7" },
  md: { w: 40, cls: "w-10" },
  lg: { w: 56, cls: "w-14" },
  xl: { w: 80, cls: "w-20" },
};

interface FlagProps {
  /** ISO 3166-1 alpha-2 lowercase, e.g. "us", "br". Subdivisions use "gb-eng", "gb-sct", "gb-wls". */
  code?: string | null;
  /** Display size — controls width; height derives from the 3:2 aspect ratio. */
  size?: FlagSize;
  /**
   * Country name for screen readers and the hover tooltip. When omitted, the flag is
   * treated as decorative and hidden from assistive tech — appropriate when adjacent
   * text already names the country.
   */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

const KNOWN_PLACEHOLDERS = new Set(["", "un", "tbd", "xx"]);
const VALID_CODE = /^[a-z]{2}(-[a-z]{2,3})?$/;

export function Flag({ code, size = "md", label, className, style }: FlagProps) {
  const [errored, setErrored] = useState(false);
  const { w, cls } = SIZES[size];
  const h = Math.round((w / 3) * 2);

  const normalized = (code ?? "").trim().toLowerCase();
  const isPlaceholder =
    !normalized || KNOWN_PLACEHOLDERS.has(normalized) || !VALID_CODE.test(normalized);
  const showImage = !isPlaceholder && !errored;

  // When a label is supplied we treat the flag as informative; otherwise it's
  // decorative (the country name almost always sits adjacent to the flag in
  // this product) so we keep it out of the screen-reader stream.
  const a11y = label
    ? { role: "img" as const, "aria-label": `${label} flag` }
    : { "aria-hidden": true as const };

  return (
    <span
      {...a11y}
      title={label}
      data-flag-code={normalized || undefined}
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-sm bg-white/[0.04]",
        "ring-[1.5px] ring-inset ring-white/[0.18]",
        "shadow-[0_1px_2px_rgb(0_0_0_/_0.25)]",
        cls,
        className,
      )}
      style={{ aspectRatio: "3 / 2", ...style }}
    >
      {showImage ? (
        <img
          src={`/flags/${normalized}.svg`}
          alt=""
          width={w}
          height={h}
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setErrored(true)}
          className="h-full w-full object-cover select-none"
        />
      ) : (
        <FlagPlaceholder code={normalized} />
      )}
    </span>
  );
}

function FlagPlaceholder({ code }: { code: string }) {
  // Two-letter glyph for unknown / "un" / "tbd" inputs. Keeps the layout slot
  // filled at the same dimensions as a real flag, in the glass-system palette
  // (white at low alpha on the purple-tinted ground) — no broken image, no
  // network fallback. Decorative; the wrapper already handles a11y.
  const initials = code.replace(/[^a-z0-9]/gi, "").slice(0, 2).toUpperCase();

  return (
    <svg
      viewBox="0 0 30 20"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
      className="h-full w-full"
    >
      <rect width="30" height="20" fill="rgba(255,255,255,0.06)" />
      {initials ? (
        <text
          x="15"
          y="13.5"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize="8"
          fontWeight="700"
          fill="rgba(255,255,255,0.55)"
          letterSpacing="0.4"
        >
          {initials}
        </text>
      ) : null}
    </svg>
  );
}
