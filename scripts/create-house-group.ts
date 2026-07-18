/**
 * Auto-creates a public, house-rules prediction group for a real,
 * already-ingested competition (Premier League, La Liga, ...) — the
 * "system-owned" group pattern: a real service-account user (created here
 * if it doesn't exist) is the technical admin_id, since groups.admin_id is
 * NOT NULL and FK'd to a real profiles/auth.users row (no adminless-group
 * schema support exists). The group itself is idempotent per competition,
 * backstopped by the migration-061 partial unique index
 * (groups_house_public_per_competition_key) — this script checks-then-inserts
 * and treats a unique-violation on insert as "already exists," so running
 * it twice for the same competition never duplicates.
 *
 * Usage: npx tsx scripts/create-house-group.ts "Premier League"
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve(process.cwd(), ".env.local");
try {
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim();
    if (key && !process.env[key]) process.env[key] = val;
  }
} catch { /* .env.local may not exist in CI */ }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

const SERVICE_ACCOUNT_EMAIL = "house@cupclash.internal";
const SERVICE_ACCOUNT_NAME  = "CupClash";
const LOCK_BEFORE_MS = 5 * 60 * 1000;

async function getOrCreateServiceAccount(): Promise<string> {
  // listUsers doesn't support filter-by-email server-side in the JS SDK —
  // page through (there are only a handful of users in this project).
  let page = 1;
  for (;;) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find(u => u.email === SERVICE_ACCOUNT_EMAIL);
    if (found) {
      console.log(`✓ Service account exists: ${found.id}`);
      return found.id;
    }
    if (data.users.length < 200) break;
    page++;
  }

  const { data: created, error: createErr } = await sb.auth.admin.createUser({
    email: SERVICE_ACCOUNT_EMAIL,
    email_confirm: true,
    password: crypto.randomUUID() + crypto.randomUUID(), // never used to sign in
    user_metadata: { name: SERVICE_ACCOUNT_NAME },
  });
  if (createErr || !created.user) throw createErr ?? new Error("createUser returned no user");
  console.log(`✓ Created service account: ${created.user.id}`);
  return created.user.id;
}

async function main() {
  const competitionName = process.argv[2];
  if (!competitionName) {
    console.error("Usage: npx tsx scripts/create-house-group.ts \"<Competition Name>\"");
    process.exit(1);
  }

  const { data: competition, error: compErr } = await sb
    .from("competitions").select("id, name").eq("name", competitionName).maybeSingle();
  if (compErr) throw compErr;
  if (!competition) throw new Error(`No competitions row named "${competitionName}"`);
  console.log(`✓ Competition: ${competition.name} (${competition.id})`);

  const { data: firstMatch, error: matchErr } = await sb
    .from("matches").select("kickoff_at")
    .eq("competition_id", competition.id)
    .order("kickoff_at", { ascending: true })
    .limit(1).maybeSingle();
  if (matchErr) throw matchErr;
  if (!firstMatch) throw new Error(`No matches ingested yet for "${competitionName}" — refusing to create a group with nothing to predict on`);
  const tournamentLockAt = new Date(new Date(firstMatch.kickoff_at).getTime() - LOCK_BEFORE_MS).toISOString();
  console.log(`✓ First match kickoff: ${firstMatch.kickoff_at} → tournament_lock_at: ${tournamentLockAt}`);

  // Idempotency: the migration-061 partial unique index is the hard
  // backstop, but check first so a normal re-run is a clean no-op/reuse
  // instead of relying on catching a constraint-violation error every time.
  const { data: existingGroup, error: existingErr } = await sb
    .from("groups")
    .select("id, name")
    .eq("competition_id", competition.id)
    .eq("rules_mode", "house_rules")
    .eq("is_public", true)
    .maybeSingle();
  if (existingErr) throw existingErr;

  let groupId: string;
  if (existingGroup) {
    console.log(`✓ House group already exists: "${existingGroup.name}" (${existingGroup.id}) — reusing, no duplicate created`);
    groupId = existingGroup.id;
  } else {
    const adminId = await getOrCreateServiceAccount();

    const { data: inserted, error: insertErr } = await sb
      .from("groups")
      .insert({
        name:                 competition.name,
        admin_id:             adminId,
        buy_in_amount:        0,
        payout_first:         0,
        payout_second:        0,
        payout_third:         0,
        max_members:          100000,
        max_group_capacity:   100000,
        is_public:            true,
        group_type:           "tournament",
        competition_id:       competition.id,
        enrollment_fee_cents: 0,
        rules_mode:           "house_rules",
        is_corporate_paid:    false,
        currency:             "USD",
        currency_symbol:      "$",
        enable_group_stage_prize: false,
        show_prize_split:         false,
        show_entry_fee:           false,
        show_prize_pot:           false,
        show_buy_in_tracker:      false,
        show_payment_link:        false,
      })
      .select("id")
      .single();

    if (insertErr) {
      // Unique-violation on the migration-061 partial index = a concurrent
      // run already created it — fetch and reuse instead of failing.
      if (insertErr.code === "23505") {
        const { data: raceGroup, error: raceErr } = await sb
          .from("groups").select("id, name")
          .eq("competition_id", competition.id).eq("rules_mode", "house_rules").eq("is_public", true)
          .single();
        if (raceErr || !raceGroup) throw raceErr ?? new Error("Unique violation but no group found");
        console.log(`✓ House group created concurrently: "${raceGroup.name}" (${raceGroup.id}) — reusing`);
        groupId = raceGroup.id;
      } else {
        throw insertErr;
      }
    } else {
      groupId = inserted.id;
      console.log(`✓ Created group: "${competition.name}" (${groupId})`);

      await sb.from("group_members").upsert({
        group_id:       groupId,
        user_id:        adminId,
        payment_status: "free",
        can_predict:    true,
        joined_at:      new Date().toISOString(),
      }, { onConflict: "user_id,group_id" });
    }
  }

  // Fixed scoring rules for this competition (per spec — not the general
  // House Rules default): 10/25 outcome/exact graded on regular_90, 300pt
  // Tournament Winner, 100pt Top Scorer / Top Assister, everything else
  // (KO advancement, best 3rd, awards that don't apply to a league season)
  // disabled. Always re-applied so the numbers stay correct even if this
  // script is re-run after the group already existed.
  const { error: rulesErr } = await sb.from("scoring_rules").upsert({
    group_id:              groupId,
    correct_outcome:       10,
    exact_score:           25,
    tournament_winner:     300,
    top_scorer:            100,
    top_assister:          100,
    ko_advancement:        0,
    second_place:          0,
    third_place:           0,
    best_third:            0,
    best_defence:          0,
    best_young_player:     0,
    golden_ball:           0,
    enable_outcome:        true,
    enable_exact:          true,
    enable_ko_advancement: false,
    enable_winner:         true,
    enable_scorer:         true,
    enable_assister:       true,
    enable_second:         false,
    enable_third:          false,
    enable_best_third:     false,
    enable_best_defence:   false,
    enable_best_young_player: false,
    enable_golden_ball:    false,
    knockout_policy:       "regular_90",
    use_progressive_scoring: false,
    tournament_lock_at:    tournamentLockAt,
  }, { onConflict: "group_id" });
  if (rulesErr) throw rulesErr;
  console.log("✓ Scoring rules applied");

  console.log(`\nDone. Group id: ${groupId}`);
}

main().catch(err => {
  console.error("✗ FATAL:", err);
  process.exit(1);
});
