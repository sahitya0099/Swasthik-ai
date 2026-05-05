// Knowledge base of common food ingredients used by the SWASTHIK analyzer.
// Each entry includes category, a short health effect explanation, risk level
// and an optional human-friendly risk flag surfaced in the API response.

export type IngredientCategory = "good" | "moderate" | "harmful";
export type RiskLevel = "low" | "medium" | "high";

export interface IngredientInfo {
  name: string;
  category: IngredientCategory;
  healthEffect: string;
  riskLevel: RiskLevel;
  riskFlag?: string;
  aliases?: string[];
}

export const INGREDIENT_DB: IngredientInfo[] = [
  // Harmful
  { name: "sugar", category: "harmful", healthEffect: "Can increase risk of diabetes, obesity and tooth decay.", riskLevel: "high", riskFlag: "High sugar" },
  { name: "high fructose corn syrup", category: "harmful", healthEffect: "Highly processed sweetener strongly linked to metabolic disease.", riskLevel: "high", riskFlag: "High fructose corn syrup", aliases: ["hfcs", "corn syrup"] },
  { name: "palm oil", category: "harmful", healthEffect: "High in saturated fat, may raise LDL cholesterol.", riskLevel: "high", riskFlag: "Contains palm oil" },
  { name: "trans fat", category: "harmful", healthEffect: "Strongly linked to heart disease and inflammation.", riskLevel: "high", riskFlag: "Contains trans fats", aliases: ["trans fats", "partially hydrogenated oil", "hydrogenated oil", "hydrogenated"] },
  { name: "monosodium glutamate", category: "harmful", healthEffect: "Flavor enhancer that may trigger sensitivity in some people.", riskLevel: "medium", riskFlag: "Contains MSG", aliases: ["msg"] },
  { name: "sodium nitrite", category: "harmful", healthEffect: "Preservative associated with increased cancer risk.", riskLevel: "high", riskFlag: "Contains sodium nitrite", aliases: ["sodium nitrate"] },
  { name: "aspartame", category: "harmful", healthEffect: "Artificial sweetener with controversial long-term effects.", riskLevel: "medium", riskFlag: "Artificial sweetener (aspartame)" },
  { name: "artificial color", category: "harmful", healthEffect: "Synthetic dyes provide no nutrition and may affect behavior in children.", riskLevel: "medium", riskFlag: "Artificial colors", aliases: ["artificial colour", "artificial colors", "artificial colours"] },

  // Moderate
  { name: "salt", category: "moderate", healthEffect: "Excess sodium raises blood pressure.", riskLevel: "medium", riskFlag: "High sodium", aliases: ["sodium"] },
  { name: "wheat flour", category: "moderate", healthEffect: "Refined grain — limited fiber and nutrients compared to whole grain.", riskLevel: "medium", aliases: ["refined flour", "maida", "all purpose flour"] },
  { name: "vegetable oil", category: "moderate", healthEffect: "Often refined; quality depends on the source oil.", riskLevel: "medium" },
  { name: "artificial flavor", category: "moderate", healthEffect: "Lab-made flavoring with no nutritional value.", riskLevel: "low", riskFlag: "Artificial flavors", aliases: ["artificial flavour", "artificial flavors", "artificial flavours"] },
  { name: "preservative", category: "moderate", healthEffect: "Extends shelf life; some preservatives are questionable.", riskLevel: "low", riskFlag: "Contains preservatives", aliases: ["preservatives"] },
  { name: "milk solids", category: "moderate", healthEffect: "Dairy-based; common allergen for some.", riskLevel: "low" },
  { name: "soy lecithin", category: "moderate", healthEffect: "Common emulsifier, generally safe in small amounts.", riskLevel: "low" },

  // Good
  { name: "oats", category: "good", healthEffect: "Whole grain rich in soluble fiber that supports heart health.", riskLevel: "low" },
  { name: "almond", category: "good", healthEffect: "Source of healthy fats, protein and vitamin E.", riskLevel: "low", aliases: ["almonds"] },
  { name: "olive oil", category: "good", healthEffect: "Heart-healthy monounsaturated fat with antioxidants.", riskLevel: "low" },
  { name: "honey", category: "good", healthEffect: "Natural sweetener with trace antioxidants — still use moderately.", riskLevel: "low" },
  { name: "quinoa", category: "good", healthEffect: "Complete plant protein with all essential amino acids.", riskLevel: "low" },
  { name: "spinach", category: "good", healthEffect: "Rich in iron, folate and antioxidants.", riskLevel: "low" },
  { name: "turmeric", category: "good", healthEffect: "Contains curcumin, a natural anti-inflammatory compound.", riskLevel: "low" },
  { name: "ginger", category: "good", healthEffect: "Supports digestion and has anti-inflammatory benefits.", riskLevel: "low" },
  { name: "yogurt", category: "good", healthEffect: "Probiotic food that supports gut health.", riskLevel: "low" },
  { name: "tomato", category: "good", healthEffect: "Rich in lycopene, an antioxidant linked to heart health.", riskLevel: "low", aliases: ["tomatoes"] },
  { name: "carbonated water", category: "good", healthEffect: "Sparkling water; a better alternative to sugary sodas.", riskLevel: "low", aliases: ["sparkling water", "soda water"] },

  // New Additions for Beverages & Snacks
  { name: "phosphoric acid", category: "harmful", healthEffect: "Can erode tooth enamel and may affect bone density over time.", riskLevel: "high", riskFlag: "Contains phosphoric acid" },
  { name: "caramel color", category: "harmful", healthEffect: "Certain types (E150d) are linked to potential carcinogens like 4-MEI.", riskLevel: "medium", riskFlag: "Caramel color (E150d)", aliases: ["caramel colour", "e150d"] },
  { name: "caffeine", category: "moderate", healthEffect: "A stimulant that can cause jitters, sleep issues, or heart rate changes in excess.", riskLevel: "medium", riskFlag: "Contains caffeine" },
  { name: "natural flavor", category: "moderate", healthEffect: "Derived from natural sources but still highly processed in labs.", riskLevel: "low", aliases: ["natural flavors", "natural flavouring", "natural flavorings"] },
  { name: "sodium benzoate", category: "harmful", healthEffect: "A common preservative that may cause hyperactivity in some children.", riskLevel: "medium", riskFlag: "Sodium benzoate" },

  // Nutritional Headers & Macros (to avoid 'unknown' flags)
  { name: "protein", category: "good", healthEffect: "Essential for muscle repair and growth.", riskLevel: "low" },
  { name: "fat", category: "moderate", healthEffect: "Source of energy; quality matters (prefer unsaturated).", riskLevel: "low" },
  { name: "energy", category: "moderate", healthEffect: "Total calorie content of the product.", riskLevel: "low", aliases: ["calories", "kcal"] },
  { name: "carbohydrates", category: "moderate", healthEffect: "Primary energy source; prefer complex carbs.", riskLevel: "low", aliases: ["carbs"] },
];
