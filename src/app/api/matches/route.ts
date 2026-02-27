import { NextRequest, NextResponse } from "next/server";
import { getAllAramMatchIds, getMatches } from "@/lib/riot-api";
import { RegionKey } from "@/types/riot";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const puuid = searchParams.get("puuid");
  const region = (searchParams.get("region") ?? "kr") as RegionKey;
  const count = Math.min(parseInt(searchParams.get("count") ?? "20"), 20);
  const start = parseInt(searchParams.get("start") ?? "0");

  if (!puuid) {
    return NextResponse.json({ error: "puuid가 필요합니다." }, { status: 400 });
  }

  try {
    const matchIds = await getAllAramMatchIds(puuid, region, count + start);
    const pageIds = matchIds.slice(start, start + count);
    const matches = await getMatches(pageIds, region);

    return NextResponse.json({ matches, total: matchIds.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
