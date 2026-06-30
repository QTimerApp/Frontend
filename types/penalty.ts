import { Time } from "@/types/timer";
import type { SolveLike } from "@/types/solve";

export enum Penalty {
  PlusTwo = "+2",
  DNF = "DNF",
}

export function isDNF(penalty: string | null | undefined): boolean {
  return penalty === Penalty.DNF;
}

export function isPlusTwo(penalty: string | null | undefined): boolean {
  return penalty === Penalty.PlusTwo;
}

export function effectiveTimeMs(
  timeMs: number,
  penalty: string | null | undefined
): number {
  return isPlusTwo(penalty) ? timeMs + Time.second * 2 : timeMs;
}

export function effectiveTime(solve: SolveLike): number {
  return effectiveTimeMs(solve.timeMs, solve.penalty ?? null);
}
