import { cn } from "@/lib/utils";

type Tone = "info" | "warn" | "demo";

const TONES: Record<Tone, { box: string; icon: string }> = {
  info: { box: "border-frost-300/25 bg-frost-500/10 text-frost-100", icon: "ℹ" },
  warn: { box: "border-ember-400/30 bg-ember-500/10 text-ember-300", icon: "!" },
  demo: { box: "border-aurora-pink/40 bg-aurora-pink/10 text-aurora-pink", icon: "⚠" },
};

/** 페이지 상단 안내 배너 (서버/클라이언트 공용) */
export default function Notice({ tone = "info", title, children, className }: { tone?: Tone; title: string; children?: React.ReactNode; className?: string }) {
  const t = TONES[tone];
  return (
    <div role={tone === "info" ? "status" : "alert"} className={cn("flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm animate-rise", t.box, className)}>
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[11px] font-black">{t.icon}</span>
      <div className="min-w-0">
        <p className="font-bold">{title}</p>
        {children && <div className="mt-0.5 text-xs leading-relaxed text-ink-200">{children}</div>}
      </div>
    </div>
  );
}
