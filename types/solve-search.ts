export enum TimeComparator {
  Any = "any",
  Over = "over",
  Under = "under",
}

export enum PenaltyFilter {
  Any = "any",
  WithPenalty = "with_penalty",
  None = "none",
  PlusTwo = "plus2",
  DNF = "dnf",
}

export interface SolveFilters {
  query: string;
  timeComparator: TimeComparator;
  timeValue: string;
  penalty: PenaltyFilter;
}
