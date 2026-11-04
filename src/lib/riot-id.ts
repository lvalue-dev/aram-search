import { REGIONS, RegionKey } from "@/types/riot";

/** 태그로 서버를 추측 (예: #NA1 → na1) */
export function guessRegionFromTag(tag: string): RegionKey | null {
  const t = tag.toUpperCase();
  for (const [key, r] of Object.entries(REGIONS)) {
    if (r.defaultTag === t || r.short === t) return key as RegionKey;
  }
  return null;
}

/** "닉네임#태그" 문자열을 파싱. 태그가 없으면 서버 기본 태그 사용 */
export interface ParsedRiotId {
  gameName: string;
  tagLine: string;
  region: RegionKey;
  /** 태그를 입력하지 않아 서버 기본 태그(#KR1 등)로 채웠는지 */
  tagGuessed: boolean;
}

export function parseRiotId(raw: string, region: RegionKey): ParsedRiotId | null {
  // 전각 ＃ 도 # 로 취급
  const trimmed = raw.replace(/＃/g, "#").trim();
  if (!trimmed) return null;
  let gameName = trimmed;
  let tagLine: string = REGIONS[region].defaultTag;
  let tagGuessed = true;
  let finalRegion = region;
  const hashIdx = trimmed.lastIndexOf("#");
  if (hashIdx === 0) return null; // "#KR1" 처럼 이름이 없음
  if (hashIdx > 0) {
    gameName = trimmed.slice(0, hashIdx).trim();
    const tag = trimmed.slice(hashIdx + 1).trim();
    if (tag) {
      tagLine = tag;
      tagGuessed = false;
      const guessed = guessRegionFromTag(tag);
      if (guessed) finalRegion = guessed;
    }
  }
  if (!gameName) return null;
  return { gameName, tagLine, region: finalRegion, tagGuessed };
}

/** 로비 채팅 텍스트에서 닉네임#태그 들을 추출 (최대 5명) */
export function extractRiotIds(text: string, region: RegionKey, max = 5): Array<{ gameName: string; tagLine: string; tagGuessed: boolean }> {
  const seen = new Set<string>();
  const out: Array<{ gameName: string; tagLine: string; tagGuessed: boolean }> = [];
  const lines = text
    .split(/\n|,|님이 로비에 참가했습니다\.?|joined the lobby\.?/i)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const line of lines) {
    const parsed = parseRiotId(line, region);
    if (!parsed) continue;
    const key = `${parsed.gameName}#${parsed.tagLine}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ gameName: parsed.gameName, tagLine: parsed.tagLine, tagGuessed: parsed.tagGuessed });
    if (out.length >= max) break;
  }
  return out;
}

/** 소환사 페이지 주소. 태그를 추정했다면 ?tag=auto 를 붙여 결과 화면에서 알린다. */
export function summonerPath(p: { region: string; gameName: string; tagLine: string; tagGuessed?: boolean }): string {
  const base = `/${p.region}/${encodeURIComponent(p.gameName)}-${encodeURIComponent(p.tagLine)}`;
  return p.tagGuessed ? `${base}?tag=auto` : base;
}
