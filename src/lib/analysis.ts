// Lightweight client-side ingredient heuristic. Mimics an AI verdict for the demo.
export type Verdict = "Good" | "Moderate" | "Poor";

export type RiskFlag = {
  label: string;
  severity: "low" | "medium" | "high";
  detail: string;
};

export type IngredientInsight = {
  name: string;
  status: "safe" | "caution" | "avoid";
  note: string;
};

export type AnalysisResult = {
  score: number;
  verdict: Verdict;
  summary: string;
  risks: RiskFlag[];
  ingredients: IngredientInsight[];
  recommendations: string[];
};

const HARMFUL = [
  { key: "high fructose corn syrup", note: "Highly processed sweetener linked to metabolic issues.", penalty: 22, severity: "high" as const, flag: "High Sugar" },
  { key: "corn syrup", note: "Concentrated sugar source.", penalty: 14, severity: "medium" as const, flag: "Added Sugar" },
  { key: "sugar", note: "Adds empty calories.", penalty: 8, severity: "medium" as const, flag: "Added Sugar" },
  { key: "palm oil", note: "Saturated fat, may raise LDL cholesterol.", penalty: 10, severity: "medium" as const, flag: "Saturated Fat" },
  { key: "trans fat", note: "Strongly linked to heart disease.", penalty: 25, severity: "high" as const, flag: "Trans Fats" },
  { key: "hydrogenated", note: "Likely contains trans fats.", penalty: 20, severity: "high" as const, flag: "Hydrogenated Oils" },
  { key: "msg", note: "Flavor enhancer; may trigger sensitivity.", penalty: 10, severity: "medium" as const, flag: "MSG" },
  { key: "monosodium glutamate", note: "Flavor enhancer; may trigger sensitivity.", penalty: 10, severity: "medium" as const, flag: "MSG" },
  { key: "sodium nitrite", note: "Preservative linked to cancer risk.", penalty: 18, severity: "high" as const, flag: "Preservatives" },
  { key: "aspartame", note: "Artificial sweetener, controversial.", penalty: 12, severity: "medium" as const, flag: "Artificial Sweetener" },
  { key: "artificial color", note: "Synthetic dye with limited nutritional benefit.", penalty: 10, severity: "medium" as const, flag: "Artificial Colors" },
  { key: "artificial flavor", note: "Lab-made flavoring agent.", penalty: 6, severity: "low" as const, flag: "Artificial Flavors" },
  { key: "preservative", note: "Extends shelf life, may include questionable additives.", penalty: 6, severity: "low" as const, flag: "Preservatives" },
  { key: "sodium", note: "High sodium contributes to blood pressure issues.", penalty: 6, severity: "low" as const, flag: "Sodium" },
  { key: "salt", note: "Excess salt raises blood pressure.", penalty: 5, severity: "low" as const, flag: "Sodium" },
  { key: "wheat", note: "Common allergen — gluten.", penalty: 4, severity: "low" as const, flag: "Allergen: Gluten" },
  { key: "gluten", note: "Allergen for celiac/sensitive individuals.", penalty: 4, severity: "low" as const, flag: "Allergen: Gluten" },
  { key: "milk", note: "Common allergen — dairy.", penalty: 3, severity: "low" as const, flag: "Allergen: Dairy" },
  { key: "soy", note: "Common allergen — soy.", penalty: 3, severity: "low" as const, flag: "Allergen: Soy" },
  { key: "peanut", note: "Severe allergen for some.", penalty: 4, severity: "medium" as const, flag: "Allergen: Peanut" },
];

const HEALTHY = [
  { key: "oats", note: "Whole grain, high in fiber." },
  { key: "almond", note: "Healthy fats and protein." },
  { key: "olive oil", note: "Heart-healthy monounsaturated fat." },
  { key: "honey", note: "Natural sweetener — still use in moderation." },
  { key: "quinoa", note: "Complete plant protein." },
  { key: "spinach", note: "Rich in vitamins & minerals." },
  { key: "turmeric", note: "Anti-inflammatory spice." },
  { key: "ginger", note: "Digestive benefits." },
  { key: "yogurt", note: "Probiotic, good for gut health." },
  { key: "tomato", note: "Lycopene-rich antioxidant." },
];

export function analyzeIngredients(input: string): AnalysisResult {
  const text = input.toLowerCase();
  const tokens = text
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  let score = 92;
  const risks: RiskFlag[] = [];
  const seenFlags = new Set<string>();
  const ingredients: IngredientInsight[] = [];

  for (const token of tokens) {
    const harm = HARMFUL.find((h) => token.includes(h.key));
    const good = HEALTHY.find((h) => token.includes(h.key));
    if (harm) {
      score -= harm.penalty;
      ingredients.push({
        name: capitalize(token),
        status: harm.severity === "high" ? "avoid" : "caution",
        note: harm.note,
      });
      if (!seenFlags.has(harm.flag)) {
        seenFlags.add(harm.flag);
        risks.push({ label: harm.flag, severity: harm.severity, detail: harm.note });
      }
    } else if (good) {
      score += 2;
      ingredients.push({ name: capitalize(token), status: "safe", note: good.note });
    } else {
      ingredients.push({ name: capitalize(token), status: "safe", note: "No known concerns detected." });
    }
  }

  score = Math.max(5, Math.min(100, Math.round(score)));
  const verdict: Verdict = score >= 75 ? "Good" : score >= 45 ? "Moderate" : "Poor";

  const summary =
    verdict === "Good"
      ? "This product looks like a wholesome choice with minimal concerns."
      : verdict === "Moderate"
      ? "A mixed bag — some ingredients are fine, but watch the flagged items."
      : "Multiple concerning ingredients detected. Consider a healthier alternative.";

  const recommendations = buildRecs(verdict, risks);

  return { score, verdict, summary, risks, ingredients, recommendations };
}

function buildRecs(verdict: Verdict, risks: RiskFlag[]): string[] {
  const recs: string[] = [];
  if (risks.find((r) => r.label.includes("Sugar"))) recs.push("Look for products with <5g added sugar per serving.");
  if (risks.find((r) => r.label.includes("Sodium"))) recs.push("Choose low-sodium variants (less than 140mg per serving).");
  if (risks.find((r) => r.label.includes("Trans") || r.label.includes("Hydrogenated"))) recs.push("Avoid hydrogenated oils — try products with olive or avocado oil.");
  if (risks.find((r) => r.label.includes("Artificial"))) recs.push("Prefer items labeled 'no artificial colors or flavors'.");
  if (risks.find((r) => r.label.includes("Allergen"))) recs.push("Check the allergen warning if you're sensitive.");
  if (verdict === "Good" && recs.length === 0) recs.push("Great pick — keep prioritizing whole, minimally processed foods.");
  if (recs.length === 0) recs.push("Aim for products with short, recognizable ingredient lists.");
  return recs;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const STORAGE_KEY = "swasthik:history";

export type HistoryItem = {
  id: string;
  name: string;
  input: string;
  result: AnalysisResult;
  createdAt: number;
};

export function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveHistory(item: HistoryItem) {
  if (typeof window === "undefined") return;
  const list = loadHistory();
  list.unshift(item);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

const PROFILE_KEY = "swasthik:profile";

export type Profile = {
  name: string;
  email: string;
  goal: string;
  allergens: string;
  title: string;
};

export const DEFAULT_PROFILE: Profile = {
  name: "Jane Smith",
  email: "jane@example.com",
  goal: "Reduce sugar intake",
  allergens: "Peanuts, Shellfish",
  title: "Health Explorer",
};

export function loadProfile(): Profile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: Profile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
