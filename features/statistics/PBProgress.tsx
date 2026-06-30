import { formatMilliseconds } from "@/lib/utils/format";
import { StatCard } from "@/features/statistics/Card";
import type { PBInfo } from "@/types/stats";

export function PBProgress({ pb, scope }: { pb: PBInfo; scope?: string }) {
  if (pb.current == null) return null;
  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider">PB Progress</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        <StatCard label="Current PB" value={formatMilliseconds(pb.current)} variant="best" />
        <StatCard label="Previous PB" value={pb.previous != null ? formatMilliseconds(pb.previous) : "—"} />
        <StatCard label="Faster By" value={pb.improvement != null ? formatMilliseconds(pb.improvement) : "—"} sub={scope} variant={pb.improvement != null && pb.improvement > 0 ? "best" : undefined} />
        <StatCard label="PBs This Month" value={String(pb.pbsThisMonth)} />
        <StatCard label="Days Since PB" value={pb.daysSinceLastPB != null ? `${pb.daysSinceLastPB}d` : "—"} />
        <StatCard label="First Solve" value={pb.firstSolve != null ? formatMilliseconds(pb.firstSolve) : "—"} />
      </div>
    </section>
  );
}
