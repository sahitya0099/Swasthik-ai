/**
 * Antigravity Simulation — Node.js Backend
 * Express server that bridges React frontend and Python physics engine.
 */

import express from "express";
import cors from "cors";

const app = express();
const PORT = 4000;
const PHYSICS_ENGINE_URL = "http://localhost:8000";

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// ─── Health Check ───────────────────────────────────────────────

app.get("/api/health", async (_req, res) => {
  try {
    const pythonHealth = await fetch(`${PHYSICS_ENGINE_URL}/health`);
    const pythonData = await pythonHealth.json();
    res.json({
      status: "ok",
      service: "antigravity-backend",
      physics_engine: pythonData,
    });
  } catch (error) {
    res.json({
      status: "degraded",
      service: "antigravity-backend",
      physics_engine: { status: "unreachable", error: error.message },
    });
  }
});

// ─── Simulate Endpoint ─────────────────────────────────────────

app.post("/api/simulate", async (req, res) => {
  const { objects, antigravity_strength, dt } = req.body;

  // Validate input
  if (!objects || !Array.isArray(objects)) {
    return res.status(400).json({
      error: "Invalid request: 'objects' must be an array",
    });
  }

  if (objects.length === 0) {
    return res.json({ objects: [] });
  }

  try {
    // Forward to Python physics engine
    const response = await fetch(`${PHYSICS_ENGINE_URL}/physics/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        objects,
        antigravity_strength: antigravity_strength ?? 9.8,
        dt: dt ?? 0.016,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Physics engine error (${response.status}):`, errorData);
      return res.status(502).json({
        error: "Physics engine returned an error",
        detail: errorData,
      });
    }

    const result = await response.json();
    return res.json(result);
  } catch (error) {
    console.error("Failed to reach physics engine:", error.message);
    return res.status(503).json({
      error: "Physics engine is unreachable",
      detail: error.message,
    });
  }
});

// ─── Start Server ───────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n[*] Antigravity Backend running on http://localhost:${PORT}`);
  console.log(`   Physics engine expected at ${PHYSICS_ENGINE_URL}\n`);
});
