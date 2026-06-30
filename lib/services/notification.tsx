import { toast as sonnerToast } from "sonner";
import { confetti } from "@/lib/utils/confetti";
import { Time } from "@/types/timer";
import { formatMilliseconds } from "@/lib/utils/format";
import { effectiveTimeMs } from "@/types/penalty";
import { solveRepository } from "@/lib/repositories/solve";
import { computeBest, computeWorst, computeRecordAverages } from "@/lib/utils/stats";
import type { SolveLike } from "@/types/solve";
import type { Settings } from "@/types/settings";

function toSolveLike(s: { timeMs: number; penalty: string | null }): SolveLike {
  return { timeMs: s.timeMs, penalty: s.penalty };
}

export async function checkSolveMilestones(
  sessionId: string,
  solveTimeMs: number,
  solvePenalty: string | null,
  settings: Settings,
) {
  const solves = await solveRepository.findBySession(sessionId);
  const all = solves.map((s) => toSolveLike({ timeMs: s.timeMs, penalty: s.penalty ?? null }));
  const prev = all.filter((s) => s.timeMs !== solveTimeMs || s.penalty !== solvePenalty);

  if (settings.notifyPB && prev.length > 0) {
    const prevBest = computeBest(prev);
    const newBest = computeBest(all);
    if (newBest != null && (prevBest == null || newBest < prevBest)) {
      const t = effectiveTimeMs(solveTimeMs, solvePenalty);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      sonnerToast("New PB!", {
        description: `${formatMilliseconds(t)} — ${all.length} solves`,
        duration: Time.second * 5,
        className: "[&_[data-title]]:text-accent",
      });
    }
  }

  if (settings.notifyWorstSolve && prev.length > 0) {
    const prevWorst = computeWorst(prev);
    const newWorst = computeWorst(all);
    if (newWorst != null && (prevWorst == null || newWorst > prevWorst)) {
      const t = effectiveTimeMs(solveTimeMs, solvePenalty);
      sonnerToast("Worst Solve", {
        description: formatMilliseconds(t),
        duration: Time.second * 3,
      });
    }
  }

  if (settings.notifyBestAverage && prev.length >= 4) {
    const prevRecords = computeRecordAverages(prev);
    const newRecords = computeRecordAverages(all);
    const groups: { n: number; best: number | null; next: number | null }[] = [
      { n: 5, best: prevRecords.bestAo5, next: newRecords.bestAo5 },
      { n: 12, best: prevRecords.bestAo12, next: newRecords.bestAo12 },
      { n: 50, best: prevRecords.bestAo50, next: newRecords.bestAo50 },
      { n: 100, best: prevRecords.bestAo100, next: newRecords.bestAo100 },
    ];
    for (const g of groups) {
      if (g.next != null && (g.best == null || g.next < g.best)) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        sonnerToast(`Best Ao${g.n}!`, {
          description: formatMilliseconds(g.next),
          duration: Time.second * 4,
          className: "[&_[data-title]]:text-accent",
        });
      }
    }
  }
}


