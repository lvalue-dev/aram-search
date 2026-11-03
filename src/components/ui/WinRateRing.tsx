interface Props {
  winRate: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
}

/** 승률 도넛 — 마운트 시 링이 그려지는 애니메이션 */
export default function WinRateRing({ winRate, size = 112, stroke = 8, label, sublabel }: Props) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, winRate)) / 100) * c;
  const color = winRate >= 60 ? "#7fd6ff" : winRate >= 50 ? "#4cc2ff" : winRate >= 40 ? "#9aa8bf" : "#ff5c7a";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c}
          className="animate-draw-ring"
          style={{ ["--ring-offset" as string]: offset, filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="num text-2xl font-black leading-none text-white">{label ?? `${winRate}%`}</span>
        {sublabel && <span className="mt-1 text-[10px] font-semibold text-ink-400">{sublabel}</span>}
      </div>
    </div>
  );
}
