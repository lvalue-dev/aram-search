import { NextRequest, NextResponse } from "next/server";
import { getAccountByRiotId, getSummonerByPuuid, getLeagueEntries } from "@/lib/riot-api";
import { RegionKey } from "@/types/riot";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameName = searchParams.get("gameName");
  const tagLine = searchParams.get("tagLine");
  const region = (searchParams.get("region") ?? "kr") as RegionKey;

  if (!gameName || !tagLine) {
    return NextResponse.json(
      { error: "gameName과 tagLine이 필요합니다." },
      { status: 400 }
    );
  }

  try {
    const account = await getAccountByRiotId(gameName, tagLine, region);
    const summoner = await getSummonerByPuuid(account.puuid, region);
    const leagueEntries = await getLeagueEntries(account.puuid, region);

    return NextResponse.json({ account, summoner, leagueEntries });
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    const status = message.includes("찾을 수 없습니다") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
