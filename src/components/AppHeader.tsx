"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchBar from "./SearchBar";
import { useNavigation } from "./NavigationProvider";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "전적 검색" },
  { href: "/multi", label: "멀티서치" },
];

export default function AppHeader() {
  const pathname = usePathname();
  const { navigate } = useNavigation();
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b border-frost-300/10 bg-abyss-900/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="group flex items-center gap-2.5" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
          <span className="relative flex h-9 w-9 items-center justify-center">
            <svg viewBox="0 0 40 40" className="h-9 w-9 transition-transform duration-500 group-hover:rotate-[60deg]">
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#dcf4ff" />
                  <stop offset="100%" stopColor="#45bdf5" />
                </linearGradient>
              </defs>
              <polygon points="20,3 35,11.5 35,28.5 20,37 5,28.5 5,11.5" fill="rgba(69,189,245,0.08)" stroke="url(#logoGrad)" strokeWidth="2" strokeLinejoin="round" />
              <path d="M20 10v20M12 15l8 5 8-5M12 25l8-5 8 5" stroke="url(#logoGrad)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </svg>
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-xl font-black tracking-tight text-aurora animate-aurora">FROSTLINE</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-400">ARAM Records</span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {NAV.map((n) => {
            const active = n.href === "/" ? isHome : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={(e) => { e.preventDefault(); navigate(n.href); }}
                className={cn(
                  "relative rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                  active ? "text-frost-200" : "text-ink-300 hover:text-white"
                )}
              >
                {n.label}
                {active && <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-frost-300 shadow-glow" />}
              </Link>
            );
          })}
        </nav>

        {!isHome && (
          <div className="ml-auto hidden w-full max-w-sm sm:block">
            <SearchBar size="sm" />
          </div>
        )}

        <div className={cn("flex items-center gap-2", isHome && "ml-auto")}>
          <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold text-ink-300 lg:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-aurora-teal shadow-[0_0_8px_#2dd4bf]" />
            ARAM · URF
          </span>
          <Link href="/multi" onClick={(e) => { e.preventDefault(); navigate("/multi"); }} className="btn-icon md:hidden" aria-label="멀티서치">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0113 0" /><circle cx="17" cy="9" r="2.5" /><path d="M15 15.5a5 5 0 016.5 4.5" />
            </svg>
          </Link>
        </div>
      </div>
      {!isHome && (
        <div className="border-t border-white/[0.04] px-4 py-2 sm:hidden">
          <SearchBar size="sm" />
        </div>
      )}
    </header>
  );
}
