import "./ObjectCard.css";

const COLORS = [
  "#6366f1", "#8b5cf6", "#06b6d4", "#10b981",
  "#f59e0b", "#f43f5e", "#ec4899", "#22c55e",
];

export default function ObjectCard({ obj, index, onRemove }) {
  const color = COLORS[index % COLORS.length];

  return (
    <div className="object-card" style={{ borderLeftColor: color }}>
      <div className="card-header">
        <div className="card-color-dot" style={{ background: color }} />
        <span className="card-id">{obj.id}</span>
        <button
          className="btn btn-ghost btn-sm btn-icon card-remove"
          onClick={onRemove}
          title="Remove object"
        >
          ✕
        </button>
      </div>
      <div className="card-stats">
        <div className="stat">
          <span className="stat-label">Mass</span>
          <span className="stat-value">{Math.round(obj.mass)} kg</span>
        </div>
        <div className="stat">
          <span className="stat-label">Pos</span>
          <span className="stat-value">
            {Math.round(obj.x)}, {Math.round(obj.y)}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Vel</span>
          <span className="stat-value">
            {obj.vx.toFixed(1)}, {obj.vy.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
