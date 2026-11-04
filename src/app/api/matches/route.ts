import { NextRequest, NextResponse } from "next/server";
import { getAllAramMatchIds, getMatches, RiotApiError } from "@/lib/riot-api";
import { buildAssetBundle } from "@/lib/ddragon";
import { isRegionKey } from "@/types/riot";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const puuid = searchParams.get("puuid");
  const regionParam = searchParams.get("region") ?? "kr";
  const count = Math.max(1, Math.min(parseInt(searchParams.get("count") ?? "10", 10) || 10, 20));
  const start = Math.max(0, parseInt(searchParams.get("start") ?? "0", 10) || 0);

  if (!puuid) return NextResponse.json({ error: "puuid가 필요합니다." }, { status: 400 });
  if (!isRegionKey(regionParam)) return NextResponse.json({ error: "지원하지 않는 서버입니다." }, { status: 400 });

  try {
    const pageIds = await getAllAramMatchIds(puuid, regionParam, count, start);
    const { matches, failedIds } = await getMatches(pageIds, regionParam, puuid);
    const assets = await buildAssetBundle(matches);
    return NextResponse.json({
      matches,
      assets,
      failed: failedIds.length,
      // 다음 페이지는 "화면에 보인 게임 수"가 아니라 "가져온 id 수" 기준으로 이어간다
      nextStart: start + pageIds.length,
      hasMore: pageIds.length >= count,
    });
  } catch (error) {
    const status = error instanceof RiotApiError ? error.status : 500;
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json({ error: message }, { status: status >= 400 ? status : 500 });
  }
}
