import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envText = fs.readFileSync("/workspaces/cup-clash/.env.local", "utf8");
const env = Object.fromEntries(
  envText.split("\n").filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const PL_COMPETITION_ID = "77631785-5cbe-4112-8682-885f4aaae455";
const PASSWORD = "TestPass123!e2e";

async function main() {
  // ── Users ──────────────────────────────────────────────
  const { data: wcAuth, error: wcErr } = await sb.auth.admin.createUser({
    email: "e2e-wc-rem@cupclash.test", password: PASSWORD, email_confirm: true,
  });
  if (wcErr) throw wcErr;
  const { data: plAuth, error: plErr } = await sb.auth.admin.createUser({
    email: "e2e-pl-rem@cupclash.test", password: PASSWORD, email_confirm: true,
  });
  if (plErr) throw plErr;

  const wcUserId = wcAuth.user.id;
  const plUserId = plAuth.user.id;

  await sb.from("profiles").upsert([
    {
      id: wcUserId, name: "E2E WC Reminder",
      notification_preferences: { telegram: { match_reminder: true } },
      telegram_chat_id: "999900001", telegram_language_code: "en",
    },
    {
      id: plUserId, name: "E2E PL Reminder",
      notification_preferences: { telegram: { match_reminder: false } },
      telegram_chat_id: "999900002", telegram_language_code: "en",
    },
  ]);

  // ── Groups: wcUser is in TWO World Cup groups (multi-group suppression case) ──
  const { data: wcGroupA, error: wcGroupAErr } = await sb.from("groups").insert({
    name: "E2E WC Reminder Group A", admin_id: wcUserId, buy_in_amount: 0,
    payout_first: 0, payout_second: 0, passkey: "E2ERA01",
    group_type: "tournament", rules_mode: "customizable", is_public: false,
    competition_id: null,
  }).select("id").single();
  if (wcGroupAErr) throw wcGroupAErr;

  const { data: wcGroupB, error: wcGroupBErr } = await sb.from("groups").insert({
    name: "E2E WC Reminder Group B", admin_id: wcUserId, buy_in_amount: 0,
    payout_first: 0, payout_second: 0, passkey: "E2ERB01",
    group_type: "tournament", rules_mode: "customizable", is_public: false,
    competition_id: null,
  }).select("id").single();
  if (wcGroupBErr) throw wcGroupBErr;

  const { data: plGroup, error: plGroupErr } = await sb.from("groups").insert({
    name: "E2E PL Reminder Group", admin_id: plUserId, buy_in_amount: 0,
    payout_first: 0, payout_second: 0, passkey: "E2ERP01",
    group_type: "tournament", rules_mode: "customizable", is_public: false,
    competition_id: PL_COMPETITION_ID,
  }).select("id").single();
  if (plGroupErr) throw plGroupErr;

  const { error: membersErr } = await sb.from("group_members").insert([
    { group_id: wcGroupA.id, user_id: wcUserId, can_predict: true, role: "admin" },
    { group_id: wcGroupB.id, user_id: wcUserId, can_predict: true, role: "admin" },
    { group_id: plGroup.id,  user_id: plUserId, can_predict: true, role: "admin" },
  ]);
  if (membersErr) throw membersErr;

  // ── Throwaway matches ──
  const now = Date.now();
  const wcMatch1h  = { id: "e2e-rem-wc-match-1h",  home: "E2E Rem A", away: "E2E Rem B", kickoff_at: new Date(now + 60 * 60_000).toISOString(),      stage: "Group",  status: "upcoming", competition_id: null };
  const plMatch24h = { id: "e2e-rem-pl-match-24h", home: "E2E Rem X", away: "E2E Rem Y", kickoff_at: new Date(now + 24 * 3600_000).toISOString(),    stage: "League", status: "upcoming", competition_id: PL_COMPETITION_ID };
  const { error: matchErr } = await sb.from("matches").insert([wcMatch1h, plMatch24h]);
  if (matchErr) throw matchErr;

  // wcUser predicts wcMatch1h in Group A only — NOT Group B. This is the
  // "predicted in A but not B" case: the reminder must still fire (scoped to
  // the still-missing Group B) rather than being suppressed just because the
  // user predicted in *some* group.
  const { error: predErr } = await sb.from("group_predictions").insert({
    user_id: wcUserId, group_id: wcGroupA.id, match_id: wcMatch1h.id,
    home_score: 1, away_score: 0, locked_at: null, points_earned: 0, is_exact: false,
  });
  if (predErr) throw predErr;

  console.log(JSON.stringify({
    wcUserId, plUserId,
    wcGroupAId: wcGroupA.id, wcGroupBId: wcGroupB.id, plGroupId: plGroup.id,
    wcMatchId: wcMatch1h.id, plMatchId: plMatch24h.id,
  }, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
