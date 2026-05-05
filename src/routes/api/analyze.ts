import { createFileRoute } from "@tanstack/react-router";
import { analyze } from "@/server/analyze-logic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

export const Route = createFileRoute("/api/analyze")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),

      POST: async ({ request }) => {
        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return json({ error: "Invalid JSON body." }, 400);
        }

        if (!payload || typeof payload !== "object") {
          return json({ error: "Request body must be a JSON object." }, 400);
        }

        const { ingredients } = payload as { ingredients?: unknown };

        if (typeof ingredients !== "string") {
          return json({ error: "'ingredients' must be a string." }, 400);
        }
        if (!ingredients.trim()) {
          return json({ error: "'ingredients' cannot be empty." }, 400);
        }
        if (ingredients.length > 5000) {
          return json({ error: "'ingredients' is too long (max 5000 chars)." }, 400);
        }

        try {
          // analyze() is now async — fetches from Supabase and saves history
          const result = await analyze(ingredients);
          return json(result, 200);
        } catch (err) {
          console.error("/api/analyze failed:", err);
          return json({ error: "Failed to analyze ingredients." }, 500);
        }
      },
    },
  },
});
