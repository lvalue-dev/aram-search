export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="text-6xl">404</div>
      <h2 className="text-xl font-bold text-white">페이지를 찾을 수 없습니다</h2>
      <a
        href="/"
        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors"
      >
        홈으로 돌아가기
      </a>
    </div>
  );
}
