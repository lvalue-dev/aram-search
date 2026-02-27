export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-10 w-48 bg-white/5 rounded-lg" />
      <div className="card p-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-white/5" />
        <div className="space-y-3 flex-1">
          <div className="h-7 w-48 bg-white/5 rounded" />
          <div className="h-4 w-32 bg-white/5 rounded" />
          <div className="h-8 w-56 bg-white/5 rounded-lg" />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Stats panel skeleton */}
        <div className="w-72 shrink-0 card p-5 space-y-4">
          <div className="h-4 w-32 bg-white/5 rounded" />
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-white/5" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-24 bg-white/5 rounded" />
              <div className="h-4 w-32 bg-white/5 rounded" />
              <div className="h-4 w-20 bg-white/5 rounded" />
            </div>
          </div>
        </div>

        {/* Match list skeleton */}
        <div className="flex-1 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
