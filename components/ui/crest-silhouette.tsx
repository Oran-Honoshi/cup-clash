"use client";

import { cn } from "@/lib/utils";

// Club crests are flat, fully-opaque artwork — unlike a player cutout photo,
// a crest's alpha channel only traces its outer boundary (almost every crest
// is some kind of shield/circle), so a plain `filter: brightness(0)` collapses
// every club into the same generic blob. This renders the crest as two masked
// layers instead: a solid accent-color fill clipped to the crest's alpha
// silhouette (the shield/circle outline), screen-blended with a second layer
// masked by the crest's luminance, which "punches through" its bright regions
// (emblems, text, stripes) to reveal the real internal shape.
//
// Flags (self-hosted, full-bleed rectangular SVGs) reuse the same trick: the
// alpha mask is a no-op (flags have no transparency), but the luminance mask
// still traces each flag's light/dark banding, so it obscures true colors
// while keeping a distinguishable shape — same purpose as for crests.
export function CrestSilhouette({ url, className }: { url: string; className?: string }) {
  const maskStyle = (mode: "alpha" | "luminance"): React.CSSProperties => ({
    WebkitMaskImage: `url(${url})`,
    maskImage: `url(${url})`,
    maskMode: mode,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  });

  return (
    <div className={cn("relative overflow-hidden p-1.5", className)} style={{ background: "var(--ip)" }}>
      <div className="absolute inset-0" style={{ backgroundColor: "var(--ac)", ...maskStyle("alpha") }} />
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "var(--ip)", mixBlendMode: "screen", ...maskStyle("luminance") }}
      />
    </div>
  );
}
