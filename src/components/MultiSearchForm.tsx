"use client";

import { FormEvent, useState } from "react";
import { REGIONS, RegionKey, isRegionKey } from "@/types/riot";
import { useNavigation } from "./NavigationProvider";
import { extractRiotIds } from "@/lib/riot-id";

export default function MultiSearchForm({ defaultRegion = "kr", defaultText = "" }: { defaultRegion?: string; defaultText?: string }) {
  const [text, setText] = useState(defaultText);
  const [region, setRegion] = useState<RegionKey>(isRegionKey(defaultRegion) ? defaultRegion : "kr");
  const { navigate, pending } = useNavigation();
  const ids = extractRiotIds(text, region);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (ids.length === 0) return;
    // 태그를 생략한 이름은 그대로 보내서 결과 화면에서 "태그 추정"으로 표시
    const q = ids.map((i) => (i.tagGuessed ? i.gameName : `${i.gameName}#${i.tagLine}`)).join(",");
    navigate(`/multi?region=${region}&q=${encodeURIComponent(q)}`, { message: `${ids.length}명의 나락 기록을 동시에 불러오는 중` });
  }

  return (
    <form onSubmit={submit} className="panel space-y-3 p-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder={"로비 채팅을 그대로 붙여넣으세요.\n예)\nHide on bush#KR1 님이 로비에 참가했습니다.\n눈보라#KR1 님이 로비에 참가했습니다."}
        className="w-full resize-y rounded-xl border border-white/10 bg-abyss-900/60 p-3 text-sm text-white placeholder-ink-500 outline-none transition-colors focus:border-frost-300/50"
      />
      <div className="flex flex-wrap items-center gap-2">
        <select value={region} onChange={(e) => setRegion(e.target.value as RegionKey)} className="h-9 rounded-xl border border-white/10 bg-abyss-800 px-3 text-xs font-bold text-frost-200 outline-none">
          {Object.entries(REGIONS).map(([k, r]) => (
            <option key={k} value={k}>
              {r.short} · {r.name}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap gap-1.5">
          {ids.map((i) => (
            <span key={`${i.gameName}#${i.tagLine}`} className="chip chip-active">
              {i.gameName}
              <span className="text-ink-400">#{i.tagLine}</span>
              {i.tagGuessed && <span className="text-[10px] text-ember-300">태그 추정</span>}
            </span>
          ))}
          {ids.length === 0 && <span className="text-xs text-ink-500">인식된 소환사가 없어요 (최대 5명)</span>}
        </div>
        <button type="submit" disabled={ids.length === 0 || pending} className="btn-primary ml-auto px-6">
          {ids.length}명 검색
        </button>
      </div>
    </form>
  );
}
