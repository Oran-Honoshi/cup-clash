// Pure eligibility check, extracted so the nudge coordinator can call it once
// per session alongside the other three nudges' checks. Returns `true` (not a
// data payload) since the sheet itself needs nothing beyond "show or don't".
export async function checkPickFollows(): Promise<true | null> {
  const res = await fetch("/api/pick-follows/check", { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json() as { eligible: boolean };
  return data.eligible ? true : null;
}
