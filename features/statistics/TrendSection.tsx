import { formatMilliseconds } from "@/lib/utils/format";
import type { PercentilesData } from "@/types/stats";
import { TrendingUp, TrendingDown, Minus } from "@/components/icons";

function TrendIcon({ direction }: { direction: "up" | "down" | "flat" }) {
  const cls = "size-3.5";
  if (direction === "flat") return <Minus className={cls} />;
  if (direction === "up") return <TrendingUp className={cls} />;
  return <TrendingDown className={cls} />;
}

export function TrendSection({
  recent25, prev25, diff25, recent50, prev50, diff50,
}: {
  recent25: number | null; prev25: number | null; diff25: number | null;
  recent50: number | null; prev50: number | null; diff50: number | null;
}) {
  if (recent25 == null && recent50 == null) return null;
  const dir = (diff: number | null): "up" | "down" | "flat" => {
    if (diff == null) return "flat";
    return diff < 0 ? "up" : diff > 0 ? "down" : "flat";
  };
  const color = (diff: number | null) => {
    if (diff == null) return "text-primary";
    return diff < 0 ? "text-accent" : diff > 0 ? "text-red-400" : "text-primary";
  };

  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider">Trend</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        <div className="rounded-lg px-3 py-2 border border-border/20 bg-bg-elevated/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-secondary/70 uppercase tracking-wider font-medium">Last 25 vs Previous 25</span>
            {diff25 != null && (
              <span className={`flex items-center gap-1 text-xs font-mono font-semibold ${color(diff25)}`}>
                <TrendIcon direction={dir(diff25)} />
                {formatMilliseconds(Math.abs(diff25))}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-secondary/50">Now <span className="font-mono text-primary font-semibold">{recent25 != null ? formatMilliseconds(recent25) : "—"}</span></span>
            <span className="text-xs text-secondary/50">Before <span className="font-mono text-primary font-semibold">{prev25 != null ? formatMilliseconds(prev25) : "—"}</span></span>
          </div>
        </div>
        <div className="rounded-lg px-3 py-2 border border-border/20 bg-bg-elevated/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-secondary/70 uppercase tracking-wider font-medium">Last 50 vs Previous 50</span>
            {diff50 != null && (
              <span className={`flex items-center gap-1 text-xs font-mono font-semibold ${color(diff50)}`}>
                <TrendIcon direction={dir(diff50)} />
                {formatMilliseconds(Math.abs(diff50))}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-secondary/50">Now <span className="font-mono text-primary font-semibold">{recent50 != null ? formatMilliseconds(recent50) : "—"}</span></span>
            <span className="text-xs text-secondary/50">Before <span className="font-mono text-primary font-semibold">{prev50 != null ? formatMilliseconds(prev50) : "—"}</span></span>
          </div>
        </div>
      </div>
    </section>
  );
}

export interface PercentilesProps {
  percentiles: PercentilesData | null;
}

export function PercentilesSection({ percentiles }: PercentilesProps) {
  if (!percentiles) return null;
  const items = [
    { label: "90th", value: percentiles.p90 },
    { label: "75th", value: percentiles.p75 },
    { label: "50th", value: percentiles.p50 },
    { label: "25th", value: percentiles.p25 },
  ];
  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider">Percentiles</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col gap-0.5 rounded-lg px-3 py-2 border border-border/20 bg-bg-elevated/40">
            <span className="text-[10px] text-secondary/70 uppercase tracking-wider font-medium">{item.label}</span>
            <span className="text-sm font-mono tabular-nums font-semibold text-primary">{item.value != null ? formatMilliseconds(item.value) : "—"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
