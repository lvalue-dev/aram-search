/**
 * 얼음 결정 로더 — 육각 결정이 회전하며 자라나는 컨셉 로딩 인디케이터
 */
export default function FrostLoader({ size = 64, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }} role="status" aria-label="불러오는 중">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-crystal" style={{ animationDuration: "3.2s" }}>
        <defs>
          <linearGradient id="frostGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#dcf4ff" />
            <stop offset="60%" stopColor="#7fd6ff" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <polygon points="50,6 88,28 88,72 50,94 12,72 12,28" fill="none" stroke="url(#frostGrad)" strokeWidth="2.5" strokeLinejoin="round" opacity="0.9" />
        <polygon points="50,24 72,37 72,63 50,76 28,63 28,37" fill="rgba(127,214,255,0.08)" stroke="url(#frostGrad)" strokeWidth="1.5" strokeLinejoin="round" opacity="0.7" />
      </svg>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-crystal" style={{ animationDirection: "reverse", animationDuration: "2.2s" }}>
        {[0, 60, 120].map((deg) => (
          <line key={deg} x1="50" y1="14" x2="50" y2="86" stroke="#7fd6ff" strokeWidth="1.2" strokeLinecap="round" opacity="0.55" transform={`rotate(${deg} 50 50)`} />
        ))}
      </svg>
      <div className="absolute inset-0 m-auto h-3 w-3 rounded-full bg-frost-200 shadow-glow animate-pulse-glow" />
    </div>
  );
}
