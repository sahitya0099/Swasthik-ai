// Pure analysis logic for the /api/analyze endpoint.
// Now async — fetches ingredient data from Supabase and saves results to analysis_history.

import { INGREDIENT_DB, type IngredientInfo, type IngredientCategory } from "./ingredients-data";
import { getSupabase, type IngredientRow, type AnalysisHistoryRow } from "./supabase";

export interface AnalyzeDetail {
  ingredient: string;
  category: IngredientCategory | "unknown";
  effect: string;
}

export interface AnalyzeResponse {
  score: number;
  verdict: "Good" | "Moderate" | "Poor";
  risks: string[];
  details: AnalyzeDetail[];
}

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

export function parseIngredients(input: string): string[] {
  return input
    .split(/[,;\n]/)
    .map(normalize)
    .filter(Boolean);
}

// ── Supabase helpers ──────────────────────────────────────────────────

/** Fetch all ingredients from the Supabase `ingredients` table. */
async function fetchIngredientsFromDB(): Promise<IngredientInfo[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("ingredients")
    .select("*");

  if (error) {
    console.error("Supabase fetch failed, falling back to in-memory DB:", error.message);
    return INGREDIENT_DB;
  }

  if (!data || data.length === 0) {
    console.warn("No ingredients in Supabase table, falling back to in-memory DB.");
    return INGREDIENT_DB;
  }

  // Map Supabase rows to IngredientInfo shape
  return (data as IngredientRow[]).map((row) => ({
    name: row.name,
    category: row.category,
    healthEffect: row.health_effect,
    riskLevel: row.risk_level,
    riskFlag: row.risk_flag ?? undefined,
    aliases: row.aliases ?? undefined,
  }));
}

/** Save an analysis result to the `analysis_history` table. */
async function saveToHistory(inputText: string, score: number, verdict: string): Promise<void> {
  try {
    const supabase = getSupabase();
    const row: AnalysisHistoryRow = {
      input_text: inputText,
      score,
      verdict,
    };
    const { error } = await supabase.from("analysis_history").insert(row);
    if (error) {
      console.error("Failed to save analysis history:", error.message);
    }
  } catch (err) {
    console.error("Error saving analysis history:", err);
  }
}

// ── Scoring logic ─────────────────────────────────────────────────────

function findIngredient(token: string, db: IngredientInfo[]): IngredientInfo | undefined {
  // Prefer the longest matching key so "high fructose corn syrup" wins over "sugar".
  let best: IngredientInfo | undefined;
  let bestLen = 0;
  for (const item of db) {
    const keys = [item.name, ...(item.aliases ?? [])];
    for (const key of keys) {
      if (token.includes(key) && key.length > bestLen) {
        best = item;
        bestLen = key.length;
      }
    }
  }
  return best;
}

/**
 * Main analysis function — now async.
 * 1. Fetches ingredients from Supabase (falls back to in-memory).
 * 2. Scores the input using harmful -20 / moderate -10 / good +5.
 * 3. Saves the result to analysis_history.
 */
export async function analyze(rawInput: string): Promise<AnalyzeResponse> {
  const tokens = parseIngredients(rawInput);

  // Fetch ingredient database from Supabase
  const ingredientDB = await fetchIngredientsFromDB();

  let score = 100;
  let penaltyCount = 0;
  const risks: string[] = [];
  const seenRisks = new Set<string>();
  const details: AnalyzeDetail[] = [];

  for (const token of tokens) {
    const match = findIngredient(token, ingredientDB);
    
    if (!match) {
      details.push({
        ingredient: token,
        category: "unknown",
        effect: "No specific information available in our AI database.",
      });
      continue;
    }

    // AI Scoring Logic
    let itemPenalty = 0;
    if (match.category === "harmful") {
      // Advanced penalties based on specific harmful categories
      if (token.includes("palm") || token.includes("hydrogenated")) {
        itemPenalty = 20; // High penalty for bad oils/fats
      } else if (token.includes("sugar") || token.includes("syrup")) {
        itemPenalty = 15; // Significant penalty for hidden sugars
      } else {
        itemPenalty = 10; // Standard harmful penalty
      }
    } else if (match.category === "moderate") {
      itemPenalty = 5;
    } else if (match.category === "good") {
      score += 2; // Small bonus for truly clean ingredients
    }

    score -= itemPenalty;
    if (itemPenalty > 0) penaltyCount++;

    // Track unique risks
    if (match.riskFlag && !seenRisks.has(match.riskFlag)) {
      if (match.category === "harmful" || match.riskLevel === "high") {
        risks.push(match.riskFlag);
        seenRisks.add(match.riskFlag);
      }
    }

    details.push({
      ingredient: match.name,
      category: match.category,
      effect: match.healthEffect,
    });
  }

  // Adjust score based on total number of problematic items (AI Confidence Factor)
  if (penaltyCount > 3) score -= 10; // Extra penalty for highly processed items
  
  score = Math.max(0, Math.min(100, score));
  
  // Refined AI Verdicts
  const verdict: AnalyzeResponse["verdict"] =
    score >= 80 ? "Good" : score >= 50 ? "Moderate" : "Poor";

  // Save to Supabase analysis_history
  saveToHistory(rawInput, score, verdict).catch(() => {});

  return { score, verdict, risks, details };
}
