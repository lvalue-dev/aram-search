import SearchBar from "@/components/SearchBar";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-10">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 text-sm px-4 py-1.5 rounded-full border border-blue-500/20 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          칼바람 나락 전적 검색
        </div>
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-blue-400">
          칼바람.gg
        </h1>
        <p className="text-slate-400 text-lg">
          칼바람 나락(ARAM) 전용 전적 검색 사이트
        </p>
        <p className="text-slate-500 text-sm">
          큐 450 (칼바람 나락) · 큐 900 (칼바람 URF) 지원
        </p>
      </div>

      {/* Search */}
      <div className="w-full max-w-xl">
        <SearchBar size="lg" />
        <p className="text-center text-xs text-slate-600 mt-3">
          닉네임#태그 형식으로 입력하세요 (예: Hide on bush#KR1)
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-2xl mt-4">
        {[
          {
            icon: "⚔️",
            title: "칼바람 전적",
            desc: "모든 칼바람 모드 매치 히스토리",
          },
          {
            icon: "📊",
            title: "챔피언 통계",
            desc: "챔피언별 승률, KDA 분석",
          },
          {
            icon: "💥",
            title: "딜량 분석",
            desc: "게임당 평균 딜량 및 피해량",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-card border border-white/5 rounded-xl p-4 text-center hover:border-blue-500/30 transition-colors"
          >
            <div className="text-3xl mb-2">{f.icon}</div>
            <div className="font-bold text-sm text-white">{f.title}</div>
            <div className="text-xs text-slate-500 mt-1">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
