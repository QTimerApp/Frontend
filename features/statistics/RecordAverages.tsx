import { formatMilliseconds } from "@/lib/utils/format";
import type { RecordAverages as RecordAveragesType } from "@/types/stats";

export function RecordAverages({ records }: { records: RecordAveragesType }) {
  const items = [
    { label: "Best Ao5", value: records.bestAo5 },
    { label: "Best Ao12", value: records.bestAo12 },
    { label: "Best Ao50", value: records.bestAo50 },
    { label: "Best Ao100", value: records.bestAo100 },
  ];
  if (items.every((i) => i.value == null)) return null;
  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider">Record Averages</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col gap-0.5 rounded-lg px-3 py-2 border border-border/20 bg-bg-elevated/40">
            <span className="text-[10px] text-secondary/70 uppercase tracking-wider font-medium">{item.label}</span>
            <span className="text-sm font-mono tabular-nums font-semibold text-accent">
              {item.value != null ? formatMilliseconds(item.value) : "—"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
