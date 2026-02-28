import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.RIOT_API_KEY ?? "";

  const keyInfo = key
    ? `설정됨 (${key.slice(0, 8)}...${key.slice(-4)}, 총 ${key.length}자)`
    : "미설정";

  // 간단한 Riot API 테스트 호출
  let riotStatus: string;
  try {
    const res = await fetch(
      "https://kr.api.riotgames.com/lol/status/v4/platform-data",
      {
        headers: { "X-Riot-Token": key },
        cache: "no-store",
      }
    );
    riotStatus = `HTTP ${res.status}`;
  } catch (e) {
    riotStatus = `네트워크 오류: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json({ keyInfo, riotStatus });
}
