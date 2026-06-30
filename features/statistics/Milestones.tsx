export function Milestones({
  totalSolves, totalHours, pbCount, sessionCount, mostSolvesInDay, longestSessionSolves,
}: {
  totalSolves: number;
  totalHours: number;
  pbCount: number;
  sessionCount: number;
  mostSolvesInDay: { date: string; count: number } | null;
  longestSessionSolves: number;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider">Milestones</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
        <div className="flex flex-col gap-0.5 rounded-lg px-3 py-2 border border-border/20 bg-bg-elevated/40">
          <span className="text-[10px] text-secondary/70 uppercase tracking-wider font-medium">Total Solves</span>
          <span className="text-sm font-mono tabular-nums font-semibold text-primary">{totalSolves.toLocaleString()}</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg px-3 py-2 border border-border/20 bg-bg-elevated/40">
          <span className="text-[10px] text-secondary/70 uppercase tracking-wider font-medium">Hours Practiced</span>
          <span className="text-sm font-mono tabular-nums font-semibold text-primary">{totalHours}h</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg px-3 py-2 border border-border/20 bg-bg-elevated/40">
          <span className="text-[10px] text-secondary/70 uppercase tracking-wider font-medium">PBs Earned</span>
          <span className="text-sm font-mono tabular-nums font-semibold text-accent">{pbCount}</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg px-3 py-2 border border-border/20 bg-bg-elevated/40">
          <span className="text-[10px] text-secondary/70 uppercase tracking-wider font-medium">Sessions</span>
          <span className="text-sm font-mono tabular-nums font-semibold text-primary">{sessionCount}</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg px-3 py-2 border border-border/20 bg-bg-elevated/40">
          <span className="text-[10px] text-secondary/70 uppercase tracking-wider font-medium">Most Solves / Day</span>
          <span className="text-sm font-mono tabular-nums font-semibold text-primary">{mostSolvesInDay ? `${mostSolvesInDay.count}` : "—"}</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg px-3 py-2 border border-border/20 bg-bg-elevated/40">
          <span className="text-[10px] text-secondary/70 uppercase tracking-wider font-medium">Longest Session</span>
          <span className="text-sm font-mono tabular-nums font-semibold text-primary">{longestSessionSolves > 0 ? `${longestSessionSolves} solves` : "—"}</span>
        </div>
      </div>
    </section>
  );
}
