import FrostLoader from "@/components/ui/FrostLoader";

export default function Loading() {
  return (
    <div className="space-y-6 animate-fade-in" aria-busy>
      <div className="space-y-3">
        <div className="skeleton h-7 w-32" />
        <div className="skeleton h-4 w-80 max-w-full" />
        <div className="skeleton h-40 w-full rounded-2xl" />
      </div>
      <div className="flex items-center justify-center gap-3 py-6 text-sm font-semibold text-frost-200">
        <FrostLoader size={48} /> 여러 소환사의 기록을 동시에 모으는 중...
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-64 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
