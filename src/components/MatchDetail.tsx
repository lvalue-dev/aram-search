"use client";

import { useState } from "react";
import { Match, MatchParticipant } from "@/types/riot";
import { ScoreEntry, calcKDA, cn, displayName, formatNumber, formatComma, kdaTone, participantItems, scoreTone, getTeamKills } from "@/lib/utils";
import ChampionImage from "./ChampionImage";
import ItemSlot from "./ItemSlot";
import SpellIcon from "./SpellIcon";
import RuneIcon from "./RuneIcon";
import { useAssets } from "./AssetsProvider";
import { summonerHref } from "@/lib/storage";
import { useNavigation } from "./NavigationProvider";

interface Props {
  match: Match;
  puuid: string;
  scores: Record<string, ScoreEntry>;
}

type Metric = "damage" | "taken" | "heal" | "gold" | "cc";
const METRICS: Array<{ key: Metric; label: string; get: (p: MatchParticipant) => number; color: string }> = [
  { key: "damage", label: "가한 피해", get: (p) => p.totalDamageDealtToChampions, color: "from-ember-500 to-ember-300" },
  { key: "taken", label: "받은 피해", get: (p) => p.totalDamageTaken, color: "from-ink-400 to-ink-200" },
  { key: "heal", label: "치유/보호막", get: (p) => p.totalHealsOnTeammates + p.totalDamageShieldedOnTeammates, color: "from-aurora-teal to-frost-200" },
  { key: "gold", label: "골드", get: (p) => p.goldEarned, color: "from-ember-400 to-ember-300" },
  { key: "cc", label: "CC 시간", get: (p) => p.timeCCingOthers, color: "from-aurora-violet to-aurora-pink" },
];

export default function MatchDetail({ match, puuid, scores }: Props) {
  const [metric, setMetric] = useState<Metric>("damage");
  const { champions } = useAssets();
  const { navigate } = useNavigation();
  const m = METRICS.find((x) => x.key === metric)!;
  const max = Math.max(...match.info.participants.map(m.get), 1);
  const me = match.info.participants.find((p) => p.puuid === puuid);
  const myTeam = me?.teamId ?? 100;

  const teams = [myTeam, myTeam === 100 ? 200 : 100].map((teamId) => ({
    teamId,
    players: match.info.participants.filter((p) => p.teamId === teamId),
    info: match.info.teams.find((t) => t.teamId === teamId),
  }));

  const totals = (ps: MatchParticipant[]) => ({
    kills: ps.reduce((s, p) => s + p.kills, 0),
    deaths: ps.reduce((s, p) => s + p.deaths, 0),
    assists: ps.reduce((s, p) => s + p.assists, 0),
    dmg: ps.reduce((s, p) => s + p.totalDamageDealtToChampions, 0),
    gold: ps.reduce((s, p) => s + p.goldEarned, 0),
  });

  const [a, b] = teams.map((t) => totals(t.players));
  const kills = a.kills + b.kills || 1;
  const dmg = a.dmg + b.dmg || 1;
  const gold = a.gold + b.gold || 1;

  return (
    <div className="space-y-4 p-4">
      {/* 팀 비교 바 */}
      <div className="grid gap-2 sm:grid-cols-3">
        <Compare label="킬" left={a.kills} right={b.kills} pct={(a.kills / kills) * 100} leftWin={teams[0].info?.win} />
        <Compare label="총 피해량" left={formatNumber(a.dmg)} right={formatNumber(b.dmg)} pct={(a.dmg / dmg) * 100} leftWin={teams[0].info?.win} />
        <Compare label="골드" left={formatNumber(a.gold)} right={formatNumber(b.gold)} pct={(a.gold / gold) * 100} leftWin={teams[0].info?.win} />
      </div>

      {/* 지표 선택 */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="label mr-1">막대 지표</span>
        {METRICS.map((x) => (
          <button key={x.key} type="button" onClick={() => setMetric(x.key)} className={cn("chip", metric === x.key && "chip-active")}>
            {x.label}
          </button>
        ))}
      </div>

      {teams.map(({ teamId, players, info }, idx) => {
        const teamKills = getTeamKills(match, teamId);
        return (
          <div key={teamId} className="overflow-hidden rounded-xl border border-white/[0.06]">
            <div className={cn("flex items-center gap-3 px-3 py-2 text-xs", info?.win ? "bg-win/10" : "bg-lose/10")}>
              <span className={cn("font-black", info?.win ? "text-win" : "text-lose")}>{info?.win ? "승리" : "패배"}</span>
              <span className="font-semibold text-ink-300">{idx === 0 ? "아군" : "상대"} · {teamId === 100 ? "블루" : "레드"}팀</span>
              <span className="num ml-auto flex gap-3 text-ink-400">
                <span>포탑 {info?.objectives.tower.kills ?? 0}</span>
                <span>억제기 {info?.objectives.inhibitor.kills ?? 0}</span>
                <span>킬 {teamKills}</span>
              </span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {players
                .slice()
                .sort((x, y) => (scores[y.puuid]?.score ?? 0) - (scores[x.puuid]?.score ?? 0))
                .map((p) => {
                  const isMe = p.puuid === puuid;
                  const s = scores[p.puuid];
                  const kda = calcKDA(p.kills, p.deaths, p.assists);
                  const items = participantItems(p);
                  const value = m.get(p);
                  const pct = Math.round((value / max) * 100);
                  const kp = teamKills > 0 ? Math.round(((p.kills + p.assists) / teamKills) * 100) : 0;
                  return (
                    <div key={p.puuid} className={cn("flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 text-xs md:flex-nowrap", isMe && "bg-frost-500/[0.08]")}>
                      {/* 챔피언/스펠/룬 */}
                      <div className="flex shrink-0 items-center gap-1">
                        <ChampionImage championName={p.championName} size={34} level={p.champLevel} shape="rounded" />
                        <div className="flex flex-col gap-0.5">
                          <SpellIcon spellId={p.summoner1Id} size={16} />
                          <SpellIcon spellId={p.summoner2Id} size={16} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <RuneIcon runeId={p.keystoneId} size={16} keystone />
                          <RuneIcon runeId={p.secondaryStyleId} size={16} />
                        </div>
                      </div>

                      {/* 이름 */}
                      <div className="w-[120px] min-w-0 shrink-0">
                        <button
                          type="button"
                          onClick={() => navigate(summonerHref({ region: match.info.platformId.toLowerCase(), gameName: p.riotIdGameName || p.summonerName, tagLine: p.riotIdTagline || "KR1" }), { message: `${displayName(p)} 님의 나락 기록을 불러오는 중` })}
                          className={cn("block max-w-full truncate text-left font-bold hover:text-frost-200 hover:underline", isMe ? "text-frost-100" : "text-ink-100")}
                          title={displayName(p)}
                        >
                          {displayName(p)}
                        </button>
                        <div className="truncate text-[10px] text-ink-400">{champions[p.championName] ?? p.championName}</div>
                      </div>

                      {/* 점수 */}
                      <div className="w-[52px] shrink-0 text-center">
                        <div className={cn("num text-sm font-black", `tone-${scoreTone(s?.score ?? 0)}`)}>{s?.score.toFixed(1)}</div>
                        {s?.badge ? <span className={s.badge === "MVP" ? "badge-mvp" : "badge-ace"}>{s.badge}</span> : <div className="text-[10px] text-ink-500">{s?.rank}위</div>}
                      </div>

                      {/* KDA */}
                      <div className="w-[88px] shrink-0">
                        <div className="num font-bold text-white">
                          {p.kills} / <span className="text-lose">{p.deaths}</span> / {p.assists}
                        </div>
                        <div className={cn("num text-[10px] font-semibold", `tone-${kdaTone(kda === "Perfect" ? "Perfect" : parseFloat(kda))}`)}>
                          {kda} · {kp}%
                        </div>
                      </div>

                      {/* 지표 바 */}
                      <div className="flex min-w-[110px] flex-1 items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                          <div className={cn("h-full origin-left rounded-full bg-gradient-to-r animate-grow-bar", m.color)} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="num w-12 text-right text-[11px] text-ink-200">{metric === "cc" ? `${value}s` : formatNumber(value)}</span>
                      </div>

                      {/* CS/골드 */}
                      <div className="num hidden w-[70px] shrink-0 text-right text-[11px] text-ink-400 lg:block">
                        <div>{formatComma(p.goldEarned)} G</div>
                        <div>CS {p.totalMinionsKilled}</div>
                      </div>

                      {/* 아이템 */}
                      <div className="flex shrink-0 gap-0.5">
                        {items.slice(0, 6).map((id, i) => (
                          <ItemSlot key={i} itemId={id} size={22} />
                        ))}
                        <ItemSlot itemId={items[6]} size={22} trinket />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Compare({ label, left, right, pct, leftWin }: { label: string; left: number | string; right: number | string; pct: number; leftWin?: boolean }) {
  const p = Math.max(4, Math.min(96, pct));
  return (
    <div className="glass rounded-xl px-3 py-2">
      <div className="flex items-center justify-between text-[11px]">
        <span className={cn("num font-black", leftWin ? "text-win" : "text-lose")}>{left}</span>
        <span className="label">{label}</span>
        <span className={cn("num font-black", leftWin ? "text-lose" : "text-win")}>{right}</span>
      </div>
      <div className="mt-1.5 flex h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div className={cn("h-full rounded-l-full", leftWin ? "bg-win" : "bg-lose")} style={{ width: `${p}%` }} />
        <div className={cn("h-full flex-1 rounded-r-full", leftWin ? "bg-lose/70" : "bg-win/70")} />
      </div>
    </div>
  );
}
