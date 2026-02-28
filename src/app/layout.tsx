import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "칼바람 전적검색 | ARAM Search",
  description: "리그오브레전드 칼바람 나락 전적 검색 사이트",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#0d0e1a] text-slate-200 antialiased">
        <header className="border-b border-white/5 bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                칼바람.gg
              </span>
              <span className="text-xs text-slate-500 mt-1">ARAM Search</span>
            </a>
            <nav className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                큐 450 · 900 · 1700
              </span>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-white/5 mt-16 py-8 text-center text-xs text-slate-600">
          <p>칼바람.gg는 Riot Games와 공식적인 제휴 관계가 없습니다.</p>
          <p className="mt-1">League of Legends and Riot Games are trademarks of Riot Games, Inc.</p>
        </footer>
      </body>
    </html>
  );
}
