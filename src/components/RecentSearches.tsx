"use client";

import { useEffect, useState } from "react";
import { clearRecent, getFavorites, getRecent, SavedSummoner, summonerHref, toggleFavorite } from "@/lib/storage";
import { REGIONS, RegionKey } from "@/types/riot";
import { useNavigation } from "./NavigationProvider";

/** 홈 화면 - 즐겨찾기 / 최근 검색 칩 */
export default function RecentSearches() {
  const [recent, setRecent] = useState<SavedSummoner[]>([]);
  const [favorites, setFavorites] = useState<SavedSummoner[]>([]);
  const { navigate } = useNavigation();

  useEffect(() => {
    const load = () => {
      setRecent(getRecent());
      setFavorites(getFavorites());
    };
    load();
    window.addEventListener("aram-storage", load);
    return () => window.removeEventListener("aram-storage", load);
  }, []);

  if (recent.length === 0 && favorites.length === 0) return null;

  const Chip = ({ s, fav }: { s: SavedSummoner; fav: boolean }) => (
    <div className="group flex items-center overflow-hidden rounded-full border border-white/10 bg-white/[0.03] text-xs transition-colors hover:border-frost-300/30">
      <button
        type="button"
        onClick={() => navigate(summonerHref(s), { message: `${s.gameName}#${s.tagLine} 님의 나락 기록을 불러오는 중` })}
        className="flex items-center gap-1.5 py-1.5 pl-3 pr-2 text-ink-200 hover:text-white"
      >
        <span className="font-bold text-frost-200/80">{REGIONS[s.region as RegionKey]?.short ?? s.region}</span>
        <span className="font-semibold">{s.gameName}</span>
        <span className="text-ink-400">#{s.tagLine}</span>
      </button>
      <button
        type="button"
        aria-label={fav ? "즐겨찾기 해제" : "즐겨찾기 추가"}
        onClick={() => toggleFavorite(s)}
        className={`pr-2.5 text-sm transition-colors ${fav ? "text-ember-300" : "text-ink-500 hover:text-ember-300"}`}
      >
        {fav ? "★" : "☆"}
      </button>
    </div>
  );

  return (
    <div className="w-full space-y-3 animate-fade-in">
      {favorites.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="label mr-1">즐겨찾기</span>
          {favorites.map((s) => (
            <Chip key={`f-${s.region}-${s.gameName}-${s.tagLine}`} s={s} fav />
          ))}
        </div>
      )}
      {recent.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="label mr-1">최근 검색</span>
          {recent.map((s) => (
            <Chip key={`r-${s.region}-${s.gameName}-${s.tagLine}`} s={s} fav={favorites.some((f) => f.gameName === s.gameName && f.tagLine === s.tagLine && f.region === s.region)} />
          ))}
          <button type="button" onClick={clearRecent} className="text-[11px] text-ink-500 underline-offset-2 hover:text-ink-300 hover:underline">
            지우기
          </button>
        </div>
      )}
    </div>
  );
}
