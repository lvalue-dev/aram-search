import { RiotAccount, Summoner, Match, MatchParticipant, LeagueEntry, REGIONS, RegionKey, ARAM_QUEUE_IDS, HOWLING_ABYSS_MAP_ID } from "@/types/riot";
import { TtlCache } from "./ttl-cache";
import { bucketFor, RateLimitWaitTooLong } from "./rate-limit";

export class RiotApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly code: "NOT_FOUND" | "RATE_LIMIT" | "FORBIDDEN" | "NO_KEY" | "UNKNOWN") {
    super(message);
    this.name = "RiotApiError";
  }
}

// ---------- 캐시 ----------
// 매치 상세는 끝난 게임이라 바뀌지 않는다 → 오래 캐시. 나머지는 짧게.
const TTL = {
  account: 10 * 60_000,
  summoner: 60_000,
  league: 60_000,
  matchIds: 30_000,
  match: 24 * 60 * 60_000,
};
const responseCache = new TtlCache<unknown>(3000);
const inflight = new Map<string, Promise<unknown>>();

/** 한 번의 호출에서 한도 때문에 기다릴 수 있는 최대 시간 */
const MAX_WAIT_MS = 10_000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function routingOf(url: string): string {
  return new URL(url).hostname.split(".")[0];
}

async function riotFetchOnce<T>(url: string): Promise<T> {
  const API_KEY = process.env.RIOT_API_KEY;
  if (!API_KEY) {
    throw new RiotApiError("RIOT_API_KEY 환경변수가 설정되지 않았습니다.", 500, "NO_KEY");
  }
  const routing = routingOf(url);
  const bucket = bucketFor(routing);

  for (let attempt = 0; ; attempt++) {
    try {
      await bucket.acquire(MAX_WAIT_MS);
    } catch (e) {
      if (e instanceof RateLimitWaitTooLong) {
        throw new RiotApiError("Riot API 요청 한도에 도달했습니다. 잠시 후 다시 시도해주세요.", 429, "RATE_LIMIT");
      }
      throw e;
    }

    const res = await fetch(url, { headers: { "X-Riot-Token": API_KEY }, cache: "no-store" });
    if (res.ok) return (await res.json()) as T;

    if (res.status === 429) {
      const retryAfter = Number(res.headers.get("Retry-After") ?? "1");
      const waitMs = (Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 1) * 1000;
      bucket.block(waitMs);
      if (attempt < 3 && waitMs <= MAX_WAIT_MS) continue;
      throw new RiotApiError("Riot API 요청 한도에 도달했습니다. 잠시 후 다시 시도해주세요.", 429, "RATE_LIMIT");
    }
    if (res.status >= 500 && attempt < 2) {
      await sleep(400 * (attempt + 1));
      continue;
    }
    if (res.status === 404) throw new RiotApiError("소환사를 찾을 수 없습니다.", 404, "NOT_FOUND");
    if (res.status === 403 || res.status === 401) {
      throw new RiotApiError("API 키가 만료되었거나 유효하지 않습니다.", res.status, "FORBIDDEN");
    }
    throw new RiotApiError(`Riot API 오류 (${res.status})`, res.status, "UNKNOWN");
  }
}

/** 캐시 + 동일 요청 합치기 + 한도 관리 + 재시도를 거치는 Riot API 호출 */
async function riotFetch<T>(url: string, ttlMs: number, options?: { fresh?: boolean }): Promise<T> {
  if (!options?.fresh) {
    const cached = responseCache.get(url);
    if (cached !== undefined) return cached as T;
  }
  const pending = inflight.get(url);
  if (pending) return pending as Promise<T>;

  const p = riotFetchOnce<T>(url)
    .then((value) => {
      responseCache.set(url, value, ttlMs);
      return value;
    })
    .finally(() => inflight.delete(url));
  inflight.set(url, p);
  return p;
}

/** 전적 갱신: 소환사의 매치 목록/레벨/랭크 캐시를 비운다 */
export function invalidateSummoner(puuid: string) {
  const enc = encodeURIComponent(puuid);
  responseCache.deleteWhere((key) => key.includes(`/by-puuid/${enc}`));
}

/** 테스트용: 캐시 비우기 */
export function clearRiotCache() {
  responseCache.clear();
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
  const { account } = REGIONS[region];
  const url = `https://${account}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  return riotFetch<RiotAccount>(url, TTL.account);
}

export async function getSummonerByPuuid(puuid: string, region: RegionKey = "kr", fresh = false): Promise<Summoner> {
  const { platform } = REGIONS[region];
  const url = `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`;
  return riotFetch<Summoner>(url, TTL.summoner, { fresh });
}

export async function getLeagueEntries(puuid: string, region: RegionKey = "kr", fresh = false): Promise<LeagueEntry[]> {
  const { platform } = REGIONS[region];
  const url = `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${encodeURIComponent(puuid)}`;
  return riotFetch<LeagueEntry[]>(url, TTL.league, { fresh });
}

export async function getAramMatchIds(puuid: string, region: RegionKey = "kr", queueId: number = 450, count: number = 20, start: number = 0, fresh = false): Promise<string[]> {
  const { regional } = REGIONS[region];
  const url = `https://${regional}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?queue=${queueId}&start=${start}&count=${count}`;
  return riotFetch<string[]>(url, TTL.matchIds, { fresh });
}

export async function getMatch(matchId: string, region: RegionKey = "kr", puuid?: string): Promise<Match> {
  const { regional } = REGIONS[region];
  const url = `https://${regional}.api.riotgames.com/lol/match/v5/matches/${encodeURIComponent(matchId)}`;
  const cached = responseCache.get(`slim:${url}`) as Match | undefined;
  if (cached) return cached;
  const raw = await riotFetch<RawMatch>(url, 0); // 원본은 크기가 커서 캐시하지 않고, 슬림화한 결과만 캐시
  const slim = slimMatch(raw);
  responseCache.set(`slim:${url}`, slim, TTL.match);
  return slim;
}

export interface MatchesResult {
  /** 최신순, 칼바람 맵 게임만 */
  matches: Match[];
  /** 불러오지 못한 매치 id (한도 초과 등) */
  failedIds: string[];
  /** 칼바람 맵이 아니라서 제외한 매치 수 */
  excluded: number;
}

/** 복수 매치 조회. 한도 관리는 riotFetch 가 맡고, 실패한 매치는 failedIds 로 알려준다. */
export async function getMatches(matchIds: string[], region: RegionKey = "kr", puuid?: string): Promise<MatchesResult> {
  const results = await Promise.allSettled(matchIds.map((id) => getMatch(id, region, puuid)));
  const matches: Match[] = [];
  const failedIds: string[] = [];
  let excluded = 0;
  results.forEach((r, i) => {
    if (r.status === "rejected") failedIds.push(matchIds[i]);
    else if (r.value.info.mapId !== HOWLING_ABYSS_MAP_ID) excluded++;
    else matches.push(r.value);
  });
  matches.sort((a, b) => b.info.gameCreation - a.info.gameCreation);
  return { matches, failedIds, excluded };
}

/** 매치 id 의 숫자 부분 (클수록 최신) */
function matchSeq(id: string): number {
  const n = Number(id.slice(id.lastIndexOf("_") + 1));
  return Number.isFinite(n) ? n : 0;
}

/**
 * 칼바람 큐들(450, 2400)의 매치 id 를 합쳐 최신순으로 start 부터 count 개 반환.
 * 큐마다 앞에서부터 start+count 개를 받아 합친 뒤 잘라야 순서가 정확하다.
 */
export async function getAllAramMatchIds(puuid: string, region: RegionKey = "kr", count: number = 20, start: number = 0, fresh = false): Promise<string[]> {
  const need = Math.min(start + count, 100);
  const lists = await Promise.allSettled(ARAM_QUEUE_IDS.map((q) => getAramMatchIds(puuid, region, q, need, 0, fresh)));
  const ok = lists.filter((r): r is PromiseFulfilledResult<string[]> => r.status === "fulfilled");
  if (ok.length === 0) {
    const first = lists[0] as PromiseRejectedResult;
    throw first.reason;
  }
  const combined = Array.from(new Set(ok.flatMap((r) => r.value)));
  combined.sort((a, b) => matchSeq(b) - matchSeq(a));
  return combined.slice(start, start + count);
}

/** 소환사 페이지에 필요한 모든 데이터를 한 번에 가져온다 */
export async function loadSummonerProfile(gameName: string, tagLine: string, region: RegionKey, matchCount = 20, options?: { fresh?: boolean }) {
  const fresh = !!options?.fresh;
  const account = await getAccountByRiotId(gameName, tagLine, region);
  const [summoner, leagueEntriesRaw, matchIds] = await Promise.all([
    getSummonerByPuuid(account.puuid, region, fresh),
    getLeagueEntries(account.puuid, region, fresh).catch(() => [] as LeagueEntry[]),
    getAllAramMatchIds(account.puuid, region, matchCount, 0, fresh),
  ]);
  const leagueEntries = Array.isArray(leagueEntriesRaw) ? leagueEntriesRaw : [];
  const { matches, failedIds, excluded } = await getMatches(matchIds, region, account.puuid);
  return { account, summoner, leagueEntries, matchIds, matches, failedIds, excluded };
}
