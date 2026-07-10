// lib/sound.ts
// Short, synthesized UI sound effects via the Web Audio API — no binary
// audio assets. Every export here must only ever be called synchronously
// (or from an async handler chained directly off) a user gesture, since
// that's what satisfies browser autoplay policies.

import { getSoundEnabled } from "@/lib/sound-preference";

let sharedCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedCtx) sharedCtx = new Ctor();
  return sharedCtx;
}

/**
 * Quiet "flip / card settle" cue — a brief pitch-rising whoosh followed by a
 * soft tick, under 300ms total. Played once when a prediction is locked in.
 */
export function playLockInSound(): void {
  if (!getSoundEnabled()) return;

  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  const now = ctx.currentTime;

  // Whoosh: quick upward pitch sweep, soft sine, fast attack/decay
  const whoosh = ctx.createOscillator();
  const whooshGain = ctx.createGain();
  whoosh.type = "sine";
  whoosh.frequency.setValueAtTime(320, now);
  whoosh.frequency.exponentialRampToValueAtTime(760, now + 0.14);
  whooshGain.gain.setValueAtTime(0.0001, now);
  whooshGain.gain.exponentialRampToValueAtTime(0.09, now + 0.03);
  whooshGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  whoosh.connect(whooshGain).connect(ctx.destination);
  whoosh.start(now);
  whoosh.stop(now + 0.18);

  // Settle tick: brief high, quiet click landing just after the whoosh
  const tick = ctx.createOscillator();
  const tickGain = ctx.createGain();
  tick.type = "triangle";
  tick.frequency.setValueAtTime(1200, now + 0.15);
  tickGain.gain.setValueAtTime(0.0001, now + 0.15);
  tickGain.gain.exponentialRampToValueAtTime(0.06, now + 0.16);
  tickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
  tick.connect(tickGain).connect(ctx.destination);
  tick.start(now + 0.15);
  tick.stop(now + 0.26);
}
