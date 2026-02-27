"use client";

import { useState } from "react";
import { Match, MatchParticipant, QUEUE_NAMES } from "@/types/riot";
import {
  calcKDA,
  calcKillParticipation,
  getTeamKills,
  formatDuration,
  formatDate,
  formatNumber,
  getParticipant,
} from "@/lib/utils";
import ChampionImage from "./ChampionImage";
import ItemSlot from "./ItemSlot";

interface MatchCardProps {
  match: Match;
  puuid: string;
}

export default function MatchCard({ match, puuid }: MatchCardProps) {
  const [expanded, setExpanded] = useState(false);
  const participant = getParticipant(match, puuid);

  if (!participant) return null;

  const isWin = participant.win;
  const kda = calcKDA(participant.kills, participant.deaths, participant.assists);
  const teamKills = getTeamKills(match, participant.teamId);
  const kp = calcKillParticipation(participant, teamKills);
  const queueName = QUEUE_NAMES[match.info.queueId] ?? "칼바람";

  const blue = match.info.participants.filter((p) => p.teamId === 100);
  const red = match.info.participants.filter((p) => p.teamId === 200);

  const items = [
    participant.item0,
    participant.item1,
    participant.item2,
    participant.item3,
    participant.item4,
    participant.item5,
    participant.item6,
  ];

  const maxDamage = Math.max(
    ...match.info.participants.map((p) => p.totalDamageDealtToChampions)
  );

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all ${
        isWin
          ? "border-win/30 bg-win/5"
          : "border-lose/30 bg-lose/5"
      }`}
    >
      {/* Main Row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Win/Lose indicator */}
        <div
          className={`w-1 self-stretch rounded-full shrink-0 ${
            isWin ? "bg-win" : "bg-lose"
          }`}
        />

        {/* Champion */}
        <ChampionImage
          championName={participant.championName}
          size={52}
          level={participant.champLevel}
        />

        {/* Queue + time */}
        <div className="flex flex-col min-w-[80px]">
          <span
            className={`text-xs font-bold ${isWin ? "text-win" : "text-lose"}`}
          >
            {isWin ? "승리" : "패배"}
          </span>
          <span className="text-xs text-slate-400">{queueName}</span>
          <span className="text-xs text-slate-500">
            {formatDate(match.info.gameCreation)}
          </span>
          <span className="text-xs text-slate-500">
            {formatDuration(match.info.gameDuration)}
          </span>
        </div>

        {/* KDA */}
        <div className="flex flex-col items-center min-w-[100px]">
          <span className="text-lg font-bold text-white">
            {participant.kills}{" "}
            <span className="text-slate-500">/</span>{" "}
            <span className="text-lose">{participant.deaths}</span>{" "}
            <span className="text-slate-500">/</span>{" "}
            {participant.assists}
          </span>
          <span
            className={`text-xs font-bold ${
              kda === "Perfect"
                ? "text-orange-400"
                : parseFloat(kda) >= 3
                ? "text-yellow-400"
                : "text-slate-400"
            }`}
          >
            {kda} KDA
          </span>
          <span className="text-xs text-slate-500">킬관여 {kp}%</span>
        </div>

        {/* Stats */}
        <div className="flex flex-col text-xs text-slate-400 min-w-[100px]">
          <span>
            딜:{" "}
            <strong className="text-slate-200">
              {formatNumber(participant.totalDamageDealtToChampions)}
            </strong>
          </span>
          <span>
            받은:{" "}
            <strong className="text-slate-200">
              {formatNumber(participant.totalDamageTaken)}
            </strong>
          </span>
          {participant.pentaKills > 0 && (
            <span className="text-red-400 font-bold">펜타킬!</span>
          )}
          {participant.quadraKills > 0 && participant.pentaKills === 0 && (
            <span className="text-orange-400 font-bold">쿼드라킬</span>
          )}
        </div>

        {/* Items */}
        <div className="flex flex-wrap gap-1 max-w-[160px]">
          {items.slice(0, 6).map((itemId, i) => (
            <ItemSlot key={i} itemId={itemId} size={28} />
          ))}
          <ItemSlot itemId={items[6]} size={28} />
        </div>

        {/* Expand arrow */}
        <div className="ml-auto text-slate-500 text-xs">
          {expanded ? "▲" : "▼"}
        </div>
      </div>

      {/* Expanded: Team comparison */}
      {expanded && (
        <div className="border-t border-white/5 px-4 py-4 bg-black/20">
          <div className="grid grid-cols-2 gap-4">
            {[
              { team: blue, label: "블루팀", color: "text-blue-400" },
              { team: red, label: "레드팀", color: "text-red-400" },
            ].map(({ team, label, color }) => (
              <div key={label}>
                <div className={`text-xs font-bold mb-2 ${color}`}>{label}</div>
                <div className="space-y-1.5">
                  {team.map((p) => (
                    <ParticipantRow
                      key={p.puuid}
                      participant={p}
                      isMe={p.puuid === puuid}
                      maxDamage={maxDamage}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ParticipantRow({
  participant,
  isMe,
  maxDamage,
}: {
  participant: MatchParticipant;
  isMe: boolean;
  maxDamage: number;
}) {
  const dmgPct = maxDamage > 0
    ? Math.round((participant.totalDamageDealtToChampions / maxDamage) * 100)
    : 0;

  const displayName =
    participant.riotIdGameName || participant.summonerName || "?";

  return (
    <div
      className={`flex items-center gap-2 text-xs rounded px-2 py-1 ${
        isMe ? "bg-white/10 font-bold" : ""
      }`}
    >
      <ChampionImage championName={participant.championName} size={22} />
      <span className={`w-24 truncate ${isMe ? "text-white" : "text-slate-300"}`}>
        {displayName}
      </span>
      <span className="text-slate-400 w-16 text-center">
        {participant.kills}/{participant.deaths}/{participant.assists}
      </span>
      {/* Damage bar */}
      <div className="flex-1 flex items-center gap-1">
        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500/70 rounded-full"
            style={{ width: `${dmgPct}%` }}
          />
        </div>
        <span className="text-slate-500 w-10 text-right">
          {formatNumber(participant.totalDamageDealtToChampions)}
        </span>
      </div>
    </div>
  );
}
