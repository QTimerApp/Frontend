import { formatMilliseconds } from "@/lib/utils/format";
import type { MonthlyBreakdown } from "@/types/stats";

export function MonthlyOverview({ monthly }: { monthly: MonthlyBreakdown[] }) {
  if (monthly.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-1 px-1">
      {monthly.map((m) => {
        const [y, mo] = m.month.split("-").map(Number);
        return (
          <div key={m.month} className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 border border-border/20 bg-bg-elevated/30 shrink-0">
            <span className="text-[10px] font-semibold text-secondary/60 uppercase tracking-wider whitespace-nowrap">
              {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][mo - 1]} '{String(y).slice(-2)}
            </span>
            <div className="w-px h-4 bg-border/20" />
            <span className="text-xs font-mono tabular-nums text-primary font-semibold">{m.count}</span>
            <div className="w-px h-4 bg-border/20" />
            <span className="text-[10px] font-mono tabular-nums text-secondary/50">{m.mean != null ? formatMilliseconds(m.mean) : "—"}</span>
          </div>
        );
      })}
    </div>
  );
}
