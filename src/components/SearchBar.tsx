"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { REGIONS, RegionKey, isRegionKey } from "@/types/riot";
import { getFavorites, getRecent, removeRecent, SavedSummoner, summonerHref } from "@/lib/storage";
import { useNavigation } from "./NavigationProvider";
import { parseRiotId } from "@/lib/riot-id";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  defaultValue?: string;
  defaultRegion?: string;
  size?: "sm" | "lg";
  autoFocus?: boolean;
  className?: string;
}

export default function SearchBar({ defaultValue = "", defaultRegion = "kr", size = "lg", autoFocus = false, className }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [region, setRegion] = useState<RegionKey>(isRegionKey(defaultRegion) ? defaultRegion : "kr");
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<SavedSummoner[]>([]);
  const [favorites, setFavorites] = useState<SavedSummoner[]>([]);
  const [highlight, setHighlight] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { navigate, pending } = useNavigation();

  const isLarge = size === "lg";

  const load = () => {
    setRecent(getRecent());
    setFavorites(getFavorites());
  };

  useEffect(() => {
    load();
    const onStorage = () => load();
    window.addEventListener("aram-storage", onStorage);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("aram-storage", onStorage);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // "/" 키로 검색창 포커스
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all: Array<SavedSummoner & { kind: "fav" | "recent" }> = [
      ...favorites.map((s) => ({ ...s, kind: "fav" as const })),
      ...recent.filter((r) => !favorites.some((f) => f.gameName === r.gameName && f.tagLine === r.tagLine && f.region === r.region)).map((s) => ({ ...s, kind: "recent" as const })),
    ];
    if (!q) return all.slice(0, 8);
    return all.filter((s) => `${s.gameName}#${s.tagLine}`.toLowerCase().includes(q)).slice(0, 8);
  }, [query, recent, favorites]);

  function go(target: { gameName: string; tagLine: string; region: string }) {
    setOpen(false);
    navigate(summonerHref(target), { message: `${target.gameName}#${target.tagLine} 님의 나락 기록을 불러오는 중` });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (highlight >= 0 && suggestions[highlight]) {
      go(suggestions[highlight]);
      return;
    }
    const parsed = parseRiotId(query, region);
    if (!parsed) {
      inputRef.current?.focus();
      return;
    }
    go(parsed);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} className={cn("relative w-full", className)}>
      <form
        onSubmit={handleSubmit}
        className={cn(
          "group flex w-full items-stretch overflow-hidden rounded-2xl border bg-abyss-800/80 backdrop-blur-md transition-all duration-300",
          "border-frost-300/15 focus-within:border-frost-300/60 focus-within:shadow-frost",
          isLarge ? "h-16" : "h-11"
        )}
        role="search"
      >
        {/* 서버 선택 */}
        <label className="relative flex items-center border-r border-white/[0.06]">
          <span className="sr-only">서버</span>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value as RegionKey)}
            className={cn(
              "h-full cursor-pointer appearance-none bg-transparent pr-7 font-bold text-frost-200 outline-none",
              isLarge ? "pl-5 text-sm" : "pl-3 text-xs"
            )}
          >
            {Object.entries(REGIONS).map(([key, r]) => (
              <option key={key} value={key} className="bg-abyss-800 text-ink-100">
                {r.short}
              </option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-ink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </label>

        {/* 입력 */}
        <div className="relative flex flex-1 items-center">
          <svg className={cn("absolute text-ink-400 transition-colors group-focus-within:text-frost-300", isLarge ? "left-4 h-5 w-5" : "left-3 h-4 w-4")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            autoFocus={autoFocus}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlight(-1);
              setOpen(true);
            }}
            onClick={() => setOpen(true)}
            onFocus={(e) => { if (e.relatedTarget) setOpen(true); }}
            onKeyDown={onKeyDown}
            placeholder={isLarge ? "소환사명#태그  (예: Hide on bush#KR1)" : "소환사명#태그"}
            autoComplete="off"
            spellCheck={false}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls="summoner-suggestions"
            className={cn(
              "h-full w-full bg-transparent text-white placeholder-ink-400 outline-none",
              isLarge ? "pl-12 pr-4 text-base" : "pl-9 pr-3 text-sm"
            )}
          />
          {isLarge && !query && (
            <kbd className="pointer-events-none absolute right-4 hidden rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-ink-400 sm:block">
              /
            </kbd>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className={cn(
            "m-1.5 rounded-xl bg-frost-500 font-black text-abyss-900 transition-all hover:bg-frost-400 hover:shadow-glow active:scale-[0.97] disabled:opacity-60",
            isLarge ? "px-6 text-sm" : "px-3.5 text-xs"
          )}
        >
          {isLarge ? "기록 보기" : "검색"}
        </button>
      </form>

      {/* 최근/즐겨찾기 드롭다운 */}
      {open && suggestions.length > 0 && (
        <div id="summoner-suggestions" className="panel absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden p-1.5 animate-expand" role="listbox">
          {suggestions.map((s, i) => (
            <div
              key={`${s.region}-${s.gameName}-${s.tagLine}`}
              role="option"
              aria-selected={i === highlight}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => go(s)}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                i === highlight ? "bg-frost-500/15 text-white" : "text-ink-200 hover:bg-white/[0.04]"
              )}
            >
              <span className={cn("flex h-6 w-6 items-center justify-center rounded-md text-[11px]", s.kind === "fav" ? "bg-ember-400/15 text-ember-300" : "bg-white/[0.05] text-ink-400")}>
                {s.kind === "fav" ? "★" : "↺"}
              </span>
              <span className="font-semibold">{s.gameName}</span>
              <span className="text-ink-400">#{s.tagLine}</span>
              <span className="ml-auto rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] font-bold text-ink-400">
                {REGIONS[s.region as RegionKey]?.short ?? s.region.toUpperCase()}
              </span>
              {s.kind === "recent" && (
                <button
                  type="button"
                  aria-label="최근 검색에서 삭제"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRecent(s);
                  }}
                  className="rounded-md px-1 text-ink-500 hover:text-lose"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
