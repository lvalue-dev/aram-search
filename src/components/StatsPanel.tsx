import { SummonerStats } from "@/types/riot";
import { getChampionImageUrl, formatNumber } from "@/lib/utils";
import Image from "next/image";

interface StatsPanelProps {
  stats: SummonerStats;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  if (stats.totalGames === 0) {
    return (
      <div className="card p-6 text-center text-slate-500 text-sm">
        칼바람 전적이 없습니다.
      </div>
    );
  }

  const { winRate, avgKills, avgDeaths, avgAssists, avgKDA, avgDamage, championStats } =
    stats;

  return (
    <div className="card p-5 space-y-5">
      <h3 className="text-sm font-bold text-slate-300">칼바람 종합 통계</h3>

      {/* Win rate circle + overall KDA */}
      <div className="flex items-center gap-6">
        {/* Donut chart (CSS) */}
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke="#ffffff0d"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke={winRate >= 60 ? "#3273fa" : winRate >= 50 ? "#3273fa80" : "#e84057"}
              strokeWidth="3"
              strokeDasharray={`${winRate} ${100 - winRate}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-white">{winRate}%</span>
            <span className="text-[10px] text-slate-400">{stats.totalGames}게임</span>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-1 text-sm">
          <div className="flex gap-2 text-slate-300">
            <span className="text-win">{stats.wins}승</span>
            <span className="text-slate-600">/</span>
            <span className="text-lose">{stats.losses}패</span>
          </div>
          <div className="text-slate-400">
            평균{" "}
            <strong className="text-white">
              {avgKills} / {avgDeaths} / {avgAssists}
            </strong>
          </div>
          <div className="text-slate-400">
            KDA{" "}
            <strong
              className={
                typeof avgKDA === "number" && avgKDA >= 4
                  ? "text-orange-400"
                  : avgKDA >= 3
                  ? "text-yellow-400"
                  : "text-white"
              }
            >
              {avgKDA}
            </strong>
          </div>
          <div className="text-slate-400">
            평균 딜량{" "}
            <strong className="text-white">{formatNumber(avgDamage)}</strong>
          </div>
        </div>
      </div>

      {/* Champion stats */}
      <div>
        <div className="text-xs text-slate-500 mb-2">많이 플레이한 챔피언</div>
        <div className="space-y-2">
          {championStats.slice(0, 5).map((cs) => {
            const csWr = Math.round((cs.wins / cs.games) * 100);
            const csKda =
              cs.deaths === 0
                ? "Perfect"
                : ((cs.kills + cs.assists) / cs.deaths).toFixed(2);

            return (
              <div key={cs.championName} className="flex items-center gap-3">
                <div className="relative">
                  <Image
                    src={getChampionImageUrl(cs.championName)}
                    alt={cs.championName}
                    width={36}
                    height={36}
                    className="rounded-full"
                    onError={() => {}}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white font-medium truncate">
                      {cs.championName}
                    </span>
                    <span
                      className={`font-bold ${
                        csWr >= 60
                          ? "text-win"
                          : csWr < 40
                          ? "text-lose"
                          : "text-slate-300"
                      }`}
                    >
                      {csWr}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>{cs.games}게임</span>
                    <span>KDA {csKda}</span>
                    {cs.pentaKills > 0 && (
                      <span className="text-red-400">펜타 {cs.pentaKills}</span>
                    )}
                  </div>
                  {/* Win rate bar */}
                  <div className="h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        csWr >= 50 ? "bg-win/70" : "bg-lose/70"
                      }`}
                      style={{ width: `${csWr}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
