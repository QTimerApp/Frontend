import { useCallback, useRef } from "react";
import { useModal, ModalType, DeleteTarget } from "@/lib/contexts/Modal";
import { solveService } from "@/lib/services/solve";
import { computeAo } from "@/lib/utils/stats";
import type { DBSolve } from "@/types/db";

export function useSolveActions(sessionName: string | undefined, sessionEventId: string | undefined) {
  const { openModal } = useModal();
  const sessionRef = useRef(sessionName);
  sessionRef.current = sessionName;
  const eventRef = useRef(sessionEventId);
  eventRef.current = sessionEventId;

  const handleSolveDeleteClick = useCallback(
    (solveId: string) => {
      openModal(ModalType.Delete, {
        deleteTarget: DeleteTarget.Solve,
        handleDeleteSolve: () => solveService.deleteSolve(solveId),
      });
    },
    [openModal]
  );

  const handleAverageDeleteClick = useCallback(
    (solves: DBSolve[]) => {
      openModal(ModalType.Delete, {
        deleteTarget: DeleteTarget.Average,
        handleDeleteAverage: () => solveService.deleteSolves(solves.map((s) => s.id)),
      });
    },
    [openModal]
  );

  const handleSolveClick = useCallback(
    (solve: {
      id: string;
      timeMs: number;
      scramble: string;
      penalty?: string | null;
      createdAt?: string;
      notes?: string;
      splits?: number[] | null;
    }, index: number) => {
      openModal(ModalType.SolveDetails, {
        solveId: solve.id,
        solveTime: solve.timeMs,
        solveScramble: solve.scramble,
        solvePenalty: solve.penalty ?? null,
        solveCreatedAt: solve.createdAt,
        solveNotes: solve.notes ?? "",
        solveIndex: index,
        solveEventId: eventRef.current,
        solveSplits: solve.splits ?? undefined,
      });
    },
    [openModal]
  );

  const handleAverageClick = useCallback(
    (groupSolves: DBSolve[], n: number) => {
      if (!groupSolves.length) return;
      openModal(ModalType.AverageDetails, {
        groupSize: n,
        averageValue: computeAo(groupSolves, n) ?? "—",
        averageSolves: groupSolves,
        sessionName: sessionRef.current ?? "Unknown",
      });
    },
    [openModal]
  );

  return {
    handleSolveDeleteClick,
    handleAverageDeleteClick,
    handleSolveClick,
    handleAverageClick,
  };
}
