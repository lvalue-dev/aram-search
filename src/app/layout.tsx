import type { Metadata, Viewport } from "next";
import "./globals.css";
import NavigationProvider from "@/components/NavigationProvider";
import AppHeader from "@/components/AppHeader";
import SnowCanvas from "@/components/ui/SnowCanvas";
import ScrollTop from "@/components/ui/ScrollTop";

export const metadata: Metadata = {
  title: {
    default: "FROSTLINE | 칼바람 나락 전적검색",
    template: "%s | FROSTLINE",
  },
  description: "리그 오브 레전드 칼바람 나락(ARAM) 전용 전적 검색. 나락 점수, MVP/ACE, 챔피언별 성적과 상세 분석까지.",
  keywords: ["Frostline", "칼바람", "ARAM", "전적검색", "칼바람 나락", "롤 전적", "Howling Abyss"],
  openGraph: {
    title: "FROSTLINE | 칼바람 나락 전적검색",
    description: "칼바람 나락 전용 전적 검색 — 나락 점수, MVP, 챔피언 성적, 상세 분석",
    type: "website",
    locale: "ko_KR",
  },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#080b14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="dark">
      <head>
        <link rel="preconnect" href="https://ddragon.leagueoflegends.com" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="abyss-bg noise min-h-screen text-ink-100">
        <SnowCanvas />
        <NavigationProvider>
          <div className="relative z-10 flex min-h-screen flex-col">
            <AppHeader />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">{children}</main>
            <footer className="mt-16 border-t border-frost-300/10">
              <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center text-[11px] text-ink-500 sm:flex-row sm:justify-between sm:text-left">
                <div>
                  <p className="font-bold text-ink-400">FROSTLINE</p>
                  <p className="mt-1">FROSTLINE은 Riot Games와 공식적인 제휴 관계가 없습니다. Riot Games의 자산은 Riot Games Legal Jibber Jabber 정책에 따라 사용됩니다.</p>
                </div>
                <p>League of Legends and Riot Games are trademarks of Riot Games, Inc.</p>
              </div>
            </footer>
          </div>
          <ScrollTop />
        </NavigationProvider>
      </body>
    </html>
  );
}
