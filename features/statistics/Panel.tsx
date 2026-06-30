"use client";

import { useStore } from "@/lib/stores/use";
import { useSettingsStore } from "@/lib/stores/useSettings";
import { useModal } from "@/lib/contexts/Modal";
import { formatMilliseconds } from "@/lib/utils/format";
import { computeAo, computeStdDev, computeMean, computeBest } from "@/lib/utils/stats";
import { useMemo, useCallback } from "react";
import { ModalType } from "@/lib/contexts/Modal";
import { useSession } from "@/lib/contexts/Session";

function Stat({ label, value, onClick }: { label: string; value: string; onClick?: () => void }) {
  const Component = onClick ? "button" : "div";
  return (
    <Component
      onClick={onClick}
      className={`flex items-baseline justify-between gap-2 ${onClick ? "cursor-pointer hover:bg-primary/5 rounded px-1 -mx-1 transition-colors w-full text-left" : ""}`}
    >
      <span className="text-xs text-secondary/70 uppercase tracking-wider font-medium">
        {label}
      </span>
      <span className="text-sm font-mono tabular-nums text-primary">
        {value}
      </span>
    </Component>
  );
}

function Panel({ side }: { side: "left" | "right" }) {
  const selectedSessionId = useStore((s) => s.selectedSessionId);
  const {
    showStatsPanel,
    displayStatAo5,
    displayStatAo12,
    displayStatAo50,
    displayStatAo100,
  } = useSettingsStore((s) => s.settings);
  const { openModal } = useModal();
  const { session, solves } = useSession();

  const sorted = useMemo(() => {
    if (!solves) return [];
    return [...solves].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [solves]);

  const count = sorted?.length ?? 0;

  const mean = computeMean(sorted);
  const best = computeBest(sorted);
  const dev = computeStdDev(sorted);

  const aoValues = useMemo(() => {
    if (!sorted) return [null, null, null, null];
    return [5, 12, 50, 100].map((n) => computeAo(sorted, n));
  }, [sorted]);

  if (!showStatsPanel) return null;

  if (side === "left") {
    return (
      <div className="flex flex-col gap-0.5 min-w-35 pt-1">
        <Stat label="Deviation" value={dev != null ? formatMilliseconds(dev) : "—"} />
        <Stat
          label="Mean"
          value={mean != null ? formatMilliseconds(mean) : "—"}
        />
        <Stat
          label="Best"
          value={best != null ? formatMilliseconds(best) : "—"}
        />
        <Stat label="Count" value={String(count)} />
      </div>
    );
  }

  const aoLabels = [5, 12, 50, 100] as const;
  const aoVisibility = [displayStatAo5, displayStatAo12, displayStatAo50, displayStatAo100];

  const handleAoClick = useCallback((n: number) => {
    if (!sorted) return;
    const batch = sorted.slice(0, n);
    if (batch.length < n) return;
    openModal(ModalType.AverageDetails, {
      groupSize: n,
      averageValue: computeAo(sorted, n) ?? "—",
      averageSolves: batch,
      sessionName: session?.name ?? "Unknown",
    });
  }, [sorted, openModal, session]);

  return (
    <div className="flex flex-col gap-0.5 min-w-25 pt-1">
      {aoLabels.map((n, i) =>
        aoVisibility[i] ? (
          <Stat key={n} label={`Ao${n}`} value={aoValues[i] ?? "—"} onClick={() => handleAoClick(n)} />
        ) : null
      )}
    </div>
  );
}

export { Panel };
