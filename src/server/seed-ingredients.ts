// One-shot seed script: populates the Supabase `ingredients` table with
// all entries from ingredients-data.ts.
//
// Usage:  npx tsx src/server/seed-ingredients.ts
//
// Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.

import { createClient } from "@supabase/supabase-js";
import { INGREDIENT_DB } from "./ingredients-data";
import * as fs from "fs";
import * as path from "path";

// Load .env manually since we're running outside Vite
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    console.error("No .env file found at", envPath);
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    process.env[key] = val;
  }
}

loadEnv();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

async function seed() {
  console.log(`Seeding ${INGREDIENT_DB.length} ingredients into Supabase…`);

  const rows = INGREDIENT_DB.map((item) => ({
    name: item.name,
    category: item.category,
    health_effect: item.healthEffect,
    risk_level: item.riskLevel,
    aliases: item.aliases ?? [],
    risk_flag: item.riskFlag ?? null,
  }));

  // Upsert so re-running the script is safe
  const { data, error } = await supabase
    .from("ingredients")
    .upsert(rows, { onConflict: "name" })
    .select();

  if (error) {
    console.error("Seed failed:", error.message);
    console.error("Details:", error);
    process.exit(1);
  }

  console.log(`✓ Seeded ${data?.length ?? 0} ingredients successfully.`);
}

seed();
