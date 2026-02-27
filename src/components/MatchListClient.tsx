"use client";

import { useState } from "react";
import { Match } from "@/types/riot";
import MatchCard from "./MatchCard";

interface MatchListClientProps {
  initialMatches: Match[];
  puuid: string;
  region: string;
  totalMatchIds: number;
}

export default function MatchListClient({
  initialMatches,
  puuid,
  region,
  totalMatchIds,
}: MatchListClientProps) {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "win" | "lose">("all");

  async function loadMore() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/matches?puuid=${encodeURIComponent(puuid)}&region=${region}&start=${matches.length}&count=10`
      );
      if (!res.ok) throw new Error("매치 로드 실패");
      const data = await res.json();
      setMatches((prev) => [...prev, ...data.matches]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류 발생");
    } finally {
      setLoading(false);
    }
  }

  const filtered = matches.filter((m) => {
    if (filter === "all") return true;
    const p = m.info.participants.find((p) => p.puuid === puuid);
    if (!p) return false;
    return filter === "win" ? p.win : !p.win;
  });

  return (
    <div className="space-y-3">
      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-400 font-medium">매치 필터:</span>
        {(["all", "win", "lose"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${
              filter === f
                ? f === "win"
                  ? "bg-win text-white"
                  : f === "lose"
                  ? "bg-lose text-white"
                  : "bg-blue-600 text-white"
                : "bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
          >
            {f === "all" ? "전체" : f === "win" ? "승리" : "패배"}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-500">
          {filtered.length}게임 표시
        </span>
      </div>

      {/* Match list */}
      {filtered.length === 0 ? (
        <div className="card p-8 text-center text-slate-500 text-sm">
          해당 조건의 게임이 없습니다.
        </div>
      ) : (
        filtered.map((match) => (
          <MatchCard key={match.metadata.matchId} match={match} puuid={puuid} />
        ))
      )}

      {/* Load more */}
      {matches.length < totalMatchIds && (
        <div className="text-center">
          {error && (
            <p className="text-lose text-sm mb-2">{error}</p>
          )}
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                로딩 중...
              </span>
            ) : (
              `더 보기 (${matches.length} / ${totalMatchIds})`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
