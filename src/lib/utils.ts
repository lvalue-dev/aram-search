import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ChampionStats, Match, MatchParticipant, MatchRecord, SummonerStats } from "@/types/riot";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---------- 기본 포맷터 ----------

export function calcKDA(kills: number, deaths: number, assists: number): string {
  if (deaths === 0) return "Perfect";
  return ((kills + assists) / deaths).toFixed(2);
}

export function kdaValue(kills: number, deaths: number, assists: number): number {
  return (kills + assists) / Math.max(deaths, 1);
}

export function calcKillParticipation(participant: MatchParticipant, teamKills: number): number {
  if (teamKills === 0) return 0;
  return Math.round(((participant.kills + participant.assists) / teamKills) * 100);
}

export function getTeamKills(match: Match, teamId: number): number {
  return match.info.participants.filter((p) => p.teamId === teamId).reduce((sum, p) => sum + p.kills, 0);
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}분 ${s.toString().padStart(2, "0")}초`;
}

export function formatDurationShort(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatRelative(timestamp: number, now: number = Date.now()): string {
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  if (days < 30) return `${Math.floor(days / 7)}주 전`;
  return new Date(timestamp).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return Math.round(n).toString();
}

export function formatComma(n: number): string {
  return Math.round(n).toLocaleString("ko-KR");
}

export function getParticipant(match: Match, puuid: string): MatchParticipant | undefined {
  return match.info.participants.find((p) => p.puuid === puuid);
}

export function participantItems(p: MatchParticipant): number[] {
  return [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6];
}

export function displayName(p: MatchParticipant): string {
  return p.riotIdGameName || p.summonerName || "알 수 없음";
}

/** 게임이 5분 안에 다시하기로 끝났는지 */
export function isRemake(match: Match): boolean {
  return match.info.gameDuration < 300 || !!match.info.participants[0]?.gameEndedInEarlySurrender;
}

// ---------- 티어 ----------

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

export const TIER_KR: Record<string, string> = {
  IRON: "아이언",
  BRONZE: "브론즈",
  SILVER: "실버",
  GOLD: "골드",
  PLATINUM: "플래티넘",
  EMERALD: "에메랄드",
  DIAMOND: "다이아몬드",
  MASTER: "마스터",
  GRANDMASTER: "그랜드마스터",
  CHALLENGER: "챌린저",
};

export const RANK_KR: Record<string, string> = { I: "1", II: "2", III: "3", IV: "4" };

export function getTierColor(tier: string): string {
  return TIER_COLORS[tier?.toUpperCase()] ?? "#8b93a7";
}

// ---------- 나락 점수 (ARAM Score) ----------

export interface ScoreEntry {
  score: number;
  rank: number;
  badge: "MVP" | "ACE" | null;
}

/**
 * 매치 내 10명의 기여도를 0~10 점으로 환산한다.
 * KDA, 팀 내 딜 비중, 킬 관여, 받은 피해 비중, 아군 치유/보호막, CC 를 가중 합산.
 */
export function calcMatchScores(match: Match): Record<string, ScoreEntry> {
  const result: Record<string, ScoreEntry> = {};
  const participants = match.info.participants;
  if (participants.length === 0) return result;

  const teamTotals = new Map<number, { dmg: number; taken: number; heal: number; cc: number; kills: number }>();
  for (const p of participants) {
    const t = teamTotals.get(p.teamId) ?? { dmg: 0, taken: 0, heal: 0, cc: 0, kills: 0 };
    t.dmg += p.totalDamageDealtToChampions;
    t.taken += p.totalDamageTaken;
    t.heal += (p.totalHealsOnTeammates ?? 0) + (p.totalDamageShieldedOnTeammates ?? 0);
    t.cc += p.timeCCingOthers ?? 0;
    t.kills += p.kills;
    teamTotals.set(p.teamId, t);
  }

  const raw = participants.map((p) => {
    const t = teamTotals.get(p.teamId)!;
    const teamSize = participants.filter((x) => x.teamId === p.teamId).length || 5;
    const share = (v: number, total: number) => (total > 0 ? (v / total) * teamSize : 1); // 1 = 평균
    const kda = Math.min(kdaValue(p.kills, p.deaths, p.assists), 12) / 12;
    const kp = t.kills > 0 ? (p.kills + p.assists) / t.kills : 0;
    const dmg = share(p.totalDamageDealtToChampions, t.dmg);
    const taken = share(p.totalDamageTaken, t.taken);
    const heal = share((p.totalHealsOnTeammates ?? 0) + (p.totalDamageShieldedOnTeammates ?? 0), t.heal);
    const cc = share(p.timeCCingOthers ?? 0, t.cc);

    const base =
      kda * 3.2 +
      Math.min(dmg, 2.5) * 1.6 +
      kp * 2 +
      Math.min(taken, 2.5) * 0.7 +
      Math.min(heal, 2.5) * 0.6 +
      Math.min(cc, 2.5) * 0.4 +
      (p.win ? 0.8 : 0);
    const score = Math.max(0, Math.min(10, Math.round(base * 10) / 10));
    return { puuid: p.puuid, score, teamId: p.teamId, win: p.win };
  });

  const sorted = [...raw].sort((a, b) => b.score - a.score);
  const winTop = sorted.find((r) => r.win);
  const loseTop = sorted.find((r) => !r.win);

  sorted.forEach((r, i) => {
    result[r.puuid] = {
      score: r.score,
      rank: i + 1,
      badge: r === winTop ? "MVP" : r === loseTop ? "ACE" : null,
    };
  });
  return result;
}

export function scoreTone(score: number): "legend" | "great" | "good" | "normal" | "bad" {
  if (score >= 8.5) return "legend";
  if (score >= 7) return "great";
  if (score >= 5.5) return "good";
  if (score >= 4) return "normal";
  return "bad";
}

export function kdaTone(kda: number | "Perfect"): "perfect" | "great" | "good" | "normal" | "bad" {
  if (kda === "Perfect") return "perfect";
  if (kda >= 5) return "great";
  if (kda >= 3) return "good";
  if (kda >= 2) return "normal";
  return "bad";
}

// ---------- 종합 통계 ----------

const DURATION_BUCKETS = [
  { label: "15분 미만", min: 0, max: 15 * 60 },
  { label: "15 ~ 20분", min: 15 * 60, max: 20 * 60 },
  { label: "20 ~ 25분", min: 20 * 60, max: 25 * 60 },
  { label: "25분 이상", min: 25 * 60, max: Infinity },
];

function emptyStats(): SummonerStats {
  return {
    totalGames: 0,
    perfectKda: false,
    wins: 0,
    losses: 0,
    winRate: 0,
    avgKills: 0,
    avgDeaths: 0,
    avgAssists: 0,
    avgKDA: 0,
    avgDamage: 0,
    avgDamageTaken: 0,
    avgGold: 0,
    avgKillParticipation: 0,
    avgDuration: 0,
    avgScore: 0,
    streak: 0,
    recentForm: [],
    mvpCount: 0,
    aceCount: 0,
    multiKills: { double: 0, triple: 0, quadra: 0, penta: 0 },
    damageSplit: { physical: 0, magic: 0, trueDmg: 0 },
    durationBuckets: DURATION_BUCKETS.map((b) => ({ label: b.label, games: 0, wins: 0 })),
    records: { mostKills: null, mostDamage: null, bestKda: null, longestGame: null },
    championStats: [],
  };
}

export function calcSummonerStats(matches: Match[], puuid: string): SummonerStats {
  const sorted = [...matches].sort((a, b) => b.info.gameCreation - a.info.gameCreation);
  const rows = sorted
    .map((m) => ({ match: m, p: getParticipant(m, puuid) }))
    .filter((r): r is { match: Match; p: MatchParticipant } => !!r.p && !isRemake(r.match));

  if (rows.length === 0) return emptyStats();

  const stats = emptyStats();
  const n = rows.length;
  let kills = 0, deaths = 0, assists = 0, dmg = 0, taken = 0, gold = 0, kp = 0, dur = 0, scoreSum = 0;
  const champMap = new Map<string, ChampionStats>();

  const makeRecord = (match: Match, p: MatchParticipant, value: number): MatchRecord => ({
    matchId: match.metadata.matchId,
    championName: p.championName,
    value,
    gameCreation: match.info.gameCreation,
    win: p.win,
  });

  rows.forEach(({ match, p }, idx) => {
    const scores = calcMatchScores(match);
    const mine = scores[p.puuid];
    if (mine?.badge === "MVP") stats.mvpCount++;
    if (mine?.badge === "ACE") stats.aceCount++;
    scoreSum += mine?.score ?? 0;

    kills += p.kills;
    deaths += p.deaths;
    assists += p.assists;
    dmg += p.totalDamageDealtToChampions;
    taken += p.totalDamageTaken;
    gold += p.goldEarned;
    dur += match.info.gameDuration;
    kp += calcKillParticipation(p, getTeamKills(match, p.teamId));

    stats.multiKills.double += p.doubleKills;
    stats.multiKills.triple += p.tripleKills;
    stats.multiKills.quadra += p.quadraKills;
    stats.multiKills.penta += p.pentaKills;

    stats.damageSplit.physical += p.physicalDamageDealtToChampions;
    stats.damageSplit.magic += p.magicDamageDealtToChampions;
    stats.damageSplit.trueDmg += p.trueDamageDealtToChampions;

    const bucket = DURATION_BUCKETS.findIndex((b) => match.info.gameDuration >= b.min && match.info.gameDuration < b.max);
    if (bucket >= 0) {
      stats.durationBuckets[bucket].games++;
      if (p.win) stats.durationBuckets[bucket].wins++;
    }

    if (idx < 10) stats.recentForm.push(p.win);

    if (!stats.records.mostKills || p.kills > stats.records.mostKills.value) stats.records.mostKills = makeRecord(match, p, p.kills);
    if (!stats.records.mostDamage || p.totalDamageDealtToChampions > stats.records.mostDamage.value)
      stats.records.mostDamage = makeRecord(match, p, p.totalDamageDealtToChampions);
    const kdaV = kdaValue(p.kills, p.deaths, p.assists);
    if (!stats.records.bestKda || kdaV > stats.records.bestKda.value) stats.records.bestKda = makeRecord(match, p, Math.round(kdaV * 100) / 100);
    if (!stats.records.longestGame || match.info.gameDuration > stats.records.longestGame.value)
      stats.records.longestGame = makeRecord(match, p, match.info.gameDuration);

    const existing = champMap.get(p.championName) ?? {
      championId: p.championId,
      championName: p.championName,
      games: 0, wins: 0, kills: 0, deaths: 0, assists: 0,
      totalDamage: 0, totalDamageTaken: 0, totalGold: 0,
      pentaKills: 0, quadraKills: 0, tripleKills: 0, scoreSum: 0,
    };
    champMap.set(p.championName, {
      ...existing,
      games: existing.games + 1,
      wins: existing.wins + (p.win ? 1 : 0),
      kills: existing.kills + p.kills,
      deaths: existing.deaths + p.deaths,
      assists: existing.assists + p.assists,
      totalDamage: existing.totalDamage + p.totalDamageDealtToChampions,
      totalDamageTaken: existing.totalDamageTaken + p.totalDamageTaken,
      totalGold: existing.totalGold + p.goldEarned,
      pentaKills: existing.pentaKills + p.pentaKills,
      quadraKills: existing.quadraKills + p.quadraKills,
      tripleKills: existing.tripleKills + p.tripleKills,
      scoreSum: existing.scoreSum + (mine?.score ?? 0),
    });
  });

  // 연승/연패 (최신순)
  const first = rows[0].p.win;
  let streak = 0;
  for (const { p } of rows) {
    if (p.win === first) streak++;
    else break;
  }

  const wins = rows.filter((r) => r.p.win).length;
  const r1 = (v: number) => Math.round(v * 10) / 10;

  return {
    ...stats,
    totalGames: n,
    perfectKda: deaths === 0,
    wins,
    losses: n - wins,
    winRate: Math.round((wins / n) * 100),
    avgKills: r1(kills / n),
    avgDeaths: r1(deaths / n),
    avgAssists: r1(assists / n),
    avgKDA: deaths === 0 ? kills + assists : Math.round(((kills + assists) / deaths) * 100) / 100,
    avgDamage: Math.round(dmg / n),
    avgDamageTaken: Math.round(taken / n),
    avgGold: Math.round(gold / n),
    avgKillParticipation: Math.round(kp / n),
    avgDuration: Math.round(dur / n),
    avgScore: r1(scoreSum / n),
    streak: first ? streak : -streak,
    championStats: Array.from(champMap.values()).sort((a, b) => b.games - a.games || b.wins - a.wins),
  };
}
