import type { NudgeResponse } from "@/app/api/oracle-duels/nudge/route";

export type OracleDuelNudgeResult = Extract<NudgeResponse, { eligible: true }>;

// Pure eligibility check, extracted so the nudge coordinator can call it once
// per session alongside the other three nudges' checks.
export async function checkOracleDuelNudge(): Promise<OracleDuelNudgeResult | null> {
  const res = await fetch("/api/oracle-duels/nudge", { cache: "no-store" });
  if (!res.ok) return null;
  const body = (await res.json()) as NudgeResponse;
  if (!body.eligible) return null;
  return body;
}
