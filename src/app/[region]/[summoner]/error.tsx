"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="text-6xl">⚠️</div>
      <h2 className="text-xl font-bold text-white">오류가 발생했습니다</h2>
      <p className="text-slate-400 text-sm">{error.message}</p>
      <div className="flex gap-3 mt-2">
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-lg transition-colors"
        >
          다시 시도
        </button>
        <a
          href="/"
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors"
        >
          홈으로 돌아가기
        </a>
      </div>
    </div>
  );
}
