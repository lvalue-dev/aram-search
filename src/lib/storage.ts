"use client";

/** 브라우저 localStorage 기반 최근 검색 / 즐겨찾기 */

export interface SavedSummoner {
  region: string;
  gameName: string;
  tagLine: string;
  /** 마지막 조회 시각 */
  at: number;
  profileIconId?: number;
}

const RECENT_KEY = "aram.recent.v1";
const FAV_KEY = "aram.favorites.v1";
const MAX_RECENT = 8;

function read(key: string): SavedSummoner[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(key: string, list: SavedSummoner[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("aram-storage", { detail: key }));
  } catch {
    /* ignore quota / private mode */
  }
}

export function sameSummoner(a: SavedSummoner, b: SavedSummoner): boolean {
  return (
    a.region === b.region &&
    a.gameName.toLowerCase() === b.gameName.toLowerCase() &&
    a.tagLine.toLowerCase() === b.tagLine.toLowerCase()
  );
}

export function getRecent(): SavedSummoner[] {
  return read(RECENT_KEY).sort((a, b) => b.at - a.at);
}

export function pushRecent(entry: Omit<SavedSummoner, "at">) {
  const list = read(RECENT_KEY).filter((s) => !sameSummoner(s, { ...entry, at: 0 }));
  list.unshift({ ...entry, at: Date.now() });
  write(RECENT_KEY, list.slice(0, MAX_RECENT));
}

export function removeRecent(entry: SavedSummoner) {
  write(
    RECENT_KEY,
    read(RECENT_KEY).filter((s) => !sameSummoner(s, entry))
  );
}

export function clearRecent() {
  write(RECENT_KEY, []);
}

export function getFavorites(): SavedSummoner[] {
  return read(FAV_KEY);
}

export function isFavorite(entry: Omit<SavedSummoner, "at">): boolean {
  return read(FAV_KEY).some((s) => sameSummoner(s, { ...entry, at: 0 }));
}

export function toggleFavorite(entry: Omit<SavedSummoner, "at">): boolean {
  const list = read(FAV_KEY);
  const exists = list.some((s) => sameSummoner(s, { ...entry, at: 0 }));
  const next = exists
    ? list.filter((s) => !sameSummoner(s, { ...entry, at: 0 }))
    : [{ ...entry, at: Date.now() }, ...list].slice(0, 20);
  write(FAV_KEY, next);
  return !exists;
}

export function summonerHref(s: Pick<SavedSummoner, "region" | "gameName" | "tagLine">): string {
  return `/${s.region}/${encodeURIComponent(s.gameName)}-${encodeURIComponent(s.tagLine)}`;
}
