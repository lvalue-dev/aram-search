// Riot Account (Riot ID 기반)
export interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

// Summoner 정보
export interface Summoner {
  id: string;
  accountId: string;
  puuid: string;
  name: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

// 리그 정보 (랭크)
export interface LeagueEntry {
  leagueId: string;
  summonerId: string;
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  hotStreak: boolean;
  veteran: boolean;
  freshBlood: boolean;
  inactive: boolean;
}

// 매치 참가자 정보 (서버에서 필요한 필드만 추려서 클라이언트로 전달)
export interface MatchParticipant {
  puuid: string;
  summonerName: string;
  riotIdGameName: string;
  riotIdTagline: string;
  teamId: number;
  championId: number;
  championName: string;
  champLevel: number;
  kills: number;
  deaths: number;
  assists: number;
  totalDamageDealtToChampions: number;
  totalDamageTaken: number;
  damageSelfMitigated: number;
  goldEarned: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  win: boolean;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  summoner1Id: number;
  summoner2Id: number;
  /** 핵심 룬(keystone) perk id */
  keystoneId: number;
  /** 보조 룬 스타일 id */
  secondaryStyleId: number;
  totalHeal: number;
  totalHealsOnTeammates: number;
  totalDamageShieldedOnTeammates: number;
  killingSprees: number;
  largestKillingSpree: number;
  largestMultiKill: number;
  doubleKills: number;
  tripleKills: number;
  quadraKills: number;
  pentaKills: number;
  firstBloodKill: boolean;
  turretKills: number;
  inhibitorKills: number;
  timeCCingOthers: number;
  physicalDamageDealtToChampions: number;
  magicDamageDealtToChampions: number;
  trueDamageDealtToChampions: number;
  gameEndedInEarlySurrender?: boolean;
  gameEndedInSurrender?: boolean;
}

export interface MatchTeam {
  teamId: number;
  win: boolean;
  objectives: {
    champion: { first: boolean; kills: number };
    tower: { first: boolean; kills: number };
    inhibitor: { first: boolean; kills: number };
  };
}

// 매치 정보
export interface Match {
  metadata: {
    matchId: string;
    participants: string[];
  };
  info: {
    gameCreation: number;
    gameDuration: number;
    gameEndTimestamp?: number;
    gameMode: string;
    gameVersion: string;
    mapId: number;
    queueId: number;
    platformId: string;
    participants: MatchParticipant[];
    teams: MatchTeam[];
  };
}

// 챔피언 통계 (집계)
export interface ChampionStats {
  championId: number;
  championName: string;
  games: number;
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
  totalDamage: number;
  totalDamageTaken: number;
  totalGold: number;
  pentaKills: number;
  quadraKills: number;
  tripleKills: number;
  scoreSum: number;
}

export interface MatchRecord {
  matchId: string;
  championName: string;
  value: number;
  gameCreation: number;
  win: boolean;
}

// 소환사 종합 통계
export interface SummonerStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  avgKDA: number;
  avgDamage: number;
  avgDamageTaken: number;
  avgGold: number;
  avgKillParticipation: number;
  avgDuration: number;
  avgScore: number;
  /** 양수 = 연승, 음수 = 연패 */
  streak: number;
  /** 최신순 최근 결과 (최대 10개) */
  recentForm: boolean[];
  mvpCount: number;
  aceCount: number;
  multiKills: {
    double: number;
    triple: number;
    quadra: number;
    penta: number;
  };
  damageSplit: {
    physical: number;
    magic: number;
    trueDmg: number;
  };
  durationBuckets: Array<{
    label: string;
    games: number;
    wins: number;
  }>;
  records: {
    mostKills: MatchRecord | null;
    mostDamage: MatchRecord | null;
    bestKda: MatchRecord | null;
    longestGame: MatchRecord | null;
  };
  championStats: ChampionStats[];
}

/** 데이터 드래곤 기반 에셋 메타데이터 (필요한 항목만 부분 전달) */
export interface AssetBundle {
  version: string;
  /** 영문 챔피언 id -> 한글 이름 */
  champions: Record<string, string>;
  /** 아이템 id -> 이름/설명 */
  items: Record<number, { name: string; plaintext: string }>;
  /** 스펠 숫자 key -> { id, name } */
  spells: Record<number, { id: string; name: string }>;
  /** 룬 id -> { name, icon } (icon: ddragon img 경로) */
  runes: Record<number, { name: string; icon: string }>;
}

// 큐 타입 상수
export const ARAM_QUEUE_IDS = [450, 900] as const;
export type AramQueueId = (typeof ARAM_QUEUE_IDS)[number];

export const QUEUE_NAMES: Record<number, string> = {
  450: "칼바람 나락",
  900: "칼바람 URF",
  1700: "아수라장",
};

// 지역 설정
export const REGIONS = {
  kr: { platform: "kr", regional: "asia", name: "한국", short: "KR", defaultTag: "KR1" },
  jp1: { platform: "jp1", regional: "asia", name: "일본", short: "JP", defaultTag: "JP1" },
  na1: { platform: "na1", regional: "americas", name: "북미", short: "NA", defaultTag: "NA1" },
  br1: { platform: "br1", regional: "americas", name: "브라질", short: "BR", defaultTag: "BR1" },
  euw1: { platform: "euw1", regional: "europe", name: "서유럽", short: "EUW", defaultTag: "EUW" },
  eun1: { platform: "eun1", regional: "europe", name: "동유럽", short: "EUNE", defaultTag: "EUNE" },
  oc1: { platform: "oc1", regional: "sea", name: "오세아니아", short: "OCE", defaultTag: "OCE" },
} as const;

export type RegionKey = keyof typeof REGIONS;

export function isRegionKey(value: string): value is RegionKey {
  return Object.prototype.hasOwnProperty.call(REGIONS, value);
}
