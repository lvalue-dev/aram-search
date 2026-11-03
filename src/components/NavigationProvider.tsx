"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import FrostLoader from "./ui/FrostLoader";

interface NavContext {
  /** 라우트 전환 (상단 진행바 + 선택적 오버레이 메시지) */
  navigate: (href: string, options?: { message?: string }) => void;
  refresh: (message?: string) => void;
  pending: boolean;
}

const Ctx = createContext<NavContext>({ navigate: () => {}, refresh: () => {}, pending: false });

export function useNavigation() {
  return useContext(Ctx);
}

/**
 * 페이지 전환 연출.
 * - 상단 오로라 진행바
 * - 소환사 검색처럼 오래 걸리는 전환에는 "나락으로 내려가는 중" 오버레이
 * - pathname 변경 시 자동으로 종료
 */
export default function NavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const lastPath = useRef(pathname);

  const navigate = useCallback(
    (href: string, options?: { message?: string }) => {
      setMessage(options?.message ?? null);
      setVisible(true);
      startTransition(() => {
        router.push(href);
      });
    },
    [router]
  );

  const refresh = useCallback(
    (msg?: string) => {
      setMessage(msg ?? null);
      setVisible(true);
      startTransition(() => {
        router.refresh();
      });
    },
    [router]
  );

  // 경로가 바뀌면 전환 종료
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      setVisible(false);
      setMessage(null);
      window.scrollTo({ top: 0 });
    }
  }, [pathname]);

  // transition 이 끝나면 (refresh 등) 종료
  useEffect(() => {
    if (!isPending) {
      const t = setTimeout(() => {
        setVisible(false);
        setMessage(null);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [isPending]);

  const value = useMemo(() => ({ navigate, refresh, pending: visible }), [navigate, refresh, visible]);

  return (
    <Ctx.Provider value={value}>
      {/* 상단 진행바 */}
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] overflow-hidden transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="h-full w-full animate-progress bg-gradient-to-r from-transparent via-frost-300 to-aurora-violet shadow-glow" />
      </div>

      {/* 오버레이 */}
      <div
        aria-live="polite"
        className={`fixed inset-0 z-[90] flex items-center justify-center bg-abyss-950/70 backdrop-blur-sm transition-opacity duration-300 ${
          visible && message ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {message && (
          <div className="flex flex-col items-center gap-5 animate-rise">
            <FrostLoader size={88} />
            <p className="text-sm font-semibold tracking-wide text-frost-100">{message}</p>
          </div>
        )}
      </div>

      {children}
    </Ctx.Provider>
  );
}
