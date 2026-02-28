"use client";

import Image from "next/image";
import { Summoner, RiotAccount, LeagueEntry } from "@/types/riot";
import { getProfileIconUrl, getTierColor } from "@/lib/utils";
import SearchBar from "./SearchBar";

interface SummonerHeaderProps {
  account: RiotAccount;
  summoner: Summoner;
  leagueEntries: LeagueEntry[];
  region: string;
}

const TIER_KR: Record<string, string> = {
  IRON: "아이언",
  BRONZE: "브론즈",
  SILVER: "실버",
  GOLD: "골드",
  PLATINUM: "플래티넘",
  EMERALD: "에메랄드",
  DIAMOND: "다이아몬드",
  MASTER: "마스터",
  GRANDMASTER: "그랜드마스터",
  CHALLENGER: "챌린저",
};

const RANK_KR: Record<string, string> = {
  I: "1",
  II: "2",
  III: "3",
  IV: "4",
};

export default function SummonerHeader({
  account,
  summoner,
  leagueEntries,
  region,
}: SummonerHeaderProps) {
  const soloRank = leagueEntries.find(
    (e) => e.queueType === "RANKED_SOLO_5x5"
  );

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="max-w-md">
        <SearchBar size="sm" />
      </div>

      {/* Profile card */}
      <div className="card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Profile icon */}
        <div className="relative">
          <Image
            src={getProfileIconUrl(summoner.profileIconId)}
            alt="profile"
            width={80}
            height={80}
            className="rounded-2xl border-2 border-white/10"
          />
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold px-2 py-0.5 rounded-full border border-white/10">
            {summoner.summonerLevel}
          </span>
        </div>

        {/* Name + rank */}
        <div className="flex-1">
          <h1 className="text-2xl font-black text-white">
            {account.gameName}
            <span className="text-slate-500 text-base ml-1">
              #{account.tagLine}
            </span>
          </h1>
          <div className="text-sm text-slate-500 mt-0.5 mb-3">
            {region.toUpperCase()} 서버
          </div>

          {/* Rank badges */}
          {soloRank ? (
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
              <span
                className="text-sm font-bold"
                style={{ color: getTierColor(soloRank.tier) }}
              >
                {TIER_KR[soloRank.tier] ?? soloRank.tier}{" "}
                {RANK_KR[soloRank.rank] ?? soloRank.rank}
              </span>
              <span className="text-slate-500 text-xs">
                {soloRank.leaguePoints} LP
              </span>
              <span className="text-slate-500 text-xs">
                · {soloRank.wins}승 {soloRank.losses}패 (
                {Math.round(
                  (soloRank.wins / (soloRank.wins + soloRank.losses)) * 100
                )}
                %)
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              언랭크
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
