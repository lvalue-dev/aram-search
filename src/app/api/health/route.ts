import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.RIOT_API_KEY ?? "";

  const keyInfo = key
    ? `설정됨 (${key.slice(0, 8)}...${key.slice(-4)}, 총 ${key.length}자)`
    : "❌ 미설정 — Vercel 환경변수가 이 배포에 적용되지 않음";

  // Vercel 환경 정보
  const vercelEnv = process.env.VERCEL_ENV ?? "unknown (로컬 또는 미설정)";
  const vercelUrl = process.env.VERCEL_URL ?? "unknown";

  // Riot API 테스트 호출
  let riotStatus = "키 미설정으로 스킵";
  if (key) {
    try {
      const res = await fetch(
        "https://kr.api.riotgames.com/lol/status/v4/platform-data",
        {
          headers: { "X-Riot-Token": key },
          cache: "no-store",
        }
      );
      const body = await res.text();
      riotStatus = `HTTP ${res.status}${res.status !== 200 ? ` — ${body.slice(0, 200)}` : " ✅ 정상"}`;
    } catch (e) {
      riotStatus = `네트워크 오류: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  return NextResponse.json({
    vercelEnv,
    vercelUrl,
    keyInfo,
    riotStatus,
  });
}
