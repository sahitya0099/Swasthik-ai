import { useEffect, useState } from "react";

export function ScoreRing({ score, size = 220 }: { score: number; size?: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 900);
      setShown(Math.round(score * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  const offset = c - (shown / 100) * c;

  const tone = score >= 75 ? "good" : score >= 45 ? "mod" : "poor";
  const stroke =
    tone === "good"
      ? "oklch(0.68 0.16 155)"
      : tone === "mod"
      ? "oklch(0.78 0.16 75)"
      : "oklch(0.6 0.22 25)";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--color-muted)" strokeWidth="14" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={stroke}
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.05s linear", filter: `drop-shadow(0 0 12px ${stroke})` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="font-display text-6xl font-bold leading-none">{shown}</div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mt-2">Health Score</div>
        </div>
      </div>
    </div>
  );
}
