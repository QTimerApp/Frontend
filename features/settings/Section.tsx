export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 px-1 mb-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">{title}</h2>
        <div className="h-px flex-1 bg-border/30" />
      </div>
      <div className="bg-bg-surface/60 rounded-xl border border-border/20">
        {children}
      </div>
    </div>
  );
}
