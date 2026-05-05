import { useRef, useEffect, useCallback } from "react";
import "./SimulationCanvas.css";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

// Color palette for objects based on mass
const OBJECT_COLORS = [
  { r: 99, g: 102, b: 241 },   // indigo
  { r: 139, g: 92, b: 246 },   // violet
  { r: 6, g: 182, b: 212 },    // cyan
  { r: 16, g: 185, b: 129 },   // emerald
  { r: 245, g: 158, b: 11 },   // amber
  { r: 244, g: 63, b: 94 },    // rose
  { r: 236, g: 72, b: 153 },   // pink
  { r: 34, g: 197, b: 94 },    // green
];

function getColorForObject(index) {
  return OBJECT_COLORS[index % OBJECT_COLORS.length];
}

// Generate a static starfield once
function generateStars(count) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * CANVAS_HEIGHT,
      size: Math.random() * 1.5 + 0.5,
      brightness: Math.random() * 0.6 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
    });
  }
  return stars;
}

const STARS = generateStars(150);

export default function SimulationCanvas({
  objects,
  setObjects,
  isRunning,
  simulateStep,
}) {
  const canvasRef = useRef(null);
  const trailsRef = useRef({}); // Store position trails for each object
  const animFrameRef = useRef(null);
  const objectsRef = useRef(objects);
  const isRunningRef = useRef(isRunning);
  const timeRef = useRef(0);

  // Keep refs in sync
  useEffect(() => {
    objectsRef.current = objects;
  }, [objects]);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  // Update trails
  const updateTrails = useCallback((objs) => {
    const trails = trailsRef.current;
    for (const obj of objs) {
      if (!trails[obj.id]) {
        trails[obj.id] = [];
      }
      trails[obj.id].push({ x: obj.x, y: obj.y });
      if (trails[obj.id].length > 25) {
        trails[obj.id].shift();
      }
    }
    // Clean up trails for removed objects
    const ids = new Set(objs.map((o) => o.id));
    for (const key of Object.keys(trails)) {
      if (!ids.has(key)) delete trails[key];
    }
  }, []);

  // Draw everything
  const draw = useCallback((ctx, time) => {
    const objs = objectsRef.current;

    // Background
    ctx.fillStyle = "#0a0e1a";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Stars with twinkling
    for (const star of STARS) {
      const twinkle = Math.sin(time * star.twinkleSpeed) * 0.3 + 0.7;
      const alpha = star.brightness * twinkle;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 210, 255, ${alpha})`;
      ctx.fill();
    }

    // Grid lines (subtle)
    ctx.strokeStyle = "rgba(99, 102, 241, 0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= CANVAS_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Antigravity field lines (animated upward arrows)
    if (isRunningRef.current) {
      const fieldAlpha = 0.06;
      ctx.strokeStyle = `rgba(99, 102, 241, ${fieldAlpha})`;
      ctx.lineWidth = 1;
      const offset = (time * 0.03) % 40;
      for (let x = 40; x < CANVAS_WIDTH; x += 80) {
        for (let y = -offset; y < CANVAS_HEIGHT; y += 40) {
          ctx.beginPath();
          ctx.moveTo(x, y + 15);
          ctx.lineTo(x, y);
          ctx.lineTo(x - 4, y + 6);
          ctx.moveTo(x, y);
          ctx.lineTo(x + 4, y + 6);
          ctx.stroke();
        }
      }
    }

    // Draw trails
    const trails = trailsRef.current;
    for (let i = 0; i < objs.length; i++) {
      const obj = objs[i];
      const trail = trails[obj.id];
      const color = getColorForObject(i);

      if (trail && trail.length > 1) {
        for (let j = 1; j < trail.length; j++) {
          const alpha = (j / trail.length) * 0.4;
          const size = (j / trail.length) * (obj.radius * 0.5);
          ctx.beginPath();
          ctx.arc(trail[j].x, trail[j].y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
          ctx.fill();
        }
      }
    }

    // Draw objects
    for (let i = 0; i < objs.length; i++) {
      const obj = objs[i];
      const color = getColorForObject(i);

      // Outer glow
      const glowGradient = ctx.createRadialGradient(
        obj.x, obj.y, obj.radius * 0.5,
        obj.x, obj.y, obj.radius * 2.5
      );
      glowGradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`);
      glowGradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
      ctx.beginPath();
      ctx.arc(obj.x, obj.y, obj.radius * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();

      // Main sphere
      const sphereGradient = ctx.createRadialGradient(
        obj.x - obj.radius * 0.3, obj.y - obj.radius * 0.3, obj.radius * 0.1,
        obj.x, obj.y, obj.radius
      );
      sphereGradient.addColorStop(0, `rgba(${Math.min(255, color.r + 80)}, ${Math.min(255, color.g + 80)}, ${Math.min(255, color.b + 80)}, 1)`);
      sphereGradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, 1)`);
      sphereGradient.addColorStop(1, `rgba(${Math.max(0, color.r - 40)}, ${Math.max(0, color.g - 40)}, ${Math.max(0, color.b - 40)}, 1)`);

      ctx.beginPath();
      ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
      ctx.fillStyle = sphereGradient;
      ctx.fill();

      // Highlight
      ctx.beginPath();
      ctx.arc(
        obj.x - obj.radius * 0.25,
        obj.y - obj.radius * 0.25,
        obj.radius * 0.35,
        0, Math.PI * 2
      );
      ctx.fillStyle = `rgba(255, 255, 255, 0.25)`;
      ctx.fill();

      // Mass label
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = `bold ${Math.max(9, obj.radius * 0.65)}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(Math.round(obj.mass), obj.x, obj.y);
    }

    // Empty state
    if (objs.length === 0) {
      ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
      ctx.font = "16px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        "Add objects from the panel and press Play →",
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2
      );
    }
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let lastSimTime = 0;
    const SIM_INTERVAL = 33; // ~30fps for API calls

    const loop = async (timestamp) => {
      timeRef.current = timestamp;

      // Simulate physics if running
      if (isRunningRef.current && objectsRef.current.length > 0) {
        if (timestamp - lastSimTime >= SIM_INTERVAL) {
          lastSimTime = timestamp;
          const updated = await simulateStep(objectsRef.current);
          if (updated) {
            updateTrails(updated);
            setObjects(updated);
          }
        }
      }

      // Always draw
      draw(ctx, timestamp);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [draw, simulateStep, setObjects, updateTrails]);

  return (
    <div className="canvas-container glass-panel glow-border animate-pulse-glow">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="simulation-canvas"
      />
      <div className="canvas-info">
        <span>{CANVAS_WIDTH}×{CANVAS_HEIGHT}</span>
        <span>•</span>
        <span>{objects.length} object{objects.length !== 1 ? "s" : ""}</span>
        <span>•</span>
        <span className={isRunning ? "running" : "paused"}>
          {isRunning ? "▶ Running" : "⏸ Paused"}
        </span>
      </div>
    </div>
  );
}
