"use client";

import { SummonerStats } from "@/types/riot";
import { cn, formatDurationShort, formatNumber, formatRelative } from "@/lib/utils";
import ChampionImage from "./ChampionImage";
import { useAssets } from "./AssetsProvider";

export default function AnalysisPanel({ stats, now }: { stats: SummonerStats; now: number }) {
  const { champions } = useAssets();
  if (stats.totalGames === 0) {
    return <div className="panel p-10 text-center text-sm text-ink-400">분석할 게임이 없어요.</div>;
  }

  const { damageSplit, durationBuckets, multiKills, records } = stats;
  const totalDmg = damageSplit.physical + damageSplit.magic + damageSplit.trueDmg || 1;
  const split = [
    { label: "물리", value: damageSplit.physical, color: "bg-ember-400" },
    { label: "마법", value: damageSplit.magic, color: "bg-frost-400" },
    { label: "고정", value: damageSplit.trueDmg, color: "bg-ink-200" },
  ];
  const multi = [
    { label: "더블킬", value: multiKills.double, color: "text-ink-100" },
    { label: "트리플킬", value: multiKills.triple, color: "text-frost-200" },
    { label: "쿼드라킬", value: multiKills.quadra, color: "text-ember-300" },
    { label: "펜타킬", value: multiKills.penta, color: "text-lose" },
  ];
  const recordList = [
    { label: "최다 킬", rec: records.mostKills, fmt: (v: number) => `${v} 킬` },
    { label: "최대 딜량", rec: records.mostDamage, fmt: (v: number) => formatNumber(v) },
    { label: "최고 KDA", rec: records.bestKda, fmt: (v: number) => `${v.toFixed(2)}` },
    { label: "최장 게임", rec: records.longestGame, fmt: (v: number) => formatDurationShort(v) },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 stagger">
      {/* 피해 유형 */}
      <section className="panel p-5">
        <h3 className="label">피해 유형 분포</h3>
        <p className="mt-1 text-[11px] text-ink-400">챔피언에게 가한 피해 기준</p>
        <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-white/[0.06]">
          {split.map((s) => (
            <div key={s.label} className={cn("h-full origin-left animate-grow-bar", s.color)} style={{ width: `${(s.value / totalDmg) * 100}%` }} title={s.label} />
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {split.map((s) => (
            <div key={s.label} className="glass rounded-xl p-2.5">
              <div className="flex items-center gap-1.5 text-[11px] text-ink-400">
                <span className={cn("h-2 w-2 rounded-full", s.color)} /> {s.label}
              </div>
              <div className="num mt-1 text-lg font-black text-white">{Math.round((s.value / totalDmg) * 100)}%</div>
              <div className="num text-[10px] text-ink-500">평균 {formatNumber(s.value / stats.totalGames)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 게임 길이별 승률 */}
      <section className="panel p-5">
        <h3 className="label">게임 길이별 승률</h3>
        <p className="mt-1 text-[11px] text-ink-400">어떤 템포의 게임에 강한지</p>
        <div className="mt-4 space-y-2.5">
          {durationBuckets.map((b) => {
            const wr = b.games > 0 ? Math.round((b.wins / b.games) * 100) : 0;
            return (
              <div key={b.label} className="flex items-center gap-3 text-xs">
                <span className="w-16 shrink-0 font-semibold text-ink-300">{b.label}</span>
                <div className="relative h-5 flex-1 overflow-hidden rounded-md bg-white/[0.05]">
                  {b.games > 0 && (
                    <div
                      className={cn("h-full origin-left rounded-md animate-grow-bar", wr >= 50 ? "bg-gradient-to-r from-win/40 to-win" : "bg-gradient-to-r from-lose/40 to-lose")}
                      style={{ width: `${Math.max(wr, 6)}%` }}
                    />
                  )}
                  <span className="num absolute inset-y-0 right-2 flex items-center text-[10px] text-ink-300">{b.games}게임</span>
                </div>
                <span className={cn("num w-10 text-right font-black", b.games === 0 ? "text-ink-500" : wr >= 50 ? "text-win" : "text-lose")}>{b.games ? `${wr}%` : "-"}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 멀티킬 */}
      <section className="panel p-5">
        <h3 className="label">멀티킬</h3>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {multi.map((m) => (
            <div key={m.label} className="glass rounded-xl py-3 text-center">
              <div className={cn("num text-2xl font-black", m.value > 0 ? m.color : "text-ink-600")}>{m.value}</div>
              <div className="mt-1 text-[10px] font-semibold text-ink-400">{m.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="glass rounded-xl px-3 py-2">
            <div className="text-[10px] text-ink-400">MVP 획득</div>
            <div className="num text-lg font-black text-ember-300">{stats.mvpCount}회</div>
          </div>
          <div className="glass rounded-xl px-3 py-2">
            <div className="text-[10px] text-ink-400">ACE 획득</div>
            <div className="num text-lg font-black text-aurora-violet">{stats.aceCount}회</div>
          </div>
        </div>
      </section>

      {/* 기록 */}
      <section className="panel p-5">
        <h3 className="label">최고 기록</h3>
        <div className="mt-4 space-y-2">
          {recordList.map(({ label, rec, fmt }) =>
            rec ? (
              <div key={label} className="glass flex items-center gap-3 rounded-xl px-3 py-2">
                <ChampionImage championName={rec.championName} size={34} shape="rounded" ring={rec.win ? "win" : "lose"} />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-semibold text-ink-400">{label}</div>
                  <div className="truncate text-xs text-ink-200">
                    {champions[rec.championName] ?? rec.championName} · {formatRelative(rec.gameCreation, now)}
                  </div>
                </div>
                <div className="num text-lg font-black text-frost-200">{fmt(rec.value)}</div>
              </div>
            ) : null
          )}
        </div>
      </section>
    </div>
  );
}
