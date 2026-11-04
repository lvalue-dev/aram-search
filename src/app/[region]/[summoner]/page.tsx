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
import DemoBanner from "@/components/DemoBanner";
import Notice from "@/components/ui/Notice";

export const dynamic = "force-dynamic";

interface Props {
  params: { region: string; summoner: string };
  searchParams: { tag?: string };
}

const INITIAL_COUNT = 20;

function parseSummoner(raw: string): { gameName: string; tagLine: string; hasTag: boolean } {
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    /* 잘못된 인코딩은 원문 사용 */
  }
  const lastDash = decoded.lastIndexOf("-");
  if (lastDash <= 0 || lastDash === decoded.length - 1) return { gameName: decoded.replace(/-$/, ""), tagLine: "", hasTag: false };
  return { gameName: decoded.slice(0, lastDash), tagLine: decoded.slice(lastDash + 1), hasTag: true };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const parsed = parseSummoner(params.summoner);
  const gameName = parsed.gameName;
  const tagLine = parsed.hasTag ? parsed.tagLine : isRegionKey(params.region) ? REGIONS[params.region].defaultTag : "KR1";
  return {
    title: `${gameName}#${tagLine} 나락 기록`,
    description: `${gameName}#${tagLine} 님의 칼바람 나락 전적, 나락 점수, 챔피언별 성적`,
  };
}

export default async function SummonerPage({ params, searchParams }: Props) {
  const region = params.region;
  if (!isRegionKey(region)) notFound();

  const parsed = parseSummoner(params.summoner);
  const gameName = parsed.gameName;
  // 주소에 태그가 없거나 검색창에서 태그를 생략했다면 서버 기본 태그로 찾는다
  const tagLine = parsed.hasTag ? parsed.tagLine : REGIONS[region].defaultTag;
  const tagGuessed = !parsed.hasTag || searchParams.tag === "auto";

  try {
    const { account, summoner, leagueEntries, matches, matchIds, failedIds } = await loadSummonerProfile(gameName, tagLine, region, INITIAL_COUNT);
    const [assets] = await Promise.all([buildAssetBundle(matches)]);
    const stats = calcSummonerStats(matches, account.puuid);
    const now = Date.now();

    return (
      <AssetsProvider assets={assets}>
        <div className="space-y-5">
          <DemoBanner />
          {tagGuessed && (
            <Notice tone="info" title={`태그 없이 검색해서 ${account.gameName}#${account.tagLine} 계정을 보여드리고 있어요`}>
              찾던 계정이 아니라면 태그까지 붙여서 다시 검색하세요. 예) {gameName}#1234 · 태그는 롤 클라이언트 프로필에서 확인할 수 있어요.
            </Notice>
          )}
          {failedIds.length > 0 && (
            <Notice tone="warn" title={`Riot 요청 한도 때문에 ${failedIds.length}게임을 불러오지 못했어요`}>
              아래 통계는 불러온 {matches.length}게임 기준입니다. 잠시 후 전적 갱신을 누르면 나머지를 불러옵니다.
            </Notice>
          )}
          <SummonerHeader account={account} summoner={summoner} leagueEntries={leagueEntries} region={region} stats={stats} loadedAt={now} />
          <SummonerTabs
            stats={stats}
            matches={matches}
            puuid={account.puuid}
            region={region}
            hasMore={matchIds.length >= INITIAL_COUNT}
            nextStart={matchIds.length}
            now={now}
          />
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
            tagGuessed ? (
              <>
                태그 없이 검색해서{" "}
                <strong className="text-white">
                  {gameName}#{tagLine}
                </strong>{" "}
                으로 찾아봤지만 없습니다. 롤 클라이언트 프로필에 보이는 <strong className="text-white">이름#태그</strong> 를 그대로 입력해 주세요.
              </>
            ) : (
              <>
                <strong className="text-white">
                  {gameName}#{tagLine}
                </strong>{" "}
                계정이 {REGIONS[region].name} 서버에 없습니다. 태그(#) 와 서버를 다시 확인해 주세요.
              </>
            )
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
