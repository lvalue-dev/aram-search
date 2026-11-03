"use client";

import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center animate-rise">
      <div className="text-5xl">⚠️</div>
      <h2 className="text-xl font-black text-white">페이지를 불러오지 못했어요</h2>
      <p className="max-w-md text-sm text-ink-400">{error.message || "알 수 없는 오류가 발생했습니다."}</p>
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={reset} className="btn-ghost">
          다시 시도
        </button>
        <Link href="/" className="btn-primary">
          홈으로
        </Link>
      </div>
    </div>
  );
}
