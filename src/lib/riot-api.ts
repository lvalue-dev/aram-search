import { RiotAccount, Summoner, Match, LeagueEntry, REGIONS, RegionKey } from "@/types/riot";

async function riotFetch<T>(url: string): Promise<T> {
  const API_KEY = process.env.RIOT_API_KEY;
  if (!API_KEY) {
    throw new Error("RIOT_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  const res = await fetch(url, {
    headers: {
      "X-Riot-Token": API_KEY,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error("소환사를 찾을 수 없습니다.");
    if (res.status === 429) throw new Error("API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.");
    if (res.status === 403) {
      const body = await res.text().catch(() => "");
      throw new Error(`API 키가 유효하지 않습니다. (URL: ${url.split("riotgames.com")[1]?.split("?")[0] ?? url}, 응답: ${body.slice(0, 100)})`);
    }
    throw new Error(`API 오류: ${res.status}`);
  }

  return res.json();
}

// Riot ID (닉네임#태그) 로 계정 조회
export async function getAccountByRiotId(
  gameName: string,
  tagLine: string,
  region: RegionKey = "kr"
): Promise<RiotAccount> {
  const { regional } = REGIONS[region];
  const url = `https://${regional}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  return riotFetch<RiotAccount>(url);
}

// PUUID로 소환사 정보 조회
export async function getSummonerByPuuid(
  puuid: string,
  region: RegionKey = "kr"
): Promise<Summoner> {
  const { platform } = REGIONS[region];
  const url = `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`;
  return riotFetch<Summoner>(url);
}

// 소환사 랭크 정보 조회 (PUUID 기반)
export async function getLeagueEntries(
  puuid: string,
  region: RegionKey = "kr"
): Promise<LeagueEntry[]> {
  const { platform } = REGIONS[region];
  const url = `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${encodeURIComponent(puuid)}`;
  return riotFetch<LeagueEntry[]>(url);
}

// ARAM 매치 ID 목록 조회
export async function getAramMatchIds(
  puuid: string,
  region: RegionKey = "kr",
  queueId: number = 450,
  count: number = 20,
  start: number = 0
): Promise<string[]> {
  const { regional } = REGIONS[region];
  const url = `https://${regional}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?queue=${queueId}&start=${start}&count=${count}`;
  return riotFetch<string[]>(url);
}

// 매치 상세 정보 조회
export async function getMatch(
  matchId: string,
  region: RegionKey = "kr"
): Promise<Match> {
  const { regional } = REGIONS[region];
  const url = `https://${regional}.api.riotgames.com/lol/match/v5/matches/${encodeURIComponent(matchId)}`;
  return riotFetch<Match>(url);
}

// 복수 매치 조회 (병렬)
export async function getMatches(
  matchIds: string[],
  region: RegionKey = "kr"
): Promise<Match[]> {
  const promises = matchIds.map((id) => getMatch(id, region));
  const results = await Promise.allSettled(promises);
  return results
    .filter((r): r is PromiseFulfilledResult<Match> => r.status === "fulfilled")
    .map((r) => r.value);
}

// 두 큐(450, 900) 모두의 매치 ID 조회 후 합산
export async function getAllAramMatchIds(
  puuid: string,
  region: RegionKey = "kr",
  count: number = 20
): Promise<string[]> {
  const [aram, urf] = await Promise.allSettled([
    getAramMatchIds(puuid, region, 450, count),
    getAramMatchIds(puuid, region, 900, count),
  ]);

  const aramIds = aram.status === "fulfilled" ? aram.value : [];
  const urfIds = urf.status === "fulfilled" ? urf.value : [];

  // 합산 후 중복 제거, 최신순 정렬 (matchId는 타임스탬프 포함)
  const combined = Array.from(new Set([...aramIds, ...urfIds]));
  return combined.slice(0, count);
}
