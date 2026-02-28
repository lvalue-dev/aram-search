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

// 매치 참가자 정보
export interface MatchParticipant {
  puuid: string;
  summonerId: string;
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
  perks: {
    statPerks: {
      defense: number;
      flex: number;
      offense: number;
    };
    styles: Array<{
      description: string;
      selections: Array<{
        perk: number;
        var1: number;
        var2: number;
        var3: number;
      }>;
      style: number;
    }>;
  };
  // ARAM specific stats
  totalHeal: number;
  totalHealsOnTeammates: number;
  damageSelfMitigated: number;
  killingSprees: number;
  largestKillingSpree: number;
  largestMultiKill: number;
  doubleKills: number;
  tripleKills: number;
  quadraKills: number;
  pentaKills: number;
  firstBloodKill: boolean;
  firstBloodAssist: boolean;
  turretKills: number;
  inhibitorKills: number;
  timeCCingOthers: number;
  visionScore: number;
  physicalDamageDealtToChampions: number;
  magicDamageDealtToChampions: number;
  trueDamageDealtToChampions: number;
}

// 매치 정보
export interface Match {
  metadata: {
    dataVersion: string;
    matchId: string;
    participants: string[];
  };
  info: {
    gameCreation: number;
    gameDuration: number;
    gameId: number;
    gameMode: string;
    gameName: string;
    gameStartTimestamp: number;
    gameType: string;
    gameVersion: string;
    mapId: number;
    participants: MatchParticipant[];
    platformId: string;
    queueId: number;
    teams: Array<{
      bans: Array<{ championId: number; pickTurn: number }>;
      objectives: {
        baron: { first: boolean; kills: number };
        champion: { first: boolean; kills: number };
        dragon: { first: boolean; kills: number };
        inhibitor: { first: boolean; kills: number };
        riftHerald: { first: boolean; kills: number };
        tower: { first: boolean; kills: number };
      };
      teamId: number;
      win: boolean;
    }>;
    tournamentCode?: string;
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
  pentaKills: number;
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
  championStats: ChampionStats[];
}

// 큐 타입 상수
export const ARAM_QUEUE_IDS = [450, 900, 1700] as const;
export type AramQueueId = (typeof ARAM_QUEUE_IDS)[number];

export const QUEUE_NAMES: Record<number, string> = {
  450: "칼바람 나락",
  900: "칼바람 URF",
  1700: "아수라장",
};

// 지역 설정
export const REGIONS = {
  kr: { platform: "kr", regional: "asia", name: "한국" },
  na1: { platform: "na1", regional: "americas", name: "북미" },
  euw1: { platform: "euw1", regional: "europe", name: "서유럽" },
  eun1: { platform: "eun1", regional: "europe", name: "동유럽" },
  jp1: { platform: "jp1", regional: "asia", name: "일본" },
} as const;

export type RegionKey = keyof typeof REGIONS;
