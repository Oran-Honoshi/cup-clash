import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envText = fs.readFileSync("/workspaces/cup-clash/.env.local", "utf8");
const env = Object.fromEntries(
  envText.split("\n").filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const PL_COMPETITION_ID = "77631785-5cbe-4112-8682-885f4aaae455";

async function main() {
  // ── Users ──────────────────────────────────────────────
  const { data: wcAuth, error: wcErr } = await sb.auth.admin.createUser({
    email: "e2e-wc-test@cupclash.test", password: "TestPass123!e2e", email_confirm: true,
  });
  if (wcErr) throw wcErr;
  const { data: plAuth, error: plErr } = await sb.auth.admin.createUser({
    email: "e2e-pl-test@cupclash.test", password: "TestPass123!e2e", email_confirm: true,
  });
  if (plErr) throw plErr;

  const wcUserId = wcAuth.user.id;
  const plUserId = plAuth.user.id;

  await sb.from("profiles").upsert([
    { id: wcUserId, name: "E2E WC Test", notification_preferences: {} },
    { id: plUserId, name: "E2E PL Test", notification_preferences: {} },
  ]);

  // ── Throwaway groups ───────────────────────────────────
  const { data: wcGroup, error: wcGroupErr } = await sb.from("groups").insert({
    name: "E2E WC Test Group", admin_id: wcUserId, buy_in_amount: 0,
    payout_first: 0, payout_second: 0, passkey: "E2EWC01",
    group_type: "tournament", rules_mode: "customizable", is_public: false,
    competition_id: null,
  }).select("id").single();
  if (wcGroupErr) throw wcGroupErr;

  const { data: plGroup, error: plGroupErr } = await sb.from("groups").insert({
    name: "E2E PL Test Group", admin_id: plUserId, buy_in_amount: 0,
    payout_first: 0, payout_second: 0, passkey: "E2EPL01",
    group_type: "tournament", rules_mode: "customizable", is_public: false,
    competition_id: PL_COMPETITION_ID,
  }).select("id").single();
  if (plGroupErr) throw plGroupErr;

  const { error: membersErr } = await sb.from("group_members").insert([
    { group_id: wcGroup.id, user_id: wcUserId, can_predict: true, role: "admin" },
    { group_id: plGroup.id, user_id: plUserId, can_predict: true, role: "admin" },
  ]);
  if (membersErr) throw membersErr;

  await sb.from("scoring_rules").upsert([
    { group_id: wcGroup.id, enable_winner: true, enable_scorer: true, enable_assister: true, tournament_lock_at: new Date(Date.now() + 48 * 3600_000).toISOString() },
    { group_id: plGroup.id, enable_winner: true, enable_scorer: true, enable_assister: true, tournament_lock_at: new Date(Date.now() + 48 * 3600_000).toISOString() },
  ], { onConflict: "group_id" });

  // ── Throwaway matches (fake ids, won't collide with real API-Football ids) ──
  const now = Date.now();
  const wcMatch1h = { id: "e2e-test-wc-match-1h", home: "E2E Test A", away: "E2E Test B", kickoff_at: new Date(now + 60 * 60_000).toISOString(), stage: "Group", status: "upcoming", competition_id: null };
  const plMatch24h = { id: "e2e-test-pl-match-24h", home: "E2E Club X", away: "E2E Club Y", kickoff_at: new Date(now + 24 * 3600_000).toISOString(), stage: "League", status: "upcoming", competition_id: PL_COMPETITION_ID };
  const { error: matchErr } = await sb.from("matches").insert([wcMatch1h, plMatch24h]);
  if (matchErr) throw matchErr;

  console.log(JSON.stringify({ wcUserId, plUserId, wcGroupId: wcGroup.id, plGroupId: plGroup.id, wcMatchId: wcMatch1h.id, plMatchId: plMatch24h.id }, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
