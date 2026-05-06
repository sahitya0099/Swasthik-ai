import { createFileRoute } from "@tanstack/react-router";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/scan")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      
      POST: async ({ request }) => {
        let payload: { image?: string; rawText?: string };
        try {
          payload = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: corsHeaders });
        }

        const { rawText } = payload;
        
        if (!rawText) {
          return new Response(JSON.stringify({ error: "No text provided for denoising." }), { status: 400, headers: corsHeaders });
        }

        // Advanced Semantic Correction Heuristic
        // In a real production app, this is where you'd call a Vision-Language Model (VLM) 
        // like Llama 3.2 Vision or Gemini Flash to reconstruct the ingredients.
        // For this demo, we use an advanced NLP heuristic that acts as a "Denoising Engine".
        
        const cleaned = denoise(rawText);

        return new Response(JSON.stringify({ text: cleaned }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      },
    },
  },
});

/**
 * Advanced NLP Denoising Heuristic
 * This simulates a language model's ability to extract structure from noise.
 */
function denoise(input: string): string {
  const dictionary = [
    "water", "high fructose corn syrup", "corn syrup", "sugar", "salt", "black olives", "feta cheese",
    "lettuce", "tomato", "cherry tomatoes", "cucumber", "red onion", "bell pepper", "olive oil",
    "citric acid", "phosphoric acid", "caramel color", "natural flavors", "caffeine", "potassium sorbate", "sodium benzoate",
    "vinegar", "lemon juice", "garlic", "onions", "pepper", "oregano", "basil", "extract", "yeast",
    "oreo cookie crumbs", "cheesecake", "whipped cream", "chocolate sauce", "filling", "cream", "milk", "wheat", "flour",
    "cocoa", "soy lecithin", "vanilla", "butter", "egg", "syrup", "honey", "starch"
  ];

  const blocks = input.split(/[,;\n\r]/);
  const finalIngredients = new Set<string>();

  for (let block of blocks) {
    // 1. Heavy Cleaning: Keep only letters and spaces
    const clean = block.replace(/[^a-zA-Z ]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
    if (clean.length < 3) continue;

    let confirmedMatch = "";
    
    // 2. Strict Whitelist Check
    for (const item of dictionary) {
      if (clean.includes(item)) {
        confirmedMatch = capitalize(item);
        break; 
      }
    }

    if (confirmedMatch) {
      finalIngredients.add(confirmedMatch);
    } else {
      // 3. Advanced Fragment Filter
      const words = clean.split(" ").filter(w => w.length > 0);
      const isPurelyAlpha = /^[a-z ]+$/.test(clean);
      const letterCount = clean.replace(/\s/g, "").length;
      
      if (isPurelyAlpha && words.length > 0 && letterCount > 4) {
        // Calculate word-length quality
        const shortWords = words.filter(w => w.length <= 2).length;
        const shortWordRatio = shortWords / words.length;
        const avgWordLen = letterCount / words.length;
        
        // If more than 40% of words are tiny (junk), or avg length is poor, discard.
        if (shortWordRatio > 0.4 || avgWordLen < 3.8) {
          continue; 
        }

        const vowels = (clean.match(/[aeiouy]/g) || []).length;
        const vowelRatio = vowels / letterCount;
        const hasRepeatingJunk = /(.)\1\1/.test(clean); 
        
        if (vowelRatio >= 0.25 && vowelRatio <= 0.55 && !hasRepeatingJunk) {
          finalIngredients.add(capitalize(clean));
        }
      }
    }
  }

  // 4. Substring cleanup (e.g. keep "Oreo cookie crumbs" over "Oreo")
  const resultsArray = Array.from(finalIngredients).sort((a, b) => b.length - a.length);
  const deduplicated = new Set<string>();
  
  for (const item of resultsArray) {
    let isSubset = false;
    for (const existing of deduplicated) {
      if (existing.toLowerCase().includes(item.toLowerCase())) {
        isSubset = true;
        break;
      }
    }
    if (!isSubset) deduplicated.add(item);
  }

  return Array.from(deduplicated).join(", ");
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
