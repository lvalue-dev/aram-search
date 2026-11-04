import { NextRequest, NextResponse } from "next/server";
import { invalidateSummoner } from "@/lib/riot-api";

export const dynamic = "force-dynamic";

/** 전적 갱신: 해당 소환사의 짧은 캐시(매치 목록/레벨/랭크)를 비운다. 매치 상세는 바뀌지 않으므로 유지. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const puuid = typeof body?.puuid === "string" ? body.puuid : "";
  if (!puuid) return NextResponse.json({ error: "puuid가 필요합니다." }, { status: 400 });
  invalidateSummoner(puuid);
  return NextResponse.json({ ok: true });
}
