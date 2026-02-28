import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.RIOT_API_KEY ?? "";

  const keyInfo = key
    ? `설정됨 (${key.slice(0, 8)}...${key.slice(-4)}, 총 ${key.length}자)`
    : "❌ 미설정 — Vercel 환경변수가 이 배포에 적용되지 않음";

  // Vercel 환경 정보
  const vercelEnv = process.env.VERCEL_ENV ?? "unknown (로컬 또는 미설정)";
  const vercelUrl = process.env.VERCEL_URL ?? "unknown";

  // Riot API 테스트 호출 (KR 플랫폼)
  let krStatus = "키 미설정으로 스킵";
  // Riot API 테스트 호출 (ASIA 리저널 - 실제 소환사 검색에 사용되는 엔드포인트)
  let asiaStatus = "키 미설정으로 스킵";

  if (key) {
    // KR 플랫폼 테스트
    try {
      const res = await fetch(
        "https://kr.api.riotgames.com/lol/status/v4/platform-data",
        { headers: { "X-Riot-Token": key }, cache: "no-store" }
      );
      const body = await res.text();
      krStatus = `HTTP ${res.status}${res.status !== 200 ? ` — ${body.slice(0, 200)}` : " ✅ 정상"}`;
    } catch (e) {
      krStatus = `네트워크 오류: ${e instanceof Error ? e.message : String(e)}`;
    }

    // ASIA 리저널 테스트 (존재하지 않는 소환사로 요청 → 정상 키면 404, 잘못된 키면 403)
    try {
      const res = await fetch(
        "https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/__health_check__/TEST",
        { headers: { "X-Riot-Token": key }, cache: "no-store" }
      );
      const body = await res.text();
      if (res.status === 404) {
        asiaStatus = "HTTP 404 ✅ 정상 (키 유효, 소환사 없음)";
      } else {
        asiaStatus = `HTTP ${res.status} — ${body.slice(0, 200)}`;
      }
    } catch (e) {
      asiaStatus = `네트워크 오류: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  return NextResponse.json({
    vercelEnv,
    vercelUrl,
    keyInfo,
    krPlatformStatus: krStatus,
    asiaRegionalStatus: asiaStatus,
  });
}
