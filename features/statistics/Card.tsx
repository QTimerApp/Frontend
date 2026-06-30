export function StatCard({ label, value, sub, variant }: {
  label: string; value: string; sub?: string; variant?: "best" | "worst"
}) {
  const border = variant === "best"
    ? "border-accent/30 bg-accent/[0.06]"
    : variant === "worst"
    ? "border-red-500/20 bg-red-500/[0.06]"
    : "border-border/20 bg-bg-elevated/40";
  const text = variant === "best"
    ? "text-accent"
    : variant === "worst"
    ? "text-red-400"
    : "text-primary";
  return (
    <div className={`flex flex-col gap-0.5 rounded-lg px-3 py-2 border ${border}`}>
      <span className="text-[10px] text-secondary/70 uppercase tracking-wider font-medium">{label}</span>
      <span className={`${sub ? "text-sm" : "text-base"} font-mono tabular-nums font-semibold ${text}`}>{value}</span>
      {sub && <span className="text-[10px] text-secondary/60 tabular-nums">{sub}</span>}
    </div>
  );
}
