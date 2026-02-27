import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Match, MatchParticipant, ChampionStats, SummonerStats } from "@/types/riot";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Data Dragon 이미지 URL 생성
const DD_BASE = "https://ddragon.leagueoflegends.com";
const DD_VERSION = "14.13.1"; // 최신 패치 버전으로 갱신 필요

export function getChampionImageUrl(championName: string): string {
  return `${DD_BASE}/cdn/${DD_VERSION}/img/champion/${championName}.png`;
}

export function getProfileIconUrl(iconId: number): string {
  return `${DD_BASE}/cdn/${DD_VERSION}/img/profileicon/${iconId}.png`;
}

export function getItemImageUrl(itemId: number): string {
  if (!itemId || itemId === 0) return "";
  return `${DD_BASE}/cdn/${DD_VERSION}/img/item/${itemId}.png`;
}

export function getSpellImageUrl(spellId: number): string {
  // SummonerSpell 이미지는 id -> key 매핑이 필요하지만,
  // Community Dragon에서 id로 직접 조회 가능
  return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/data/spells/icons2d/${spellId}.png`;
}

// KDA 계산
export function calcKDA(kills: number, deaths: number, assists: number): string {
  if (deaths === 0) return "Perfect";
  return ((kills + assists) / deaths).toFixed(2);
}

// 킬 관여율 계산
export function calcKillParticipation(
  participant: MatchParticipant,
  teamKills: number
): number {
  if (teamKills === 0) return 0;
  return Math.round(((participant.kills + participant.assists) / teamKills) * 100);
}

// 팀 킬 합산
export function getTeamKills(match: Match, teamId: number): number {
  return match.info.participants
    .filter((p) => p.teamId === teamId)
    .reduce((sum, p) => sum + p.kills, 0);
}

// 게임 시간 포맷 (초 -> mm:ss)
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}분 ${s.toString().padStart(2, "0")}초`;
}

// 날짜 포맷
export function formatDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return new Date(timestamp).toLocaleDateString("ko-KR");
}

// 숫자 천 단위 포맷
export function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

// 매치에서 특정 PUUID의 참가자 찾기
export function getParticipant(
  match: Match,
  puuid: string
): MatchParticipant | undefined {
  return match.info.participants.find((p) => p.puuid === puuid);
}

// 티어 색상
export const TIER_COLORS: Record<string, string> = {
  IRON: "#8d7163",
  BRONZE: "#a97444",
  SILVER: "#9daab5",
  GOLD: "#f0b73e",
  PLATINUM: "#3cbf9c",
  EMERALD: "#18c07a",
  DIAMOND: "#4a80c4",
  MASTER: "#9d48e0",
  GRANDMASTER: "#e84057",
  CHALLENGER: "#f5a623",
};

export function getTierColor(tier: string): string {
  return TIER_COLORS[tier?.toUpperCase()] ?? "#888";
}

// 매치 목록으로 통계 계산
export function calcSummonerStats(
  matches: Match[],
  puuid: string
): SummonerStats {
  const participants = matches
    .map((m) => getParticipant(m, puuid))
    .filter((p): p is MatchParticipant => !!p);

  if (participants.length === 0) {
    return {
      totalGames: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      avgKills: 0,
      avgDeaths: 0,
      avgAssists: 0,
      avgKDA: 0,
      avgDamage: 0,
      championStats: [],
    };
  }

  const wins = participants.filter((p) => p.win).length;
  const totalKills = participants.reduce((s, p) => s + p.kills, 0);
  const totalDeaths = participants.reduce((s, p) => s + p.deaths, 0);
  const totalAssists = participants.reduce((s, p) => s + p.assists, 0);
  const totalDamage = participants.reduce(
    (s, p) => s + p.totalDamageDealtToChampions,
    0
  );

  // 챔피언별 통계
  const champMap = new Map<string, ChampionStats>();
  participants.forEach((p) => {
    const key = p.championName;
    const existing = champMap.get(key) ?? {
      championId: p.championId,
      championName: p.championName,
      games: 0,
      wins: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
      totalDamage: 0,
      pentaKills: 0,
    };
    champMap.set(key, {
      ...existing,
      games: existing.games + 1,
      wins: existing.wins + (p.win ? 1 : 0),
      kills: existing.kills + p.kills,
      deaths: existing.deaths + p.deaths,
      assists: existing.assists + p.assists,
      totalDamage: existing.totalDamage + p.totalDamageDealtToChampions,
      pentaKills: existing.pentaKills + p.pentaKills,
    });
  });

  const championStats = Array.from(champMap.values()).sort(
    (a, b) => b.games - a.games
  );

  const n = participants.length;
  const avgDeaths = totalDeaths / n;

  return {
    totalGames: n,
    wins,
    losses: n - wins,
    winRate: Math.round((wins / n) * 100),
    avgKills: Math.round((totalKills / n) * 10) / 10,
    avgDeaths: Math.round(avgDeaths * 10) / 10,
    avgAssists: Math.round((totalAssists / n) * 10) / 10,
    avgKDA:
      avgDeaths === 0
        ? totalKills + totalAssists
        : Math.round(((totalKills + totalAssists) / (avgDeaths * n)) * 100) / 100,
    avgDamage: Math.round(totalDamage / n),
    championStats,
  };
}
