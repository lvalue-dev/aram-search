import SearchBar from "@/components/SearchBar";
import RecentSearches from "@/components/RecentSearches";

const FEATURES = [
  {
    title: "나락 점수 · MVP",
    desc: "KDA, 딜 비중, 킬 관여, 탱킹, 치유까지 한 게임의 기여도를 10점 만점으로 환산해 MVP와 ACE를 가립니다.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" />
      </svg>
    ),
  },
  {
    title: "챔피언별 성적표",
    desc: "불러온 모든 게임을 챔피언별로 집계. 승률, KDA, 평균 딜량, 멀티킬을 정렬해서 비교하세요.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </svg>
    ),
  },
  {
    title: "상세 분석",
    desc: "피해 유형 비율, 게임 길이별 승률, 최고 기록까지. 내가 어떤 나락 플레이어인지 한눈에.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    title: "멀티서치",
    desc: "로비에 있는 아군 닉네임을 통째로 붙여넣으면 모두의 최근 폼을 한 화면에서 확인합니다.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20a6.5 6.5 0 0113 0" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M15 15.5a5 5 0 016.5 4.5" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center gap-12 py-6 sm:py-12">
      {/* Hero */}
      <section className="relative flex w-full flex-col items-center text-center stagger">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[640px] -translate-x-1/2 rounded-full bg-frost-400/10 blur-3xl" />
        <span className="chip border-frost-300/20 bg-frost-500/10 text-frost-200">
          <span className="h-1.5 w-1.5 rounded-full bg-frost-300 shadow-[0_0_8px_#7fd6ff]" />
          칼바람 나락 전용 전적 검색
        </span>
        <h1 className="relative mt-5 text-5xl font-black tracking-tight sm:text-7xl">
          <span className="text-aurora animate-aurora text-shadow-frost">칼바람.gg</span>
        </h1>
        <p className="mt-4 max-w-xl text-base text-ink-300 sm:text-lg">
          얼어붙은 다리 위, 당신의 모든 기록.
          <br className="hidden sm:block" /> 나락 점수로 매 게임의 기여도를 다시 봅니다.
        </p>

        <div className="relative mt-8 w-full max-w-2xl">
          <SearchBar size="lg" autoFocus />
          <p className="mt-3 text-xs text-ink-500">
            <kbd className="rounded border border-white/10 bg-white/[0.04] px-1 font-mono text-[10px] text-ink-400">/</kbd> 키로 바로 검색 · 태그를 생략하면 선택한 서버의 기본 태그로 검색합니다
          </p>
        </div>

        <div className="mt-6 w-full max-w-2xl">
          <RecentSearches />
        </div>
      </section>

      {/* 기능 */}
      <section className="grid w-full max-w-4xl gap-3 sm:grid-cols-2 stagger">
        {FEATURES.map((f) => (
          <div key={f.title} className="panel panel-hover group flex gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-frost-300/20 bg-frost-500/10 text-frost-200 transition-transform duration-300 group-hover:scale-110 [&>svg]:h-5 [&>svg]:w-5">
              {f.icon}
            </div>
            <div>
              <h3 className="text-sm font-black text-white">{f.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-400">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* 안내 */}
      <section className="w-full max-w-4xl animate-fade-in">
        <div className="frost-divider mb-6" />
        <div className="grid gap-4 text-center text-xs text-ink-400 sm:grid-cols-3">
          <div>
            <div className="text-2xl font-black text-frost-200">450 · 900</div>
            <p className="mt-1">칼바람 나락과 URF 큐를 함께 집계합니다</p>
          </div>
          <div>
            <div className="text-2xl font-black text-frost-200">20 → ∞</div>
            <p className="mt-1">처음 20게임, 스크롤하면 계속 불러옵니다</p>
          </div>
          <div>
            <div className="text-2xl font-black text-frost-200">7개 서버</div>
            <p className="mt-1">KR · JP · NA · BR · EUW · EUNE · OCE</p>
          </div>
        </div>
      </section>
    </div>
  );
}
