import { notFound } from "next/navigation";
import { getAccountByRiotId, getSummonerByPuuid, getLeagueEntries, getAllAramMatchIds, getMatches } from "@/lib/riot-api";
import { calcSummonerStats } from "@/lib/utils";
import { RegionKey, REGIONS, LeagueEntry } from "@/types/riot";
import SummonerHeader from "@/components/SummonerHeader";
import StatsPanel from "@/components/StatsPanel";
import MatchCard from "@/components/MatchCard";
import MatchListClient from "@/components/MatchListClient";

interface Props {
  params: {
    region: string;
    summoner: string;
  };
}

export async function generateMetadata({ params }: Props) {
  const { gameName, tagLine } = parseSummoner(params.summoner);
  return {
    title: `${gameName}#${tagLine} 칼바람 전적 | 칼바람.gg`,
  };
}

function parseSummoner(raw: string): { gameName: string; tagLine: string } {
  const decoded = decodeURIComponent(raw);
  const lastDash = decoded.lastIndexOf("-");
  if (lastDash === -1) {
    return { gameName: decoded, tagLine: "KR1" };
  }
  return {
    gameName: decoded.slice(0, lastDash),
    tagLine: decoded.slice(lastDash + 1),
  };
}

export default async function SummonerPage({ params }: Props) {
  const region = params.region as RegionKey;

  if (!REGIONS[region]) {
    notFound();
  }

  const { gameName, tagLine } = parseSummoner(params.summoner);

  try {
    // 소환사 정보 조회
    const account = await getAccountByRiotId(gameName, tagLine, region);
    const summoner = await getSummonerByPuuid(account.puuid, region);
    const [leagueEntriesRaw, matchIds] = await Promise.all([
      getLeagueEntries(account.puuid, region).catch(() => [] as LeagueEntry[]),
      getAllAramMatchIds(account.puuid, region, 20),
    ]);
    const leagueEntries = Array.isArray(leagueEntriesRaw) ? leagueEntriesRaw : [];

    // 최초 20게임 매치 로드
    const initialMatches = await getMatches(matchIds.slice(0, 20), region);
    const stats = calcSummonerStats(initialMatches, account.puuid);

    return (
      <div className="space-y-6">
        <SummonerHeader
          account={account}
          summoner={summoner}
          leagueEntries={leagueEntries}
          region={region}
        />

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left: Stats */}
          <div className="lg:w-72 w-full shrink-0">
            <StatsPanel stats={stats} />
          </div>

          {/* Right: Match history */}
          <div className="flex-1 min-w-0">
            <MatchListClient
              initialMatches={initialMatches}
              puuid={account.puuid}
              region={region}
              totalMatchIds={matchIds.length}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "오류 발생";

    if (message.includes("찾을 수 없습니다")) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="text-6xl">🔍</div>
          <h2 className="text-xl font-bold text-white">소환사를 찾을 수 없습니다</h2>
          <p className="text-slate-400 text-sm">
            <strong className="text-white">{gameName}#{tagLine}</strong> 소환사가 존재하지 않습니다.
          </p>
          <a
            href="/"
            className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors"
          >
            다시 검색하기
          </a>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="text-6xl">⚠️</div>
        <h2 className="text-xl font-bold text-white">오류가 발생했습니다</h2>
        <p className="text-slate-400 text-sm">{message}</p>
        <a
          href="/"
          className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors"
        >
          홈으로 돌아가기
        </a>
      </div>
    );
  }
}
