"use client";

import { useState } from "react";
import { Match, SummonerStats } from "@/types/riot";
import { cn } from "@/lib/utils";
import StatsPanel from "./StatsPanel";
import MatchListClient from "./MatchListClient";
import ChampionTable from "./ChampionTable";
import AnalysisPanel from "./AnalysisPanel";

interface Props {
  stats: SummonerStats;
  matches: Match[];
  puuid: string;
  region: string;
  hasMore: boolean;
  nextStart: number;
  now: number;
}

const TABS = [
  { key: "matches", label: "전적" },
  { key: "champions", label: "챔피언" },
  { key: "analysis", label: "분석" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export default function SummonerTabs({ stats, matches, puuid, region, hasMore, nextStart, now }: Props) {
  const [tab, setTab] = useState<TabKey>("matches");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 border-b border-white/[0.06]" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "relative px-4 py-2.5 text-sm font-bold transition-colors",
              tab === t.key ? "text-white" : "text-ink-400 hover:text-ink-200"
            )}
          >
            {t.label}
            {t.key === "champions" && <span className="num ml-1.5 rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-ink-300">{stats.championStats.length}</span>}
            {tab === t.key && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-frost-300 shadow-glow animate-fade-in" />}
          </button>
        ))}
      </div>

      {tab === "matches" && (
        <div key="matches" className="flex flex-col gap-5 lg:flex-row lg:items-start animate-fade-in">
          <div className="w-full shrink-0 lg:sticky lg:top-24 lg:w-[300px]">
            <StatsPanel stats={stats} />
          </div>
          <div className="min-w-0 flex-1">
            {/* key: 전적 갱신 후 새 데이터로 목록 상태를 다시 시작 */}
            <MatchListClient key={`${puuid}-${now}`} initialMatches={matches} puuid={puuid} region={region} hasMore={hasMore} nextStart={nextStart} now={now} />
          </div>
        </div>
      )}
      {tab === "champions" && (
        <div key="champions" className="animate-fade-in">
          <ChampionTable stats={stats.championStats} />
        </div>
      )}
      {tab === "analysis" && (
        <div key="analysis" className="animate-fade-in">
          <AnalysisPanel stats={stats} now={now} />
        </div>
      )}
    </div>
  );
}
