import { LeagueEntry, Match, MatchParticipant, RiotAccount, Summoner } from "@/types/riot";

/**
 * 데모(목) 데이터 생성기.
 * `MOCK_RIOT_API=1` 환경변수에서만 사용되며 Riot API 없이 UI를 확인할 때 쓴다.
 * puuid(=닉네임) 기반 시드로 결정적인 데이터를 만든다.
 */

const CHAMPS = [
  "Ahri", "Ashe", "Blitzcrank", "Brand", "Caitlyn", "Ezreal", "Jhin", "Jinx", "Karthus", "KogMaw",
  "Lux", "Malzahar", "MissFortune", "Morgana", "Nautilus", "Seraphine", "Sona", "Swain", "Teemo",
  "Varus", "Veigar", "Velkoz", "Xerath", "Yasuo", "Ziggs", "Zyra", "Thresh", "Leona", "Garen", "Darius",
];
const ITEMS = [3031, 3089, 6655, 3157, 3153, 3078, 3065, 3068, 3047, 3006, 3020, 3111, 3094, 3072, 6672, 3036, 3135, 4645, 3116, 3102, 3190, 3107, 2065, 3504, 6653, 3100, 3115];
const SPELLS = [4, 32, 7, 14, 3, 21, 1, 6];
const KEYSTONES = [8005, 8008, 8010, 8021, 8112, 8128, 9923, 8214, 8229, 8230, 8437, 8439, 8465, 8351, 8360, 8369];
const STYLES = [8000, 8100, 8200, 8300, 8400];
const NAMES = ["눈보라", "얼음송곳", "포로간식", "다리위사냥꾼", "나락의지배자", "눈사람", "프렐요드", "서리칼날", "앱솔루트제로", "빙하기", "티버", "세주아니팬"];

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mockAccount(gameName: string, tagLine: string): RiotAccount {
  return { puuid: `mock-${gameName}-${tagLine}`, gameName, tagLine };
}

export function mockSummoner(puuid: string): Summoner {
  const rnd = mulberry32(hash(puuid));
  return {
    id: `id-${puuid}`,
    accountId: `acc-${puuid}`,
    puuid,
    name: puuid,
    profileIconId: 5000 + Math.floor(rnd() * 400),
    revisionDate: Date.now() - 3600_000,
    summonerLevel: 100 + Math.floor(rnd() * 700),
  };
}

export function mockLeague(puuid: string): LeagueEntry[] {
  const rnd = mulberry32(hash(puuid + "league"));
  const tiers = ["SILVER", "GOLD", "PLATINUM", "EMERALD", "DIAMOND"];
  const tier = tiers[Math.floor(rnd() * tiers.length)];
  const wins = 40 + Math.floor(rnd() * 120);
  return [
    {
      leagueId: "mock",
      summonerId: `id-${puuid}`,
      queueType: "RANKED_SOLO_5x5",
      tier,
      rank: ["I", "II", "III", "IV"][Math.floor(rnd() * 4)],
      leaguePoints: Math.floor(rnd() * 100),
      wins,
      losses: Math.floor(wins * (0.7 + rnd() * 0.6)),
      hotStreak: rnd() > 0.7,
      veteran: false,
      freshBlood: false,
      inactive: false,
    },
  ];
}

/** 데모 데이터임을 알 수 있도록 팀원 이름 목록을 내보낸다 */
export const MOCK_NAMES = NAMES;

export function mockMatchIds(puuid: string, count: number, start = 0): string[] {
  const total = 63; // 가짜 총 게임 수
  const base = (hash(puuid) % 100000) * 1000;
  const ids: string[] = [];
  // 숫자가 클수록 최신 게임 (실제 Riot 매치 id 와 같은 규칙)
  for (let i = start; i < Math.min(start + count, total); i++) ids.push(`KR_${base + 999 - i}`);
  return ids;
}

function participant(rnd: () => number, teamId: number, win: number, idx: number, puuid: string | null, duration: number): MatchParticipant {
  const champ = CHAMPS[Math.floor(rnd() * CHAMPS.length)];
  const scale = duration / 1200; // 20분 기준
  const kills = Math.floor(rnd() * 14 * scale * (win ? 1.3 : 0.8));
  const deaths = Math.floor(rnd() * 10 * scale * (win ? 0.8 : 1.3)) + (rnd() > 0.85 ? 0 : 1);
  const assists = Math.floor(rnd() * 25 * scale);
  const dmg = Math.floor((12000 + rnd() * 40000) * scale);
  const phys = rnd();
  const name = puuid ? puuid.replace(/^mock-/, "").split("-")[0] : NAMES[Math.floor(rnd() * NAMES.length)];
  const pick = () => ITEMS[Math.floor(rnd() * ITEMS.length)];
  const multi = rnd();
  return {
    puuid: puuid ?? `mock-p-${idx}-${Math.floor(rnd() * 1e6)}`,
    summonerName: name,
    riotIdGameName: name,
    riotIdTagline: "KR1",
    teamId,
    championId: 1 + Math.floor(rnd() * 160),
    championName: champ,
    champLevel: 12 + Math.floor(rnd() * 7),
    kills,
    deaths,
    assists,
    totalDamageDealtToChampions: dmg,
    totalDamageTaken: Math.floor((10000 + rnd() * 35000) * scale),
    damageSelfMitigated: Math.floor(rnd() * 30000 * scale),
    goldEarned: Math.floor((9000 + rnd() * 8000) * scale),
    totalMinionsKilled: Math.floor(rnd() * 90 * scale),
    neutralMinionsKilled: 0,
    win: !!win,
    item0: pick(), item1: pick(), item2: pick(), item3: pick(), item4: rnd() > 0.3 ? pick() : 0, item5: rnd() > 0.5 ? pick() : 0,
    item6: rnd() > 0.5 ? 2052 : 0,
    summoner1Id: SPELLS[Math.floor(rnd() * SPELLS.length)],
    summoner2Id: 32,
    keystoneId: KEYSTONES[Math.floor(rnd() * KEYSTONES.length)],
    secondaryStyleId: STYLES[Math.floor(rnd() * STYLES.length)],
    totalHeal: Math.floor(rnd() * 8000),
    totalHealsOnTeammates: Math.floor(rnd() * 6000),
    totalDamageShieldedOnTeammates: Math.floor(rnd() * 5000),
    killingSprees: Math.floor(rnd() * 3),
    largestKillingSpree: Math.floor(rnd() * 8),
    largestMultiKill: multi > 0.97 ? 5 : multi > 0.9 ? 4 : multi > 0.75 ? 3 : multi > 0.5 ? 2 : 1,
    doubleKills: multi > 0.5 ? 1 + Math.floor(rnd() * 3) : 0,
    tripleKills: multi > 0.75 ? 1 : 0,
    quadraKills: multi > 0.9 ? 1 : 0,
    pentaKills: multi > 0.97 ? 1 : 0,
    firstBloodKill: rnd() > 0.9,
    turretKills: Math.floor(rnd() * 3),
    inhibitorKills: Math.floor(rnd() * 2),
    timeCCingOthers: Math.floor(rnd() * 60),
    physicalDamageDealtToChampions: Math.floor(dmg * phys),
    magicDamageDealtToChampions: Math.floor(dmg * (1 - phys) * 0.9),
    trueDamageDealtToChampions: Math.floor(dmg * (1 - phys) * 0.1),
  };
}

export function mockMatch(matchId: string, puuid: string): Match {
  const rnd = mulberry32(hash(matchId));
  const idx = 999 - (Number(matchId.split("_").pop() ?? 0) % 1000);
  const duration = 780 + Math.floor(rnd() * 1200);
  const myTeam = rnd() > 0.5 ? 100 : 200;
  const blueWin = rnd() > 0.45 ? 1 : 0;
  const participants: MatchParticipant[] = [];
  for (let i = 0; i < 10; i++) {
    const teamId = i < 5 ? 100 : 200;
    const win = teamId === 100 ? blueWin : 1 - blueWin;
    const isMe = teamId === myTeam && i % 5 === 2;
    participants.push(participant(rnd, teamId, win, i, isMe ? puuid : null, duration));
  }
  const teamKills = (t: number) => participants.filter((p) => p.teamId === t).reduce((s, p) => s + p.kills, 0);
  return {
    metadata: { matchId, participants: participants.map((p) => p.puuid) },
    info: {
      gameCreation: Date.now() - idx * 1000 * 60 * 60 * (3 + Math.floor(rnd() * 9)) - idx * 60000,
      gameDuration: duration,
      gameMode: "ARAM",
      gameVersion: "14.13.600",
      mapId: 12,
      queueId: rnd() > 0.85 ? 2400 : 450,
      platformId: "KR",
      participants,
      teams: [100, 200].map((teamId) => ({
        teamId,
        win: teamId === 100 ? !!blueWin : !blueWin,
        objectives: {
          champion: { first: false, kills: teamKills(teamId) },
          tower: { first: false, kills: Math.floor(rnd() * 5) },
          inhibitor: { first: false, kills: Math.floor(rnd() * 2) },
        },
      })),
    },
  };
}
