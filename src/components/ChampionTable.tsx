"use client";

import { useMemo, useState } from "react";
import { ChampionStats } from "@/types/riot";
import { cn, formatNumber, kdaTone, scoreTone } from "@/lib/utils";
import ChampionImage from "./ChampionImage";
import { useAssets } from "./AssetsProvider";

type SortKey = "games" | "winRate" | "kda" | "damage" | "score";

const COLUMNS: Array<{ key: SortKey; label: string }> = [
  { key: "games", label: "게임" },
  { key: "winRate", label: "승률" },
  { key: "kda", label: "KDA" },
  { key: "damage", label: "평균 딜" },
  { key: "score", label: "나락 점수" },
];

export default function ChampionTable({ stats }: { stats: ChampionStats[] }) {
  const [sort, setSort] = useState<SortKey>("games");
  const [query, setQuery] = useState("");
  const { champions } = useAssets();

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const enriched = stats.map((c) => ({
      ...c,
      winRate: Math.round((c.wins / c.games) * 100),
      kda: (c.kills + c.assists) / Math.max(c.deaths, 1),
      damage: c.totalDamage / c.games,
      score: c.scoreSum / c.games,
      koName: champions[c.championName] ?? c.championName,
    }));
    const filtered = q ? enriched.filter((c) => c.championName.toLowerCase().includes(q) || c.koName.includes(q)) : enriched;
    return filtered.sort((a, b) => b[sort] - a[sort] || b.games - a.games);
  }, [stats, sort, query, champions]);

  if (stats.length === 0) {
    return <div className="panel p-10 text-center text-sm text-ink-400">집계할 챔피언 기록이 없어요.</div>;
  }

  return (
    <section className="panel overflow-hidden animate-rise">
      <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.06] px-4 py-3">
        <h3 className="text-sm font-black text-white">챔피언별 성적</h3>
        <span className="text-[11px] text-ink-400">불러온 게임 기준 · 열 제목을 눌러 정렬</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="챔피언 검색"
          className="ml-auto h-8 w-36 rounded-full border border-white/10 bg-white/[0.03] px-3 text-xs text-white placeholder-ink-400 outline-none focus:border-frost-300/50"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead>
            <tr className="text-ink-400">
              <th className="px-4 py-2 font-semibold">#</th>
              <th className="px-2 py-2 font-semibold">챔피언</th>
              {COLUMNS.map((c) => (
                <th key={c.key} className="px-2 py-2">
                  <button
                    type="button"
                    onClick={() => setSort(c.key)}
                    className={cn("inline-flex items-center gap-1 font-semibold transition-colors hover:text-white", sort === c.key && "text-frost-200")}
                  >
                    {c.label}
                    {sort === c.key && <span className="text-[9px]">▼</span>}
                  </button>
                </th>
              ))}
              <th className="px-2 py-2 font-semibold">멀티킬</th>
            </tr>
          </thead>
          <tbody className="stagger">
            {rows.map((c, i) => (
              <tr key={c.championName} className="border-t border-white/[0.04] transition-colors hover:bg-white/[0.03]">
                <td className="num px-4 py-2.5 text-ink-500">{i + 1}</td>
                <td className="px-2 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <ChampionImage championName={c.championName} size={32} shape="rounded" />
                    <span className="font-bold text-white">{c.koName}</span>
                  </div>
                </td>
                <td className="num px-2 py-2.5 text-ink-200">
                  {c.games}
                  <span className="ml-1 text-[10px] text-ink-500">
                    ({c.wins}승 {c.games - c.wins}패)
                  </span>
                </td>
                <td className="px-2 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className={cn("h-full rounded-full", c.winRate >= 50 ? "bg-win" : "bg-lose")} style={{ width: `${c.winRate}%` }} />
                    </div>
                    <span className={cn("num font-black", c.winRate >= 60 ? "text-win" : c.winRate < 40 ? "text-lose" : "text-ink-100")}>{c.winRate}%</span>
                  </div>
                </td>
                <td className="px-2 py-2.5">
                  <span className={cn("num font-bold", `tone-${kdaTone(c.deaths === 0 ? "Perfect" : c.kda)}`)}>{c.deaths === 0 ? "Perfect" : c.kda.toFixed(2)}</span>
                  <span className="num ml-1.5 text-[10px] text-ink-500">
                    {(c.kills / c.games).toFixed(1)} / {(c.deaths / c.games).toFixed(1)} / {(c.assists / c.games).toFixed(1)}
                  </span>
                </td>
                <td className="num px-2 py-2.5 text-ink-100">{formatNumber(c.damage)}</td>
                <td className={cn("num px-2 py-2.5 font-black", `tone-${scoreTone(c.score)}`)}>{c.score.toFixed(1)}</td>
                <td className="px-2 py-2.5 text-[10px]">
                  <div className="flex gap-1">
                    {c.pentaKills > 0 && <span className="badge-penta">펜타 {c.pentaKills}</span>}
                    {c.quadraKills > 0 && <span className="badge bg-ember-500/20 text-ember-300">쿼드라 {c.quadraKills}</span>}
                    {c.tripleKills > 0 && <span className="badge bg-white/[0.06] text-ink-200">트리플 {c.tripleKills}</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
