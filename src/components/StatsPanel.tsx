"use client";

import { SummonerStats } from "@/types/riot";
import { formatNumber, formatDurationShort, kdaTone, scoreTone, cn } from "@/lib/utils";
import ChampionImage from "./ChampionImage";
import WinRateRing from "./ui/WinRateRing";
import { useAssets } from "./AssetsProvider";

interface StatsPanelProps {
  stats: SummonerStats;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  const { champions } = useAssets();

  if (stats.totalGames === 0) {
    return (
      <div className="panel p-6 text-center">
        <div className="text-3xl">❄️</div>
        <p className="mt-2 text-sm font-semibold text-ink-200">칼바람 전적이 없어요</p>
        <p className="mt-1 text-xs text-ink-400">최근 칼바람 나락 / 아수라장 게임이 없습니다.</p>
      </div>
    );
  }

  const { winRate, avgKills, avgDeaths, avgAssists, avgKDA, championStats } = stats;
  const kdaT = kdaTone(stats.perfectKda ? "Perfect" : avgKDA);

  return (
    <div className="space-y-4">
      {/* 종합 */}
      <section className="panel p-5">
        <div className="flex items-center justify-between">
          <h3 className="label">최근 {stats.totalGames}게임</h3>
          <span className={cn("num text-xs font-bold", `tone-${scoreTone(stats.avgScore)}`)}>나락 점수 {stats.avgScore}</span>
        </div>

        <div className="mt-4 flex items-center gap-5">
          <WinRateRing winRate={winRate} sublabel={`${stats.wins}승 ${stats.losses}패`} />
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <div className="num text-lg font-black text-white">
                {avgKills} <span className="text-ink-500">/</span> <span className="text-lose">{avgDeaths}</span> <span className="text-ink-500">/</span> {avgAssists}
              </div>
              <div className={cn("num text-xs font-bold", `tone-${kdaT}`)}>
                {stats.perfectKda ? "Perfect" : avgKDA} KDA · 킬관여 {stats.avgKillParticipation}%
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-ink-400">
              <span>
                딜량 <strong className="num text-ink-100">{formatNumber(stats.avgDamage)}</strong>
              </span>
              <span>
                받은 피해 <strong className="num text-ink-100">{formatNumber(stats.avgDamageTaken)}</strong>
              </span>
              <span>
                골드 <strong className="num text-ink-100">{formatNumber(stats.avgGold)}</strong>
              </span>
              <span>
                게임 시간 <strong className="num text-ink-100">{formatDurationShort(stats.avgDuration)}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 최근 폼 */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="label">최근 폼</span>
            {stats.streak !== 0 && (
              <span className={cn("text-[11px] font-bold", stats.streak > 0 ? "text-win" : "text-lose")}>
                {Math.abs(stats.streak)}{stats.streak > 0 ? "연승" : "연패"}
              </span>
            )}
          </div>
          <div className="flex gap-1.5 stagger">
            {stats.recentForm.map((w, i) => (
              <span
                key={i}
                title={w ? "승리" : "패배"}
                className={cn(
                  "h-7 flex-1 rounded-md text-center text-[10px] font-black leading-7",
                  w ? "bg-win/20 text-win shadow-[inset_0_-2px_0_#4cc2ff]" : "bg-lose/15 text-lose shadow-[inset_0_-2px_0_#ff5c7a]"
                )}
              >
                {w ? "W" : "L"}
              </span>
            ))}
          </div>
        </div>

        {/* 배지 */}
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <Stat label="MVP" value={stats.mvpCount} tone="text-ember-300" />
          <Stat label="ACE" value={stats.aceCount} tone="text-aurora-violet" />
          <Stat label="펜타킬" value={stats.multiKills.penta} tone="text-lose" />
        </div>
      </section>

      {/* 챔피언 */}
      <section className="panel p-5">
        <h3 className="label">많이 한 챔피언</h3>
        <div className="mt-3 space-y-3 stagger">
          {championStats.slice(0, 6).map((cs) => {
            const wr = Math.round((cs.wins / cs.games) * 100);
            const kda = cs.deaths === 0 ? "Perfect" : ((cs.kills + cs.assists) / cs.deaths).toFixed(2);
            return (
              <div key={cs.championName} className="flex items-center gap-3">
                <ChampionImage championName={cs.championName} size={38} shape="rounded" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate font-bold text-white">{champions[cs.championName] ?? cs.championName}</span>
                    <span className={cn("num font-black", wr >= 60 ? "text-win" : wr < 40 ? "text-lose" : "text-ink-200")}>{wr}%</span>
                  </div>
                  <div className="num mt-0.5 flex items-center gap-2 text-[11px] text-ink-400">
                    <span>
                      {cs.games}게임 ({cs.wins}승 {cs.games - cs.wins}패)
                    </span>
                    <span className={cn("font-semibold", `tone-${kdaTone(kda === "Perfect" ? "Perfect" : parseFloat(kda))}`)}>KDA {kda}</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className={cn("h-full origin-left rounded-full animate-grow-bar", wr >= 50 ? "bg-gradient-to-r from-win/60 to-frost-300" : "bg-gradient-to-r from-lose/60 to-lose")}
                      style={{ width: `${wr}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="glass rounded-xl py-2">
      <div className={cn("num text-lg font-black leading-none", value > 0 ? tone : "text-ink-500")}>{value}</div>
      <div className="mt-1 text-[10px] font-semibold text-ink-400">{label}</div>
    </div>
  );
}
