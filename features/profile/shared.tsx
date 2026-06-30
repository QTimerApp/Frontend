export function StatLink({ value, label }: { value?: number; label: string }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-sm font-bold tabular-nums text-primary">{value?.toLocaleString() ?? "0"}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl px-4 py-3.5 border border-border/20 bg-bg-elevated/30">
      <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">{label}</p>
      <p className="text-xl font-black tabular-nums text-primary mt-1">{value}</p>
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-3">
      {children}
    </h2>
  );
}
