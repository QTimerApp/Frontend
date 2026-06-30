import { formatMilliseconds } from "./format";
import { isDNF, isPlusTwo, effectiveTimeMs } from "@/types/penalty";
import { Time } from "@/types/timer";
import { PenaltyFilter, TimeComparator } from "@/types/solve-search";
import type { SolveFilters } from "@/types/solve-search";
import type { DBSolve } from "@/types/db";

export const DEFAULT_FILTERS: SolveFilters = {
  query: "",
  timeComparator: TimeComparator.Any,
  timeValue: "",
  penalty: PenaltyFilter.Any,
};

function parseMs(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(":");
  if (parts.length === 3) {
    const [h, m, s] = parts.map(Number);
    if (!isNaN(h) && !isNaN(m) && !isNaN(s))
      return (h * 3600 + m * 60 + s) * Time.second;
  }
  if (parts.length === 2) {
    const [m, s] = parts.map(Number);
    if (!isNaN(m) && !isNaN(s)) return (m * 60 + s) * Time.second;
  }
  const num = Number(trimmed);
  if (!isNaN(num)) return num * Time.second;
  return null;
}

export function filterSolves(
  solves: DBSolve[],
  filters: SolveFilters,
): DBSolve[] {
  const q = filters.query ? filters.query.trim() : "";
  const queryTime = q ? parseMs(q) : null;
  const qLower = !queryTime && q ? q.toLowerCase() : "";

  const hasTimeFilter =
    filters.timeComparator !== TimeComparator.Any && filters.timeValue;
  const threshold = hasTimeFilter ? parseMs(filters.timeValue) : null;

  const { penalty } = filters;

  const result: DBSolve[] = [];

  for (let i = 0, len = solves.length; i < len; i++) {
    const solve = solves[i];

    if (qLower && !(solve.notes ?? "").toLowerCase().includes(qLower)) continue;

    if (penalty !== PenaltyFilter.Any) {
      if (penalty === PenaltyFilter.WithPenalty && solve.penalty === null)
        continue;
      if (penalty === PenaltyFilter.None && solve.penalty !== null) continue;
      if (penalty === PenaltyFilter.PlusTwo && !isPlusTwo(solve.penalty))
        continue;
      if (penalty === PenaltyFilter.DNF && !isDNF(solve.penalty)) continue;
    }

    const effective = effectiveTimeMs(solve.timeMs, solve.penalty);

    if (queryTime !== null) {
      const formatted = formatMilliseconds(effective);
      if (!formatted.includes(q)) continue;
    }

    if (threshold !== null) {
      if (
        filters.timeComparator === TimeComparator.Over &&
        effective <= threshold
      )
        continue;
      if (
        filters.timeComparator === TimeComparator.Under &&
        effective >= threshold
      )
        continue;
    }

    result.push(solve);
  }

  return result;
}
