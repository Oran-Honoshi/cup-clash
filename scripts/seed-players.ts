import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually (no dotenv dependency needed)
const envPath = resolve(process.cwd(), ".env.local");
const envLines = readFileSync(envPath, "utf-8").split("\n");
for (const line of envLines) {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE env vars");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

interface Player {
  full_name: string;
  country:   string;
  position:  string;
  club:      string;
}

const players: Player[] = JSON.parse(
  readFileSync(resolve(process.cwd(), "data/players-2026.json"), "utf-8")
);

async function main() {
  const { error, data } = await sb
    .from("players")
    .insert(players)
    .select("id");

  if (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }

  console.log(`✓ Inserted ${(data ?? []).length} players`);
}

main();
