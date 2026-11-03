"use client";

import { useMemo, useState } from "react";
import { Match, QUEUE_NAMES } from "@/types/riot";
import {
  calcKDA, calcKillParticipation, calcMatchScores, cn, formatDurationShort, formatRelative, formatNumber,
  getParticipant, getTeamKills, isRemake, kdaTone, participantItems, scoreTone,
} from "@/lib/utils";
import ChampionImage from "./ChampionImage";
import ItemSlot from "./ItemSlot";
import SpellIcon from "./SpellIcon";
import RuneIcon from "./RuneIcon";
import MatchDetail from "./MatchDetail";
import { useAssets } from "./AssetsProvider";

interface MatchCardProps {
  match: Match;
  puuid: string;
  now: number;
}

const MULTI_LABEL: Record<number, string> = { 2: "더블킬", 3: "트리플킬", 4: "쿼드라킬", 5: "펜타킬" };

export default function MatchCard({ match, puuid, now }: MatchCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { champions } = useAssets();
  const participant = getParticipant(match, puuid);
  const scores = useMemo(() => calcMatchScores(match), [match]);

  if (!participant) return null;

  const remake = isRemake(match);
  const isWin = participant.win;
  const kda = calcKDA(participant.kills, participant.deaths, participant.assists);
  const kp = calcKillParticipation(participant, getTeamKills(match, participant.teamId));
  const queueName = QUEUE_NAMES[match.info.queueId] ?? "칼바람";
  const mine = scores[puuid];
  const items = participantItems(participant);
  const teamDmgMax = Math.max(...match.info.participants.map((p) => p.totalDamageDealtToChampions), 1);
  const dmgPct = Math.round((participant.totalDamageDealtToChampions / teamDmgMax) * 100);
  const team = match.info.participants.filter((p) => p.teamId === participant.teamId);
  const enemy = match.info.participants.filter((p) => p.teamId !== participant.teamId);

  return (
    <article
      className={cn(
        "group/card relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300",
        remake ? "match-remake" : isWin ? "match-win" : "match-lose",
        expanded ? "shadow-frost" : "hover:-translate-y-px hover:shadow-card"
      )}
    >
      {/* 좌측 결과 바 */}
      <div className={cn("absolute inset-y-0 left-0 w-1", remake ? "bg-ink-400" : isWin ? "bg-win shadow-[0_0_12px_#4cc2ff]" : "bg-lose shadow-[0_0_12px_#ff5c7a]")} />

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="relative flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left sm:flex-nowrap sm:gap-4"
      >
        {/* 결과/시간 */}
        <div className="flex w-[74px] shrink-0 flex-col">
          <span className={cn("text-sm font-black", remake ? "text-ink-300" : isWin ? "text-win" : "text-lose")}>
            {remake ? "다시하기" : isWin ? "승리" : "패배"}
          </span>
          <span className="text-[11px] font-semibold text-ink-300">{queueName}</span>
          <span className="num text-[11px] text-ink-400">{formatRelative(match.info.gameCreation, now)}</span>
          <span className="num text-[11px] text-ink-500">{formatDurationShort(match.info.gameDuration)}</span>
        </div>

        {/* 챔피언 + 스펠/룬 */}
        <div className="flex shrink-0 items-center gap-1.5">
          <ChampionImage championName={participant.championName} size={52} level={participant.champLevel} shape="rounded" />
          <div className="flex flex-col gap-1">
            <SpellIcon spellId={participant.summoner1Id} size={22} />
            <SpellIcon spellId={participant.summoner2Id} size={22} />
          </div>
          <div className="flex flex-col gap-1">
            <RuneIcon runeId={participant.keystoneId} size={22} keystone />
            <RuneIcon runeId={participant.secondaryStyleId} size={22} />
          </div>
        </div>

        {/* KDA */}
        <div className="flex w-[118px] shrink-0 flex-col">
          <span className="num text-base font-black text-white">
            {participant.kills} <span className="text-ink-500">/</span> <span className="text-lose">{participant.deaths}</span> <span className="text-ink-500">/</span>{" "}
            {participant.assists}
          </span>
          <span className={cn("num text-xs font-bold", `tone-${kdaTone(kda === "Perfect" ? "Perfect" : parseFloat(kda))}`)}>{kda} KDA</span>
          <span className="num text-[11px] text-ink-400">킬관여 {kp}%</span>
        </div>

        {/* 나락 점수 + 딜량 */}
        <div className="hidden w-[120px] shrink-0 flex-col gap-1 md:flex">
          <div className="flex items-baseline gap-1.5">
            <span className={cn("num text-base font-black", `tone-${scoreTone(mine?.score ?? 0)}`)}>{mine?.score.toFixed(1)}</span>
            <span className="text-[10px] text-ink-500">점 · {mine?.rank}위</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-gradient-to-r from-ember-500 to-ember-300" style={{ width: `${dmgPct}%` }} />
            </div>
            <span className="num text-[11px] text-ink-300">{formatNumber(participant.totalDamageDealtToChampions)}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {mine?.badge === "MVP" && <span className="badge-mvp">MVP</span>}
            {mine?.badge === "ACE" && <span className="badge-ace">ACE</span>}
            {participant.largestMultiKill >= 2 && (
              <span className={cn("badge", participant.largestMultiKill >= 5 ? "badge-penta" : participant.largestMultiKill === 4 ? "bg-ember-500/20 text-ember-300" : "bg-white/[0.06] text-ink-200")}>
                {MULTI_LABEL[participant.largestMultiKill]}
              </span>
            )}
          </div>
        </div>

        {/* 아이템 */}
        <div className="hidden shrink-0 sm:block">
          <div className="grid grid-cols-4 gap-1">
            {items.slice(0, 3).map((id, i) => (
              <ItemSlot key={i} itemId={id} size={26} />
            ))}
            <ItemSlot itemId={items[6]} size={26} trinket />
            {items.slice(3, 6).map((id, i) => (
              <ItemSlot key={i + 3} itemId={id} size={26} />
            ))}
          </div>
        </div>

        {/* 팀 구성 */}
        <div className="ml-auto hidden shrink-0 gap-2 lg:flex">
          {[team, enemy].map((side, si) => (
            <div key={si} className="flex flex-col gap-0.5">
              {side.map((p) => (
                <div key={p.puuid} className={cn("flex items-center gap-1 text-[10px] leading-none", p.puuid === puuid ? "font-black text-white" : "text-ink-400")}>
                  <ChampionImage championName={p.championName} size={16} />
                  <span className="w-[62px] truncate">{p.riotIdGameName || p.summonerName}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* 모바일 전용: 점수 + 배지 + 아이템 */}
        <div className="flex basis-full items-center gap-2 border-t border-white/[0.05] pt-2 md:hidden">
          <span className={cn("num text-sm font-black", `tone-${scoreTone(mine?.score ?? 0)}`)}>{mine?.score.toFixed(1)}</span>
          <span className="text-[10px] text-ink-500">{mine?.rank}위</span>
          {mine?.badge === "MVP" && <span className="badge-mvp">MVP</span>}
          {mine?.badge === "ACE" && <span className="badge-ace">ACE</span>}
          {participant.largestMultiKill >= 2 && (
            <span className={cn("badge", participant.largestMultiKill >= 5 ? "badge-penta" : participant.largestMultiKill === 4 ? "bg-ember-500/20 text-ember-300" : "bg-white/[0.06] text-ink-200")}>
              {MULTI_LABEL[participant.largestMultiKill]}
            </span>
          )}
          <div className="ml-auto flex gap-0.5 sm:hidden">
            {items.slice(0, 6).map((id, i) => (
              <ItemSlot key={i} itemId={id} size={22} />
            ))}
            <ItemSlot itemId={items[6]} size={22} trinket />
          </div>
          <span className="num ml-auto hidden text-[11px] text-ink-300 sm:inline">딜 {formatNumber(participant.totalDamageDealtToChampions)}</span>
        </div>

        {/* 펼침 화살표 */}
        <div className={cn("absolute right-3 top-3 flex w-6 shrink-0 items-center justify-center text-ink-500 transition-transform duration-300 sm:static sm:ml-1", expanded && "rotate-180 text-frost-300")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      {/* 상세 */}
      <div className={cn("grid transition-[grid-template-rows] duration-300 ease-out", expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          {expanded && (
            <div className="border-t border-white/[0.06] bg-abyss-900/60 animate-expand">
              <MatchDetail match={match} puuid={puuid} scores={scores} />
            </div>
          )}
        </div>
      </div>
      <span className="sr-only">{champions[participant.championName] ?? participant.championName}</span>
    </article>
  );
}
