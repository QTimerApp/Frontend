"use client";

import { useStore } from "@/lib/stores/use";
import { formatMilliseconds } from "@/lib/utils/format";
import { isDNF, isPlusTwo, effectiveTime } from "@/types/penalty";
import { Loading } from "@/components/ui/Loading";
import { useModal, ModalType } from "@/lib/contexts/Modal";
import type { DBSolve } from "@/types/db";
import { useSession } from "@/lib/contexts/Session";

export function MobileSolves({ solves: externalSolves }: { solves?: DBSolve[] }) {
  const selectedEventId = useStore((s) => s.selectedEventId);
  const { openModal } = useModal();
  const { solves: contextSolves } = useSession();
  const solves = externalSolves ?? contextSolves;

  if (solves === undefined) return <Loading variant="card" />;

  if (solves.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-xs text-muted">
        No solves yet
      </div>
    );
  }

  const items = [...solves].reverse();

  return (
    <div className="grid grid-cols-3 gap-2 p-3">
      {items.map((solve, i) => {
        const penalty = solve.penalty ?? null;
        const time = isDNF(penalty)
          ? "DNF"
          : formatMilliseconds(effectiveTime(solve));
        const date = new Date(solve.createdAt);
        const dateStr = date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });

        function handleClick() {
          openModal(ModalType.SolveDetails, {
            solveId: solve.id,
            solveTime: solve.timeMs,
            solveScramble: solve.scramble,
            solvePenalty: penalty,
            solveCreatedAt: solve.createdAt,
            solveNotes: solve.notes ?? "",
            solveIndex: items.length - 1 - i,
            solveEventId: selectedEventId ?? undefined,
            solveSplits: solve.splits ?? undefined,
          });
        }

        return (
          <button type="button"
            key={solve.id}
            onClick={handleClick}
            className="flex flex-col items-center gap-1 px-3 py-3 rounded-2xl bg-bg-elevated/60 border border-border/15 active:scale-95 transition-all"
          >
            <span
              className={`text-base font-bold tabular-nums tracking-tight ${
                isDNF(penalty) ? "text-red-400 line-through" : "text-primary"
              }`}
            >
              {time}
            </span>
            <span className="text-[10px] text-muted/60">{dateStr}</span>
            {isPlusTwo(penalty) && (
              <span className="text-[9px] font-bold text-amber-400 px-1.5 py-0.5 rounded-md bg-amber-500/10 leading-none">
                +2
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
