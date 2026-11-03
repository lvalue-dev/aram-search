import { RiotAccount, Summoner, Match, MatchParticipant, LeagueEntry, REGIONS, RegionKey } from "@/types/riot";
import { mockAccount, mockLeague, mockMatch, mockMatchIds, mockSummoner } from "./mock";

export class RiotApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly code: "NOT_FOUND" | "RATE_LIMIT" | "FORBIDDEN" | "NO_KEY" | "UNKNOWN") {
    super(message);
    this.name = "RiotApiError";
  }
}

export function isMockMode(): boolean {
  return process.env.MOCK_RIOT_API === "1";
}

async function riotFetch<T>(url: string): Promise<T> {
  const API_KEY = process.env.RIOT_API_KEY;
  if (!API_KEY) {
    throw new RiotApiError("RIOT_API_KEY 환경변수가 설정되지 않았습니다.", 500, "NO_KEY");
  }

  const res = await fetch(url, {
    headers: { "X-Riot-Token": API_KEY },
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) throw new RiotApiError("소환사를 찾을 수 없습니다.", 404, "NOT_FOUND");
    if (res.status === 429) throw new RiotApiError("API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.", 429, "RATE_LIMIT");
    if (res.status === 403 || res.status === 401) {
      throw new RiotApiError("API 키가 만료되었거나 유효하지 않습니다.", res.status, "FORBIDDEN");
    }
    throw new RiotApiError(`Riot API 오류 (${res.status})`, res.status, "UNKNOWN");
  }

  return res.json();
}

// ---------- 매치 슬림화 ----------
// Riot 응답의 participant 는 100개가 넘는 필드를 갖는다. 클라이언트에 필요한 것만 남긴다.
type RawParticipant = Record<string, unknown> & {
  perks?: { styles?: Array<{ description: string; style: number; selections: Array<{ perk: number }> }> };
};

function num(v: unknown): number {
  return typeof v === "number" ? v : 0;
}
function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function slimParticipant(raw: RawParticipant): MatchParticipant {
  const primary = raw.perks?.styles?.find((s) => s.description === "primaryStyle");
  const sub = raw.perks?.styles?.find((s) => s.description === "subStyle");
  return {
    puuid: str(raw.puuid),
    summonerName: str(raw.summonerName),
    riotIdGameName: str(raw.riotIdGameName),
    riotIdTagline: str(raw.riotIdTagline),
    teamId: num(raw.teamId),
    championId: num(raw.championId),
    championName: str(raw.championName),
    champLevel: num(raw.champLevel),
    kills: num(raw.kills),
    deaths: num(raw.deaths),
    assists: num(raw.assists),
    totalDamageDealtToChampions: num(raw.totalDamageDealtToChampions),
    totalDamageTaken: num(raw.totalDamageTaken),
    damageSelfMitigated: num(raw.damageSelfMitigated),
    goldEarned: num(raw.goldEarned),
    totalMinionsKilled: num(raw.totalMinionsKilled),
    neutralMinionsKilled: num(raw.neutralMinionsKilled),
    win: !!raw.win,
    item0: num(raw.item0), item1: num(raw.item1), item2: num(raw.item2), item3: num(raw.item3),
    item4: num(raw.item4), item5: num(raw.item5), item6: num(raw.item6),
    summoner1Id: num(raw.summoner1Id),
    summoner2Id: num(raw.summoner2Id),
    keystoneId: primary?.selections?.[0]?.perk ?? 0,
    secondaryStyleId: sub?.style ?? 0,
    totalHeal: num(raw.totalHeal),
    totalHealsOnTeammates: num(raw.totalHealsOnTeammates),
    totalDamageShieldedOnTeammates: num(raw.totalDamageShieldedOnTeammates),
    killingSprees: num(raw.killingSprees),
    largestKillingSpree: num(raw.largestKillingSpree),
    largestMultiKill: num(raw.largestMultiKill),
    doubleKills: num(raw.doubleKills),
    tripleKills: num(raw.tripleKills),
    quadraKills: num(raw.quadraKills),
    pentaKills: num(raw.pentaKills),
    firstBloodKill: !!raw.firstBloodKill,
    turretKills: num(raw.turretKills),
    inhibitorKills: num(raw.inhibitorKills),
    timeCCingOthers: num(raw.timeCCingOthers),
    physicalDamageDealtToChampions: num(raw.physicalDamageDealtToChampions),
    magicDamageDealtToChampions: num(raw.magicDamageDealtToChampions),
    trueDamageDealtToChampions: num(raw.trueDamageDealtToChampions),
    gameEndedInEarlySurrender: !!raw.gameEndedInEarlySurrender,
    gameEndedInSurrender: !!raw.gameEndedInSurrender,
  };
}

type RawMatch = {
  metadata: { matchId: string; participants: string[] };
  info: Record<string, unknown> & {
    participants: RawParticipant[];
    teams: Array<{ teamId: number; win: boolean; objectives: Record<string, { first: boolean; kills: number }> }>;
  };
};

function slimMatch(raw: RawMatch): Match {
  const info = raw.info;
  return {
    metadata: { matchId: raw.metadata.matchId, participants: raw.metadata.participants },
    info: {
      gameCreation: num(info.gameCreation),
      gameDuration: num(info.gameDuration),
      gameEndTimestamp: num(info.gameEndTimestamp) || undefined,
      gameMode: str(info.gameMode),
      gameVersion: str(info.gameVersion),
      mapId: num(info.mapId),
      queueId: num(info.queueId),
      platformId: str(info.platformId),
      participants: info.participants.map(slimParticipant),
      teams: (info.teams ?? []).map((t) => ({
        teamId: t.teamId,
        win: t.win,
        objectives: {
          champion: t.objectives?.champion ?? { first: false, kills: 0 },
          tower: t.objectives?.tower ?? { first: false, kills: 0 },
          inhibitor: t.objectives?.inhibitor ?? { first: false, kills: 0 },
        },
      })),
    },
  };
}

// ---------- API ----------

export async function getAccountByRiotId(gameName: string, tagLine: string, region: RegionKey = "kr"): Promise<RiotAccount> {
  if (isMockMode()) return mockAccount(gameName, tagLine);
  const { regional } = REGIONS[region];
  const url = `https://${regional}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  return riotFetch<RiotAccount>(url);
}

export async function getSummonerByPuuid(puuid: string, region: RegionKey = "kr"): Promise<Summoner> {
  if (isMockMode()) return mockSummoner(puuid);
  const { platform } = REGIONS[region];
  const url = `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`;
  return riotFetch<Summoner>(url);
}

export async function getLeagueEntries(puuid: string, region: RegionKey = "kr"): Promise<LeagueEntry[]> {
  if (isMockMode()) return mockLeague(puuid);
  const { platform } = REGIONS[region];
  const url = `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${encodeURIComponent(puuid)}`;
  return riotFetch<LeagueEntry[]>(url);
}

export async function getAramMatchIds(puuid: string, region: RegionKey = "kr", queueId: number = 450, count: number = 20, start: number = 0): Promise<string[]> {
  if (isMockMode()) return queueId === 450 ? mockMatchIds(puuid, count, start) : [];
  const { regional } = REGIONS[region];
  const url = `https://${regional}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?queue=${queueId}&start=${start}&count=${count}`;
  return riotFetch<string[]>(url);
}

export async function getMatch(matchId: string, region: RegionKey = "kr", puuid?: string): Promise<Match> {
  if (isMockMode()) return mockMatch(matchId, puuid ?? "");
  const { regional } = REGIONS[region];
  const url = `https://${regional}.api.riotgames.com/lol/match/v5/matches/${encodeURIComponent(matchId)}`;
  const raw = await riotFetch<RawMatch>(url);
  return slimMatch(raw);
}

/** 복수 매치 조회 (동시 10개씩, 실패한 매치는 제외) */
export async function getMatches(matchIds: string[], region: RegionKey = "kr", puuid?: string): Promise<Match[]> {
  const out: Match[] = [];
  const CHUNK = 10;
  for (let i = 0; i < matchIds.length; i += CHUNK) {
    const chunk = matchIds.slice(i, i + CHUNK);
    const results = await Promise.allSettled(chunk.map((id) => getMatch(id, region, puuid)));
    for (const r of results) if (r.status === "fulfilled") out.push(r.value);
  }
  return out.sort((a, b) => b.info.gameCreation - a.info.gameCreation);
}

/**
 * ARAM(450) + ARURF(900) 매치 ID 를 합산해 최신순으로 반환.
 * 참고: 아수라장(ARAM Mayhem, 1700)은 Riot 이 API 접근을 막아 조회할 수 없다.
 */
export async function getAllAramMatchIds(puuid: string, region: RegionKey = "kr", count: number = 20, start: number = 0): Promise<string[]> {
  const need = start + count;
  const [aram, urf] = await Promise.allSettled([
    getAramMatchIds(puuid, region, 450, Math.min(need, 100)),
    getAramMatchIds(puuid, region, 900, Math.min(need, 100)),
  ]);

  const aramIds = aram.status === "fulfilled" ? aram.value : [];
  const urfIds = urf.status === "fulfilled" ? urf.value : [];

  // 매치 ID 숫자 부분이 클수록 최신 게임 → 병합 후 내림차순 정렬
  const combined = Array.from(new Set([...aramIds, ...urfIds]));
  combined.sort((a, b) => Number(b.split("_")[1] ?? 0) - Number(a.split("_")[1] ?? 0));
  return combined.slice(start, start + count);
}

/** 소환사 페이지에 필요한 모든 데이터를 한 번에 가져온다 */
export async function loadSummonerProfile(gameName: string, tagLine: string, region: RegionKey, matchCount = 20) {
  const account = await getAccountByRiotId(gameName, tagLine, region);
  const [summoner, leagueEntriesRaw, matchIds] = await Promise.all([
    getSummonerByPuuid(account.puuid, region),
    getLeagueEntries(account.puuid, region).catch(() => [] as LeagueEntry[]),
    getAllAramMatchIds(account.puuid, region, matchCount),
  ]);
  const leagueEntries = Array.isArray(leagueEntriesRaw) ? leagueEntriesRaw : [];
  const matches = await getMatches(matchIds, region, account.puuid);
  return { account, summoner, leagueEntries, matchIds, matches };
}
