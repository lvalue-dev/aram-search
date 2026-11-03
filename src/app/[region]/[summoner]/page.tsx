import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { loadSummonerProfile, RiotApiError } from "@/lib/riot-api";
import { buildAssetBundle } from "@/lib/ddragon";
import { calcSummonerStats } from "@/lib/utils";
import { isRegionKey, REGIONS } from "@/types/riot";
import AssetsProvider from "@/components/AssetsProvider";
import SummonerHeader from "@/components/SummonerHeader";
import SummonerTabs from "@/components/SummonerTabs";

export const dynamic = "force-dynamic";

interface Props {
  params: { region: string; summoner: string };
}

const INITIAL_COUNT = 20;

function parseSummoner(raw: string): { gameName: string; tagLine: string } {
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    /* 잘못된 인코딩은 원문 사용 */
  }
  const lastDash = decoded.lastIndexOf("-");
  if (lastDash === -1) return { gameName: decoded, tagLine: "KR1" };
  return { gameName: decoded.slice(0, lastDash), tagLine: decoded.slice(lastDash + 1) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { gameName, tagLine } = parseSummoner(params.summoner);
  return {
    title: `${gameName}#${tagLine} 나락 기록`,
    description: `${gameName}#${tagLine} 님의 칼바람 나락 전적, 나락 점수, 챔피언별 성적`,
  };
}

export default async function SummonerPage({ params }: Props) {
  const region = params.region;
  if (!isRegionKey(region)) notFound();

  const { gameName, tagLine } = parseSummoner(params.summoner);

  try {
    const { account, summoner, leagueEntries, matches, matchIds } = await loadSummonerProfile(gameName, tagLine, region, INITIAL_COUNT);
    const [assets] = await Promise.all([buildAssetBundle(matches)]);
    const stats = calcSummonerStats(matches, account.puuid);
    const now = Date.now();

    return (
      <AssetsProvider assets={assets}>
        <div className="space-y-5">
          <SummonerHeader account={account} summoner={summoner} leagueEntries={leagueEntries} region={region} stats={stats} loadedAt={now} />
          <SummonerTabs stats={stats} matches={matches} puuid={account.puuid} region={region} hasMore={matchIds.length >= INITIAL_COUNT} now={now} />
        </div>
      </AssetsProvider>
    );
  } catch (error) {
    const apiError = error instanceof RiotApiError ? error : null;
    const message = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

    if (apiError?.code === "NOT_FOUND") {
      return (
        <ErrorView
          icon="🔍"
          title="소환사를 찾을 수 없어요"
          desc={
            <>
              <strong className="text-white">
                {gameName}#{tagLine}
              </strong>{" "}
              계정이 {REGIONS[region].name} 서버에 없습니다. 태그(#) 와 서버를 다시 확인해 주세요.
            </>
          }
        />
      );
    }
    if (apiError?.code === "RATE_LIMIT") {
      return <ErrorView icon="🧊" title="잠시 숨 고르는 중" desc="Riot API 요청 한도에 도달했어요. 잠시 후 다시 시도해 주세요." retryHref={`/${region}/${params.summoner}`} />;
    }
    if (apiError?.code === "NO_KEY" || apiError?.code === "FORBIDDEN") {
      return <ErrorView icon="🔑" title="API 키 문제" desc={message} />;
    }
    return <ErrorView icon="⚠️" title="오류가 발생했어요" desc={message} retryHref={`/${region}/${params.summoner}`} />;
  }
}

function ErrorView({ icon, title, desc, retryHref }: { icon: string; title: string; desc: React.ReactNode; retryHref?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center animate-rise">
      <div className="text-5xl">{icon}</div>
      <h2 className="text-xl font-black text-white">{title}</h2>
      <p className="max-w-md text-sm text-ink-400">{desc}</p>
      <div className="mt-2 flex gap-2">
        {retryHref && (
          <Link href={retryHref} className="btn-ghost">
            다시 시도
          </Link>
        )}
        <Link href="/" className="btn-primary">
          다시 검색하기
        </Link>
      </div>
    </div>
  );
}
