import { formatMilliseconds } from "@/lib/utils/format";
import { Time } from "@/types/timer";

export function SessionSummary({
  count, best, mean, worst, dnfCount, totalTime,
}: {
  count: number; best: number | null; mean: number | null; worst: number | null; dnfCount: number; totalTime: number;
}) {
  if (count === 0) return null;
  const hours = Math.floor(totalTime / Time.hour);
  const minutes = Math.floor((totalTime % Time.hour) / Time.minute);
  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider">Session Summary</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
        <div className="flex flex-col gap-0.5 rounded-lg px-3 py-2 border border-border/20 bg-bg-elevated/40">
          <span className="text-[10px] text-secondary/70 uppercase tracking-wider font-medium">Solves</span>
          <span className="text-sm font-mono tabular-nums font-semibold text-primary">{count}</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg px-3 py-2 border border-accent/30 bg-accent/[0.06]">
          <span className="text-[10px] text-secondary/70 uppercase tracking-wider font-medium">Best</span>
          <span className="text-sm font-mono tabular-nums font-semibold text-accent">{best != null ? formatMilliseconds(best) : "—"}</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg px-3 py-2 border border-border/20 bg-bg-elevated/40">
          <span className="text-[10px] text-secondary/70 uppercase tracking-wider font-medium">Average</span>
          <span className="text-sm font-mono tabular-nums font-semibold text-primary">{mean != null ? formatMilliseconds(mean) : "—"}</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg px-3 py-2 border border-red-500/20 bg-red-500/[0.06]">
          <span className="text-[10px] text-secondary/70 uppercase tracking-wider font-medium">Worst</span>
          <span className="text-sm font-mono tabular-nums font-semibold text-red-400">{worst != null ? formatMilliseconds(worst) : "—"}</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg px-3 py-2 border border-border/20 bg-bg-elevated/40">
          <span className="text-[10px] text-secondary/70 uppercase tracking-wider font-medium">DNFs</span>
          <span className="text-sm font-mono tabular-nums font-semibold text-primary">{dnfCount > 0 ? String(dnfCount) : "0"}</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg px-3 py-2 border border-border/20 bg-bg-elevated/40">
          <span className="text-[10px] text-secondary/70 uppercase tracking-wider font-medium">Time</span>
          <span className="text-sm font-mono tabular-nums font-semibold text-primary">{hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}</span>
        </div>
      </div>
    </section>
  );
}
