import FrostLoader from "@/components/ui/FrostLoader";

const STEPS = ["소환사 확인", "매치 목록 수집", "나락 점수 계산"];

export default function Loading() {
  return (
    <div className="space-y-5 animate-fade-in" aria-busy>
      {/* 프로필 스켈레톤 */}
      <div className="panel flex flex-col gap-6 p-6 md:flex-row md:items-center">
        <div className="skeleton h-24 w-24 rounded-[20px]" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-8 w-56" />
          <div className="skeleton h-7 w-80 max-w-full" />
          <div className="skeleton h-3 w-44" />
        </div>
        <div className="flex items-center gap-4">
          <FrostLoader size={56} />
          <div className="space-y-1.5">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2 text-[11px] font-semibold text-ink-300" style={{ animation: `fadeIn 0.4s ease-out ${i * 0.5}s both` }}>
                <span className="h-1.5 w-1.5 rounded-full bg-frost-300 shadow-[0_0_6px_#7fd6ff]" />
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-white/[0.06]">
        {[56, 72, 56].map((w, i) => (
          <div key={i} className="skeleton my-2 mx-3 h-4" style={{ width: w }} />
        ))}
      </div>

      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="w-full shrink-0 space-y-4 lg:w-[300px]">
          <div className="panel space-y-5 p-5">
            <div className="skeleton h-3 w-24" />
            <div className="flex items-center gap-5">
              <div className="skeleton h-28 w-28 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-5 w-28" />
                <div className="skeleton h-3 w-32" />
                <div className="skeleton h-3 w-24" />
                <div className="skeleton h-3 w-28" />
              </div>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="skeleton h-7 flex-1" />
              ))}
            </div>
          </div>
          <div className="panel space-y-3 p-5">
            <div className="skeleton h-3 w-24" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton h-9 w-9 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-3 w-2/3" />
                  <div className="skeleton h-2 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-2.5">
          <div className="skeleton h-12 w-full rounded-2xl" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-[88px] w-full rounded-2xl" style={{ animationDelay: `${i * 80}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
