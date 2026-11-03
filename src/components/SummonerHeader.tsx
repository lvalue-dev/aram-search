"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Summoner, RiotAccount, LeagueEntry, SummonerStats, REGIONS, RegionKey } from "@/types/riot";
import { profileIconUrl, championSplashUrl } from "@/lib/ddragon";
import { getTierColor, TIER_KR, RANK_KR, formatRelative } from "@/lib/utils";
import { isFavorite, pushRecent, toggleFavorite } from "@/lib/storage";
import { useAssets } from "./AssetsProvider";
import { useNavigation } from "./NavigationProvider";
import Tooltip from "./ui/Tooltip";

interface SummonerHeaderProps {
  account: RiotAccount;
  summoner: Summoner;
  leagueEntries: LeagueEntry[];
  region: RegionKey;
  stats: SummonerStats;
  loadedAt: number;
}

const QUEUE_LABEL: Record<string, string> = {
  RANKED_SOLO_5x5: "솔로랭크",
  RANKED_FLEX_SR: "자유랭크",
};

export default function SummonerHeader({ account, summoner, leagueEntries, region, stats, loadedAt }: SummonerHeaderProps) {
  const { version } = useAssets();
  const { refresh, pending } = useNavigation();
  const [fav, setFav] = useState(false);
  const [copied, setCopied] = useState(false);
  const [iconError, setIconError] = useState(false);

  const key = { region, gameName: account.gameName, tagLine: account.tagLine, profileIconId: summoner.profileIconId };

  useEffect(() => {
    pushRecent(key);
    setFav(isFavorite(key));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account.puuid]);

  const mostPlayed = stats.championStats[0]?.championName;
  const ranks = leagueEntries.filter((e) => QUEUE_LABEL[e.queueType]).sort((a) => (a.queueType === "RANKED_SOLO_5x5" ? -1 : 1));

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <section className="panel overflow-hidden animate-rise">
      {/* 스플래시 배경 */}
      {mostPlayed && (
        <div className="pointer-events-none absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={championSplashUrl(mostPlayed)}
            alt=""
            className="h-full w-full object-cover object-[center_20%] opacity-25 blur-[1px] saturate-[0.8]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-abyss-800 via-abyss-800/85 to-abyss-800/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-abyss-800 via-transparent to-transparent" />
        </div>
      )}

      <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-center">
        {/* 아이콘 */}
        <div className="relative shrink-0 self-start">
          <div className="absolute -inset-1 rounded-[22px] bg-gradient-to-br from-frost-300/60 via-transparent to-aurora-violet/50 opacity-80 blur-[2px]" />
          <div className="relative h-24 w-24 overflow-hidden rounded-[20px] border border-frost-300/30 bg-abyss-700">
            {!iconError ? (
              <Image src={profileIconUrl(summoner.profileIconId, version)} alt="" width={96} height={96} onError={() => setIconError(true)} unoptimized />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-black text-frost-200">{account.gameName.slice(0, 1)}</div>
            )}
          </div>
          <span className="num absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-frost-300/30 bg-abyss-900 px-2.5 py-0.5 text-[11px] font-black text-frost-100 shadow-glow">
            Lv.{summoner.summonerLevel}
          </span>
        </div>

        {/* 이름/랭크 */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="truncate text-3xl font-black tracking-tight text-white text-shadow-frost">
              {account.gameName}
              <span className="ml-1.5 text-lg font-bold text-ink-400">#{account.tagLine}</span>
            </h1>
            <span className="rounded-md border border-frost-300/20 bg-frost-500/10 px-2 py-0.5 text-[11px] font-bold text-frost-200">
              {REGIONS[region].short} · {REGIONS[region].name}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {ranks.length > 0 ? (
              ranks.map((r) => {
                const total = r.wins + r.losses;
                const wr = total > 0 ? Math.round((r.wins / total) * 100) : 0;
                const color = getTierColor(r.tier);
                return (
                  <div key={r.queueType} className="glass flex items-center gap-2.5 rounded-xl px-3 py-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
                    <span className="text-[11px] font-semibold text-ink-400">{QUEUE_LABEL[r.queueType]}</span>
                    <span className="text-sm font-black" style={{ color }}>
                      {TIER_KR[r.tier] ?? r.tier} {["MASTER", "GRANDMASTER", "CHALLENGER"].includes(r.tier) ? "" : RANK_KR[r.rank] ?? r.rank}
                    </span>
                    <span className="num text-xs text-ink-300">{r.leaguePoints} LP</span>
                    <span className="num text-[11px] text-ink-400">
                      {r.wins}승 {r.losses}패 · {wr}%
                    </span>
                    {r.hotStreak && <span className="badge bg-ember-500/20 text-ember-300">연승중</span>}
                  </div>
                );
              })
            ) : (
              <span className="glass rounded-xl px-3 py-1.5 text-xs font-semibold text-ink-400">랭크 정보 없음 (언랭크)</span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-400">
            <span>
              최근 {stats.totalGames}게임 기준 · 나락 점수 평균 <strong className="num text-frost-200">{stats.avgScore}</strong>
            </span>
            {stats.streak !== 0 && (
              <span className={stats.streak > 0 ? "text-win" : "text-lose"}>
                {Math.abs(stats.streak)}{stats.streak > 0 ? "연승" : "연패"} 중
              </span>
            )}
            <span>갱신 {formatRelative(loadedAt)}</span>
          </div>
        </div>

        {/* 액션 */}
        <div className="flex shrink-0 items-center gap-2 self-start md:self-center">
          <Tooltip content={fav ? "즐겨찾기 해제" : "즐겨찾기 추가"} side="bottom">
            <button
              type="button"
              aria-pressed={fav}
              onClick={() => setFav(toggleFavorite(key))}
              className={`btn-icon text-lg ${fav ? "border-ember-400/50 bg-ember-400/15 text-ember-300" : ""}`}
            >
              {fav ? "★" : "☆"}
            </button>
          </Tooltip>
          <Tooltip content={copied ? "복사됨!" : "링크 복사"} side="bottom">
            <button type="button" onClick={share} className="btn-icon" aria-label="링크 복사">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 007.07 0l2.83-2.83a5 5 0 00-7.07-7.07L11 4.9" />
                <path d="M14 11a5 5 0 00-7.07 0L4.1 13.83a5 5 0 007.07 7.07L13 19.1" />
              </svg>
            </button>
          </Tooltip>
          <button type="button" onClick={() => refresh("최신 전적을 다시 불러오는 중")} disabled={pending} className="btn-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={pending ? "animate-spin" : ""}>
              <path d="M21 12a9 9 0 11-3-6.7" />
              <path d="M21 3v6h-6" />
            </svg>
            전적 갱신
          </button>
        </div>
      </div>
    </section>
  );
}
