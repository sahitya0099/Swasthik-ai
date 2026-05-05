import { useState } from "react";
import ObjectCard from "./ObjectCard";
import "./ControlPanel.css";

export default function ControlPanel({
  objects,
  onAddObject,
  onRemoveObject,
  onClear,
  onReset,
  isRunning,
  onToggleRun,
  antigravityStrength,
  onAntigravityChange,
  timeStep,
  onTimeStepChange,
}) {
  const [mass, setMass] = useState(15);
  const [vx, setVx] = useState(0);
  const [vy, setVy] = useState(0);

  const handleAdd = () => {
    onAddObject({ mass, vx, vy });
  };

  return (
    <div className="control-panel">
      {/* ── Simulation Controls ──────────────────────── */}
      <section className="panel-section glass-panel">
        <h2 className="section-title">Simulation</h2>
        <div className="sim-controls">
          <button
            id="btn-play-pause"
            className={`btn ${isRunning ? "btn-danger" : "btn-primary"} btn-play`}
            onClick={onToggleRun}
            disabled={objects.length === 0}
          >
            {isRunning ? "⏸  Pause" : "▶  Play"}
          </button>
          <button id="btn-reset" className="btn btn-ghost" onClick={onReset}>
            ↺ Reset
          </button>
          <button id="btn-clear" className="btn btn-ghost" onClick={onClear}>
            ✕ Clear
          </button>
        </div>
      </section>

      {/* ── Physics Parameters ───────────────────────── */}
      <section className="panel-section glass-panel">
        <h2 className="section-title">Physics</h2>

        <div className="form-group">
          <label className="form-label" htmlFor="slider-antigravity">
            Antigravity Strength
          </label>
          <input
            id="slider-antigravity"
            type="range"
            className="form-slider"
            min="0.1"
            max="50"
            step="0.1"
            value={antigravityStrength}
            onChange={(e) => onAntigravityChange(parseFloat(e.target.value))}
          />
          <span className="form-value">{antigravityStrength.toFixed(1)} m/s²</span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="slider-timestep">
            Time Step (Speed)
          </label>
          <input
            id="slider-timestep"
            type="range"
            className="form-slider"
            min="0.004"
            max="0.06"
            step="0.002"
            value={timeStep}
            onChange={(e) => onTimeStepChange(parseFloat(e.target.value))}
          />
          <span className="form-value">{(timeStep * 1000).toFixed(0)} ms</span>
        </div>
      </section>

      {/* ── Add Object ───────────────────────────────── */}
      <section className="panel-section glass-panel">
        <h2 className="section-title">Add Object</h2>

        <div className="form-group">
          <label className="form-label" htmlFor="slider-mass">
            Mass
          </label>
          <input
            id="slider-mass"
            type="range"
            className="form-slider"
            min="1"
            max="50"
            step="1"
            value={mass}
            onChange={(e) => setMass(parseInt(e.target.value))}
          />
          <span className="form-value">{mass} kg</span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="slider-vx">
              Velocity X
            </label>
            <input
              id="slider-vx"
              type="range"
              className="form-slider"
              min="-100"
              max="100"
              step="5"
              value={vx}
              onChange={(e) => setVx(parseInt(e.target.value))}
            />
            <span className="form-value">{vx}</span>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="slider-vy">
              Velocity Y
            </label>
            <input
              id="slider-vy"
              type="range"
              className="form-slider"
              min="-100"
              max="100"
              step="5"
              value={vy}
              onChange={(e) => setVy(parseInt(e.target.value))}
            />
            <span className="form-value">{vy}</span>
          </div>
        </div>

        <button
          id="btn-add-object"
          className="btn btn-primary btn-add"
          onClick={handleAdd}
        >
          + Add Object
        </button>
      </section>

      {/* ── Objects List ─────────────────────────────── */}
      {objects.length > 0 && (
        <section className="panel-section glass-panel">
          <h2 className="section-title">
            Objects
            <span className="object-count">{objects.length}</span>
          </h2>
          <div className="objects-list">
            {objects.map((obj, i) => (
              <ObjectCard
                key={obj.id}
                obj={obj}
                index={i}
                onRemove={() => onRemoveObject(obj.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
