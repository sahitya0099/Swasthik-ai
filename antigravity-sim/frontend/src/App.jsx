import { useState, useCallback, useRef } from "react";
import SimulationCanvas from "./components/SimulationCanvas";
import ControlPanel from "./components/ControlPanel";
import "./App.css";

const API_URL = "/api/simulate";

function App() {
  const [objects, setObjects] = useState([]);
  const [antigravityStrength, setAntigravityStrength] = useState(9.8);
  const [timeStep, setTimeStep] = useState(0.016);
  const [isRunning, setIsRunning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("idle");
  const nextId = useRef(1);

  const addObject = useCallback((params) => {
    const id = `obj-${nextId.current++}`;
    const newObj = {
      id,
      x: 100 + Math.random() * 600,
      y: 350 + Math.random() * 100,
      vx: params.vx || 0,
      vy: params.vy || 0,
      mass: params.mass || 10,
      radius: Math.max(8, Math.min(30, params.mass * 0.8 + 5)),
    };
    setObjects((prev) => [...prev, newObj]);
  }, []);

  const removeObject = useCallback((id) => {
    setObjects((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setObjects([]);
    setIsRunning(false);
  }, []);

  const resetSimulation = useCallback(() => {
    setObjects((prev) =>
      prev.map((obj) => ({
        ...obj,
        x: 100 + Math.random() * 600,
        y: 350 + Math.random() * 100,
        vx: 0,
        vy: 0,
      }))
    );
    setIsRunning(false);
  }, []);

  const simulateStep = useCallback(async (currentObjects) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objects: currentObjects,
          antigravity_strength: antigravityStrength,
          dt: timeStep,
        }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setConnectionStatus("connected");
      return data.objects;
    } catch (err) {
      setConnectionStatus("error");
      console.error("Simulation error:", err);
      return null;
    }
  }, [antigravityStrength, timeStep]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="title-icon">⬆</span>
            Antigravity Simulator
          </h1>
          <p className="app-subtitle">
            Watch objects defy gravity — powered by real-time physics
          </p>
        </div>
        <div className="header-status">
          <span
            className={`status-dot ${connectionStatus}`}
            title={connectionStatus}
          />
          <span className="status-text">
            {connectionStatus === "connected"
              ? "Engine Online"
              : connectionStatus === "error"
              ? "Engine Offline"
              : "Standby"}
          </span>
        </div>
      </header>

      <main className="app-main">
        <div className="simulation-area">
          <SimulationCanvas
            objects={objects}
            setObjects={setObjects}
            isRunning={isRunning}
            simulateStep={simulateStep}
          />
        </div>
        <aside className="control-area">
          <ControlPanel
            objects={objects}
            onAddObject={addObject}
            onRemoveObject={removeObject}
            onClear={clearAll}
            onReset={resetSimulation}
            isRunning={isRunning}
            onToggleRun={() => setIsRunning((r) => !r)}
            antigravityStrength={antigravityStrength}
            onAntigravityChange={setAntigravityStrength}
            timeStep={timeStep}
            onTimeStepChange={setTimeStep}
          />
        </aside>
      </main>
    </div>
  );
}

export default App;
