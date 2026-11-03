import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center animate-rise">
      <div className="text-aurora text-7xl font-black">404</div>
      <h2 className="text-xl font-black text-white">다리 끝에 아무것도 없어요</h2>
      <p className="max-w-sm text-sm text-ink-400">주소가 잘못되었거나 지원하지 않는 서버입니다. 소환사명#태그 형식으로 다시 검색해 보세요.</p>
      <Link href="/" className="btn-primary mt-2 px-6">
        홈으로 돌아가기
      </Link>
    </div>
  );
}
