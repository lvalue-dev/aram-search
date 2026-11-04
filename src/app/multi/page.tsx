import type { Metadata } from "next";
import { isRegionKey, RegionKey, Match } from "@/types/riot";
import { loadSummonerProfile } from "@/lib/riot-api";
import { buildAssetBundle, mergeAssetBundles } from "@/lib/ddragon";
import { calcSummonerStats } from "@/lib/utils";
import MultiSearchForm from "@/components/MultiSearchForm";
import { extractRiotIds } from "@/lib/riot-id";
import MultiCard, { MultiEntry } from "@/components/MultiCard";
import AssetsProvider from "@/components/AssetsProvider";
import DemoBanner from "@/components/DemoBanner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "멀티서치",
  description: "같은 로비의 소환사 여러 명의 칼바람 최근 폼을 한 번에 비교",
};

const PER_PLAYER = 10;

interface Props {
  searchParams: { q?: string; region?: string };
}

export default async function MultiPage({ searchParams }: Props) {
  const region: RegionKey = isRegionKey(searchParams.region ?? "") ? (searchParams.region as RegionKey) : "kr";
  const q = searchParams.q ?? "";
  const ids = extractRiotIds(q.replace(/,/g, "\n"), region);

  let entries: MultiEntry[] = [];
  let assets = await buildAssetBundle([]);

  if (ids.length > 0) {
    const results = await Promise.allSettled(ids.map((id) => loadSummonerProfile(id.gameName, id.tagLine, region, PER_PLAYER)));
    const allMatches: Match[] = [];
    entries = results.map((r, i) => {
      if (r.status === "rejected") {
        return { input: ids[i], region, error: r.reason instanceof Error ? r.reason.message : "오류" };
      }
      allMatches.push(...r.value.matches);
      return {
        input: ids[i],
        region,
        failed: r.value.failedIds.length,
        account: r.value.account,
        summoner: r.value.summoner,
        stats: calcSummonerStats(r.value.matches, r.value.account.puuid),
      };
    });
    assets = mergeAssetBundles(assets, await buildAssetBundle(allMatches, assets.version));
  }

  return (
    <AssetsProvider assets={assets}>
      <div className="space-y-6">
        <DemoBanner />
        <section className="animate-rise">
          <h1 className="text-2xl font-black text-white">멀티서치</h1>
          <p className="mt-1 text-sm text-ink-400">로비 채팅을 붙여넣으면 최대 5명의 최근 {PER_PLAYER}게임 폼을 나란히 보여줍니다.</p>
          <div className="mt-4">
            <MultiSearchForm defaultRegion={region} defaultText={ids.map((i) => (i.tagGuessed ? i.gameName : `${i.gameName}#${i.tagLine}`)).join("\n")} />
          </div>
        </section>

        {entries.length > 0 && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger">
            {entries.map((e) => (
              <MultiCard key={`${e.input.gameName}#${e.input.tagLine}`} entry={e} />
            ))}
          </section>
        )}
      </div>
    </AssetsProvider>
  );
}
