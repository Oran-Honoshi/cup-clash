// Shared identifiers for the Home nudge coordinator (components/nudges/nudge-coordinator.tsx).
// Add a new id here (and a matching entry in lib/nudges/registry.ts) to register a 5th nudge —
// no other nudge's code needs to change.
export type NudgeId = "reengagement" | "house-group" | "oracle-duel" | "pick-follows";
