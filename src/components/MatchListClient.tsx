"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AssetBundle, Match, QUEUE_NAMES } from "@/types/riot";
import { cn, getParticipant } from "@/lib/utils";
import MatchCard from "./MatchCard";
import FrostLoader from "./ui/FrostLoader";
import { useAssets } from "./AssetsProvider";
import AssetsProvider from "./AssetsProvider";
import { mergeAssetBundles } from "@/lib/ddragon";

interface MatchListClientProps {
  initialMatches: Match[];
  puuid: string;
  region: string;
  /** 더 불러올 수 있는지 (초기 요청에서 count 만큼 가득 찼는지) */
  hasMore: boolean;
  /** 다음으로 불러올 매치 id 위치 */
  nextStart: number;
  now: number;
}

type Result = "all" | "win" | "lose";
const PAGE = 10;

export default function MatchListClient({ initialMatches, puuid, region, hasMore: initialHasMore, nextStart: initialNextStart, now }: MatchListClientProps) {
  const baseAssets = useAssets();
  const [extraAssets, setExtraAssets] = useState<AssetBundle | null>(null);
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [nextStart, setNextStart] = useState(initialNextStart);
  const [failed, setFailed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result>("all");
  const [queue, setQueue] = useState<number | "all">("all");
  const [champ, setChamp] = useState("");
  const sentinel = useRef<HTMLDivElement>(null);

  const assets = useMemo(() => (extraAssets ? mergeAssetBundles(baseAssets, extraAssets) : baseAssets), [baseAssets, extraAssets]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/matches?puuid=${encodeURIComponent(puuid)}&region=${region}&start=${nextStart}&count=${PAGE}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "매치를 불러오지 못했습니다.");
      const incoming: Match[] = data.matches ?? [];
      setMatches((prev) => {
        const seen = new Set(prev.map((m) => m.metadata.matchId));
        return [...prev, ...incoming.filter((m) => !seen.has(m.metadata.matchId))];
      });
      if (data.assets) setExtraAssets((prev) => (prev ? mergeAssetBundles(prev, data.assets) : data.assets));
      setHasMore(!!data.hasMore);
      if (typeof data.nextStart === "number") setNextStart(data.nextStart);
      if (data.failed) setFailed((f) => f + data.failed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, puuid, region, nextStart]);

  // 무한 스크롤
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !error) loadMore();
      },
      { rootMargin: "400px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, hasMore, loading, error]);

  const champQuery = champ.trim().toLowerCase();
  const filtered = matches.filter((m) => {
    const p = getParticipant(m, puuid);
    if (!p) return false;
    if (result === "win" && !p.win) return false;
    if (result === "lose" && p.win) return false;
    if (queue !== "all" && m.info.queueId !== queue) return false;
    if (champQuery) {
      const ko = assets.champions[p.championName] ?? "";
      if (!p.championName.toLowerCase().includes(champQuery) && !ko.includes(champQuery)) return false;
    }
    return true;
  });

  const queues = Array.from(new Set(matches.map((m) => m.info.queueId)));
  const wins = filtered.filter((m) => getParticipant(m, puuid)?.win).length;

  return (
    <AssetsProvider assets={assets}>
      <div className="space-y-3">
        {/* 필터 */}
        <div className="panel flex flex-wrap items-center gap-2 px-3 py-2.5">
          <div className="flex gap-1">
            {(["all", "win", "lose"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setResult(f)}
                className={cn(
                  "chip",
                  result === f && (f === "win" ? "border-win/50 bg-win/15 text-win" : f === "lose" ? "border-lose/50 bg-lose/15 text-lose" : "chip-active")
                )}
              >
                {f === "all" ? "전체" : f === "win" ? "승리" : "패배"}
              </button>
            ))}
          </div>
          {queues.length > 1 && (
            <div className="flex gap-1 border-l border-white/[0.06] pl-2">
              <button type="button" onClick={() => setQueue("all")} className={cn("chip", queue === "all" && "chip-active")}>
                모든 큐
              </button>
              {queues.map((q) => (
                <button key={q} type="button" onClick={() => setQueue(q)} className={cn("chip", queue === q && "chip-active")}>
                  {QUEUE_NAMES[q] ?? q}
                </button>
              ))}
            </div>
          )}
          <div className="relative ml-auto">
            <input
              value={champ}
              onChange={(e) => setChamp(e.target.value)}
              placeholder="챔피언 검색"
              className="h-8 w-36 rounded-full border border-white/10 bg-white/[0.03] pl-8 pr-3 text-xs text-white placeholder-ink-400 outline-none transition-colors focus:border-frost-300/50"
            />
            <svg className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="num w-full text-right text-[11px] text-ink-400 sm:w-auto">
            {filtered.length}게임 · <span className="text-win">{wins}승</span> <span className="text-lose">{filtered.length - wins}패</span>
          </span>
        </div>

        {/* 목록 */}
        {filtered.length === 0 ? (
          <div className="panel p-10 text-center">
            <div className="text-3xl">🧊</div>
            <p className="mt-2 text-sm font-semibold text-ink-200">조건에 맞는 게임이 없어요</p>
            <p className="mt-1 text-xs text-ink-400">필터를 바꾸거나 더 많은 게임을 불러와 보세요.</p>
          </div>
        ) : (
          <div className="space-y-2.5 stagger">
            {filtered.map((match) => (
              <MatchCard key={match.metadata.matchId} match={match} puuid={puuid} now={now} />
            ))}
          </div>
        )}

        {/* 더 보기 */}
        <div ref={sentinel} className="flex flex-col items-center gap-3 py-4">
          {failed > 0 && !error && (
            <p className="text-xs text-ember-300">Riot 요청 한도 때문에 {failed}게임을 건너뛰었어요. 잠시 후 전적 갱신을 눌러 주세요.</p>
          )}
          {error && (
            <p className="text-sm text-lose">
              {error}{" "}
              <button type="button" onClick={loadMore} className="underline">
                다시 시도
              </button>
            </p>
          )}
          {loading ? (
            <div className="flex items-center gap-3 text-xs font-semibold text-frost-200">
              <FrostLoader size={32} /> 나락 더 깊이 내려가는 중...
            </div>
          ) : hasMore ? (
            <button type="button" onClick={loadMore} className="btn-ghost px-8">
              더 보기
              <span className="num text-ink-400">({matches.length}게임 로드됨)</span>
            </button>
          ) : (
            <p className="text-xs text-ink-500">
              {matches.length > 0 ? "더 이상 불러올 칼바람 게임이 없어요 · 최근 " + matches.length + "게임" : ""}
            </p>
          )}
        </div>
      </div>
    </AssetsProvider>
  );
}
