import { formatMilliseconds } from "@/lib/utils/format";

export function ConsistencySection({
  median, iqr, consistency, stdDev,
}: {
  median: number | null;
  iqr: number | null;
  consistency: number | null;
  stdDev: number | null;
}) {
  if (median == null) return null;
  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider">Consistency</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        <div className={`flex flex-col gap-0.5 rounded-lg px-3 py-2 border border-border/20 bg-bg-elevated/40`}>
          <span className="text-[10px] text-secondary/70 uppercase tracking-wider font-medium">Median</span>
          <span className="text-sm font-mono tabular-nums font-semibold text-primary">{formatMilliseconds(median)}</span>
        </div>
        <div className={`flex flex-col gap-0.5 rounded-lg px-3 py-2 border border-border/20 bg-bg-elevated/40`}>
          <span className="text-[10px] text-secondary/70 uppercase tracking-wider font-medium">Middle 50%</span>
          <span className="text-sm font-mono tabular-nums font-semibold text-primary">{iqr != null ? formatMilliseconds(iqr) : "—"}</span>
        </div>
        <div className={`flex flex-col gap-0.5 rounded-lg px-3 py-2 border border-border/20 bg-bg-elevated/40`}>
          <span className="text-[10px] text-secondary/70 uppercase tracking-wider font-medium">Consistency</span>
          <span className={`text-sm font-mono tabular-nums font-semibold ${consistency != null && consistency >= 80 ? "text-accent" : "text-primary"}`}>{consistency != null ? `${consistency}%` : "—"}</span>
        </div>
        <div className={`flex flex-col gap-0.5 rounded-lg px-3 py-2 border border-border/20 bg-bg-elevated/40`}>
          <span className="text-[10px] text-secondary/70 uppercase tracking-wider font-medium">Std Dev</span>
          <span className="text-sm font-mono tabular-nums font-semibold text-primary">{stdDev != null ? formatMilliseconds(stdDev) : "—"}</span>
        </div>
      </div>
    </section>
  );
}
