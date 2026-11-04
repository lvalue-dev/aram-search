import { NextResponse } from "next/server";
import { parseLimits } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.RIOT_API_KEY ?? "";

  const keyInfo = key ? `설정됨 (${key.slice(0, 8)}...${key.slice(-4)}, 총 ${key.length}자)` : "❌ 미설정 — 서버 환경변수에 RIOT_API_KEY 가 없습니다";
  const limits = parseLimits(process.env.RIOT_RATE_LIMITS).map((w) => `${w.limit}회/${w.ms / 1000}초`);

  let krStatus = "키 미설정으로 스킵";
  let asiaStatus = krStatus;

  if (key) {
    try {
      const res = await fetch("https://kr.api.riotgames.com/lol/status/v4/platform-data", { headers: { "X-Riot-Token": key }, cache: "no-store" });
      const body = await res.text();
      krStatus = `HTTP ${res.status}${res.status !== 200 ? ` — ${body.slice(0, 200)}` : " ✅ 정상"}`;
    } catch (e) {
      krStatus = `네트워크 오류: ${e instanceof Error ? e.message : String(e)}`;
    }
    // 존재하지 않는 소환사로 요청 → 정상 키면 404, 잘못된 키면 401/403
    try {
      const res = await fetch("https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/__health_check__/TEST", { headers: { "X-Riot-Token": key }, cache: "no-store" });
      const body = await res.text();
      asiaStatus = res.status === 404 ? "HTTP 404 ✅ 정상 (키 유효, 소환사 없음)" : `HTTP ${res.status} — ${body.slice(0, 200)}`;
    } catch (e) {
      asiaStatus = `네트워크 오류: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  return NextResponse.json({
    dataSource: "Riot API (실제 데이터)",
    // 데모 모드는 삭제됐다. 예전 설정이 남아 있어도 무시된다는 것을 알려준다.
    ...(process.env.MOCK_RIOT_API ? { notice: "MOCK_RIOT_API 설정이 남아 있지만 데모 모드는 삭제되어 무시됩니다. 지워도 됩니다." } : {}),
    keyInfo,
    rateLimits: limits,
    krPlatformStatus: krStatus,
    asiaRegionalStatus: asiaStatus,
    vercelEnv: process.env.VERCEL_ENV ?? null,
  });
}
