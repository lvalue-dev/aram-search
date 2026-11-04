"use client";

import { RiotAccount, Summoner, SummonerStats } from "@/types/riot";
import { cn, formatNumber, kdaTone, scoreTone } from "@/lib/utils";
import { summonerHref } from "@/lib/storage";
import ChampionImage from "./ChampionImage";
import WinRateRing from "./ui/WinRateRing";
import { useAssets } from "./AssetsProvider";
import { useNavigation } from "./NavigationProvider";

export interface MultiEntry {
  input: { gameName: string; tagLine: string; tagGuessed?: boolean };
  failed?: number;
  region: string;
  account?: RiotAccount;
  summoner?: Summoner;
  stats?: SummonerStats;
  error?: string;
}

export default function MultiCard({ entry }: { entry: MultiEntry }) {
  const { champions } = useAssets();
  const { navigate } = useNavigation();

  if (!entry.account || !entry.stats || !entry.summoner) {
    return (
      <div className="panel flex flex-col items-center justify-center gap-2 p-6 text-center">
        <div className="text-2xl">🧊</div>
        <div className="text-sm font-bold text-white">
          {entry.input.gameName}
          <span className="text-ink-400">#{entry.input.tagLine}</span>
        </div>
        <p className="text-xs text-lose">{entry.error ?? "불러오지 못했어요"}</p>
      </div>
    );
  }

  const { account, summoner, stats } = entry;
  const href = summonerHref({ region: entry.region, gameName: account.gameName, tagLine: account.tagLine });
  const kdaT = kdaTone(stats.perfectKda ? "Perfect" : stats.avgKDA);

  return (
    <div className="panel panel-hover flex flex-col gap-4 p-5">
      <button type="button" onClick={() => navigate(href, { message: `${account.gameName}#${account.tagLine} 님의 나락 기록을 불러오는 중` })} className="text-left">
        <div className="truncate text-base font-black text-white hover:text-frost-200">
          {account.gameName}
          <span className="ml-1 text-xs font-bold text-ink-400">#{account.tagLine}</span>
        </div>
        <div className="text-[11px] text-ink-400">Lv.{summoner.summonerLevel}</div>
      </button>
      {entry.input.tagGuessed && (
        <p className="-mt-2 text-[11px] text-ember-300">태그 없이 검색해 #{account.tagLine} 계정을 보여주는 중이에요. 다른 사람이면 태그를 붙여 주세요.</p>
      )}
      {!!entry.failed && <p className="-mt-2 text-[11px] text-ember-300">요청 한도 때문에 {entry.failed}게임을 건너뛰었어요.</p>}

      {stats.totalGames === 0 ? (
        <p className="text-xs text-ink-400">최근 칼바람 전적이 없어요.</p>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <WinRateRing winRate={stats.winRate} size={84} stroke={9} sublabel={`${stats.wins}승 ${stats.losses}패`} />
            <div className="min-w-0 flex-1 text-xs">
              <div className="num text-base font-black text-white">
                {stats.avgKills} / <span className="text-lose">{stats.avgDeaths}</span> / {stats.avgAssists}
              </div>
              <div className={cn("num font-bold", `tone-${kdaT}`)}>{stats.perfectKda ? "Perfect" : stats.avgKDA} KDA</div>
              <div className="num mt-1 text-ink-400">
                나락 점수 <span className={cn("font-black", `tone-${scoreTone(stats.avgScore)}`)}>{stats.avgScore}</span> · 딜 {formatNumber(stats.avgDamage)}
              </div>
              {stats.streak !== 0 && (
                <div className={cn("num text-[11px] font-bold", stats.streak > 0 ? "text-win" : "text-lose")}>
                  {Math.abs(stats.streak)}{stats.streak > 0 ? "연승" : "연패"} 중
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-1">
            {stats.recentForm.map((w, i) => (
              <span key={i} className={cn("h-1.5 flex-1 rounded-full", w ? "bg-win" : "bg-lose/70")} />
            ))}
          </div>

          <div className="space-y-1.5">
            {stats.championStats.slice(0, 3).map((c) => {
              const wr = Math.round((c.wins / c.games) * 100);
              return (
                <div key={c.championName} className="flex items-center gap-2 text-[11px]">
                  <ChampionImage championName={c.championName} size={24} />
                  <span className="min-w-0 flex-1 truncate font-semibold text-ink-100">{champions[c.championName] ?? c.championName}</span>
                  <span className="num text-ink-400">{c.games}게임</span>
                  <span className={cn("num w-9 text-right font-black", wr >= 60 ? "text-win" : wr < 40 ? "text-lose" : "text-ink-200")}>{wr}%</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
