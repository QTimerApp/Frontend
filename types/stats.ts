export interface SolvePoint {
  index: number;
  time: number;
  label: string;
}

export interface DistributionBin {
  rangeStart: number;
  rangeEnd: number;
  count: number;
}

export interface RollingAveragePoint {
  index: number;
  value: number | null;
  label: string;
}

export interface MonthlyBreakdown {
  month: string;
  count: number;
  mean: number | null;
  best: number | null;
}

export interface DayCount {
  date: string;
  count: number;
  dayOfWeek: number;
  weekIndex: number;
}

export interface PBInfo {
  current: number | null;
  previous: number | null;
  improvement: number | null;
  firstSolve: number | null;
  pbsThisMonth: number;
  daysSinceLastPB: number | null;
}

export interface RecordAverages {
  bestAo5: number | null;
  bestAo12: number | null;
  bestAo50: number | null;
  bestAo100: number | null;
}

export interface PercentilesData {
  p90: number | null;
  p75: number | null;
  p50: number | null;
  p25: number | null;
}
