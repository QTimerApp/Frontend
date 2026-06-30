import { formatMilliseconds } from "./format";
import type { SolveLike } from "@/types/solve";
import { isDNF, effectiveTimeMs, Penalty } from "@/types/penalty";
import { Time } from "@/types/timer";
import type {
  SolvePoint,
  DistributionBin,
  RollingAveragePoint,
  MonthlyBreakdown,
  DayCount,
  PBInfo,
  RecordAverages,
  PercentilesData,
} from "@/types/stats";

export type {
  SolvePoint,
  DistributionBin,
  RollingAveragePoint,
  MonthlyBreakdown,
  DayCount,
  PBInfo,
  RecordAverages,
  PercentilesData,
};

const eMs = (s: SolveLike) => effectiveTimeMs(s.timeMs, s.penalty ?? null);
const isDNFs = (s: SolveLike) => isDNF(s.penalty ?? null);

function pad(n: number) { return String(n).padStart(2, "0"); }

export function computeAo(solves: SolveLike[], n: number): string | null {
  if (solves.length < n) return null;
  const batch = solves.slice(0, n);
  const times = batch.map(eMs);
  const dnfCount = batch.filter(isDNFs).length;
  if (dnfCount > 1) return "DNF";
  times.sort((a, b) => a - b);
  const trimmed = times.slice(1, -1);
  const avg = trimmed.reduce((s, t) => s + t, 0) / trimmed.length;
  return !isFinite(avg) ? "DNF" : formatMilliseconds(avg);
}

function computeAoRaw(solves: SolveLike[], n: number): number | null {
  if (solves.length < n) return null;
  const batch = solves.slice(0, n);
  const times = batch.map(eMs);
  const dnfCount = batch.filter(isDNFs).length;
  if (dnfCount > 1) return Infinity;
  times.sort((a, b) => a - b);
  const trimmed = times.slice(1, -1);
  const avg = trimmed.reduce((s, t) => s + t, 0) / trimmed.length;
  return isFinite(avg) ? avg : Infinity;
}

function validTimes(solves: SolveLike[]): number[] {
  return solves.filter((s) => !isDNFs(s)).map(eMs);
}

export function computeMean(solves: SolveLike[]): number | null {
  const v = validTimes(solves);
  return v.length ? v.reduce((s, t) => s + t, 0) / v.length : null;
}

export function computeBest(solves: SolveLike[]): number | null {
  const v = validTimes(solves);
  return v.length ? Math.min(...v) : null;
}

export function computeWorst(solves: SolveLike[]): number | null {
  const v = validTimes(solves);
  return v.length ? Math.max(...v) : null;
}

export function computeStdDev(solves: SolveLike[]): number | null {
  const v = validTimes(solves);
  if (v.length < 2) return null;
  const mean = v.reduce((s, t) => s + t, 0) / v.length;
  const variance = v.reduce((s, x) => s + (x - mean) ** 2, 0) / (v.length - 1);
  return Math.sqrt(variance);
}

export function countDNF(solves: SolveLike[]): number {
  return solves.filter(isDNFs).length;
}

export function countPlus2(solves: SolveLike[]): number {
  return solves.filter((s) => s.penalty === Penalty.PlusTwo).length;
}

export function computeSuccessRate(solves: SolveLike[]): number {
  return solves.length ? (solves.length - countDNF(solves)) / solves.length : 0;
}

export function computeSolveHistory(solves: SolveLike[]): SolvePoint[] {
  const result: SolvePoint[] = [];
  for (let i = solves.length - 1; i >= 0; i--) {
    const s = solves[i];
    if (isDNFs(s)) continue;
    const t = eMs(s);
    result.push({
      index: solves.length - i,
      time: t,
      label: formatMilliseconds(t),
    });
  }
  return result;
}

export function computeDistribution(
  solves: SolveLike[],
  binCount = 10,
): DistributionBin[] {
  const v = validTimes(solves);
  if (!v.length) return [];
  const min = Math.min(...v);
  const max = Math.max(...v);
  const range = max - min || 1;
  const binSize = range / binCount;
  const bins: DistributionBin[] = Array.from({ length: binCount }, (_, i) => ({
    rangeStart: min + i * binSize,
    rangeEnd: min + (i + 1) * binSize,
    count: 0,
  }));
  for (const t of v) {
    bins[Math.min(Math.floor((t - min) / binSize), binCount - 1)].count++;
  }
  return bins;
}

export function computeRollingAverages(
  solves: SolveLike[],
  n: number,
): RollingAveragePoint[] {
  if (solves.length < n) return [];
  const result: RollingAveragePoint[] = [];
  for (let i = solves.length - n; i >= 0; i--) {
    const batch = solves.slice(i, i + n);
    const raw = computeAoRaw(batch, n);
    result.push({
      index: solves.length - i - n + 1,
      value: raw,
      label: raw == null || !isFinite(raw) ? "DNF" : formatMilliseconds(raw),
    });
  }
  return result;
}

export function computeMonthlyBreakdown(
  solves: SolveLike[],
): MonthlyBreakdown[] {
  const groups = new Map<string, SolveLike[]>();
  for (const s of solves) {
    if (!s.createdAt) continue;
    const m = s.createdAt.slice(0, 7);
    if (!groups.has(m)) groups.set(m, []);
    groups.get(m)!.push(s);
  }
  return Array.from(groups.entries())
    .map(([month, group]) => ({
      month,
      count: group.length,
      mean: computeMean(group),
      best: computeBest(group),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function computeDailyCounts(solves: SolveLike[]): DayCount[] {
  const map = new Map<string, number>();
  let minStr: string | undefined;
  let maxStr: string | undefined;

  for (const s of solves) {
    if (!s.createdAt) continue;
    const day = s.createdAt.slice(0, 10);
    map.set(day, (map.get(day) ?? 0) + 1);
    if (!minStr || day < minStr) minStr = day;
    if (!maxStr || day > maxStr) maxStr = day;
  }

  const now = new Date();
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  const end = maxStr && maxStr < today
    ? new Date(+maxStr.slice(0, 4), +maxStr.slice(5, 7) - 1, +maxStr.slice(8, 10))
    : now;

  const yearAgo = new Date(end);
  yearAgo.setDate(yearAgo.getDate() - 364);

  let start: Date;
  if (!minStr) {
    start = yearAgo;
  } else {
    const candidate = new Date(+minStr.slice(0, 4), +minStr.slice(5, 7) - 1, +minStr.slice(8, 10));
    start = candidate < yearAgo ? candidate : yearAgo;
  }

  const firstDay = start.getDay();
  const result: DayCount[] = [];
  const cursor = new Date(start);
  let diff = 0;

  while (cursor <= end) {
    const s = `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}-${pad(cursor.getDate())}`;
    result.push({
      date: s,
      count: map.get(s) ?? 0,
      dayOfWeek: cursor.getDay(),
      weekIndex: Math.floor((diff + firstDay) / 7),
    });
    cursor.setDate(cursor.getDate() + 1);
    diff++;
  }

  return result;
}

export function computeCurrentStreak(days: DayCount[]): number {
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) streak++;
    else break;
  }
  return streak;
}

export function computeLongestStreak(days: DayCount[]): number {
  let best = 0,
    cur = 0;
  for (let i = 0; i < days.length; i++) {
    if (days[i].count > 0) {
      cur++;
      if (cur > best) best = cur;
    } else cur = 0;
  }
  return best;
}

export function computeSessionStats(solves: SolveLike[]) {
  return {
    count: solves.length,
    dnfCount: countDNF(solves),
    plus2Count: countPlus2(solves),
    mean: computeMean(solves),
    best: computeBest(solves),
    worst: computeWorst(solves),
    stdDev: computeStdDev(solves),
    successRate: computeSuccessRate(solves),
    ao5: computeAo(solves, 5),
    ao12: computeAo(solves, 12),
    ao50: computeAo(solves, 50),
    ao100: computeAo(solves, 100),
  };
}

export function computeMedian(solves: SolveLike[]): number | null {
  const v = validTimes(solves).sort((a, b) => a - b);
  if (!v.length) return null;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

function computePercentile(solves: SolveLike[], p: number): number | null {
  const v = validTimes(solves).sort((a, b) => a - b);
  if (!v.length) return null;
  const idx = Math.ceil((p / 100) * v.length) - 1;
  return v[Math.max(0, Math.min(idx, v.length - 1))];
}

export function computeIQR(solves: SolveLike[]): number | null {
  const q1 = computePercentile(solves, 25);
  const q3 = computePercentile(solves, 75);
  if (q1 == null || q3 == null) return null;
  return q3 - q1;
}

export function computeConsistencyScore(solves: SolveLike[]): number | null {
  const v = validTimes(solves);
  if (v.length < 3) return null;
  const mean = v.reduce((s, t) => s + t, 0) / v.length;
  const meanDev = v.reduce((s, t) => s + Math.abs(t - mean), 0) / v.length;
  const cv = meanDev / mean;
  return Math.max(0, Math.round((1 - cv) * 100));
}

export function computePBInfo(solves: SolveLike[]): PBInfo {
  const withDates = solves.filter(s => s.createdAt);
  const sorted = [...withDates].sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  const valid = sorted.filter(s => !isDNFs(s)).map(s => ({ time: eMs(s), date: s.createdAt! }));
  if (!valid.length) return { current: null, previous: null, improvement: null, firstSolve: null, pbsThisMonth: 0, daysSinceLastPB: null };

  let best = valid[0].time;
  let bestDate = valid[0].date;
  const pbHistory: { time: number; date: string }[] = [{ time: best, date: bestDate }];

  for (let i = 1; i < valid.length; i++) {
    if (valid[i].time < best) {
      best = valid[i].time;
      bestDate = valid[i].date;
      pbHistory.push({ time: best, date: bestDate });
    }
  }

  const current = best;
  const previous = pbHistory.length > 1 ? pbHistory[pbHistory.length - 2].time : null;
  const improvement = current != null && previous != null ? previous - current : null;
  const firstSolve = valid[0].time;

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const pbsThisMonth = pbHistory.filter(pb => {
    const d = new Date(pb.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  const daysSinceLastPB = current != null
    ? Math.floor((now.getTime() - new Date(bestDate).getTime()) / Time.day)
    : null;

  return { current, previous, improvement, firstSolve, pbsThisMonth, daysSinceLastPB };
}

export function computeRecordAverages(solves: SolveLike[]): RecordAverages {
  const bestRolling = (n: number) => {
    if (solves.length < n) return null;
    let best: number | null = null;
    for (let i = 0; i <= solves.length - n; i++) {
      const batch = solves.slice(i, i + n);
      const raw = computeAoRaw(batch, n);
      if (raw != null && isFinite(raw) && (best == null || raw < best)) best = raw;
    }
    return best;
  };

  return {
    bestAo5: bestRolling(5),
    bestAo12: bestRolling(12),
    bestAo50: bestRolling(50),
    bestAo100: bestRolling(100),
  };
}

export function computeMostActiveDay(daily: DayCount[]): { date: string; count: number } | null {
  if (!daily.length) return null;
  let best = daily[0];
  for (const d of daily) {
    if (d.count > best.count) best = d;
  }
  return best.count > 0 ? { date: best.date, count: best.count } : null;
}

export function computeLongestSession(solves: SolveLike[]): { count: number; totalTime: number } | null {
  if (!solves.length) return null;
  const withDates = solves.filter(s => s.createdAt);
  if (!withDates.length) return null;
  const sorted = [...withDates].sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  let longest: { count: number; totalTime: number } = { count: 1, totalTime: 0 };
  let cur: { count: number; totalTime: number; start: Date } | null = null;

  for (const s of sorted) {
    const d = new Date(s.createdAt!);
    if (!cur) {
      cur = { count: 1, totalTime: s.timeMs + (s.penalty === "plus2" ? Time.second * 2 : 0), start: d };
    } else {
      const gap = (d.getTime() - cur.start.getTime()) / Time.minute;
      if (gap <= 30) {
        cur.count++;
        cur.totalTime += s.timeMs + (s.penalty === "plus2" ? Time.second * 2 : 0);
      } else {
        if (cur.count > longest.count) longest = { count: cur.count, totalTime: cur.totalTime };
        cur = { count: 1, totalTime: s.timeMs + (s.penalty === "plus2" ? Time.second * 2 : 0), start: d };
      }
    }
  }
  if (cur && cur.count > longest.count) longest = { count: cur.count, totalTime: cur.totalTime };
  return longest;
}

export function computePercentiles(solves: SolveLike[]): PercentilesData {
  return {
    p90: computePercentile(solves, 90),
    p75: computePercentile(solves, 75),
    p50: computePercentile(solves, 50),
    p25: computePercentile(solves, 25),
  };
}

export function computeSplitMeans(solves: SolveLike[], n: number): { recent: number | null; previous: number | null; diff: number | null } {
  const v = validTimes(solves);
  if (v.length < n * 2) return { recent: null, previous: null, diff: null };
  const recent = v.slice(-n);
  const previous = v.slice(-n * 2, -n);
  if (!recent.length || !previous.length) return { recent: null, previous: null, diff: null };
  const rMean = recent.reduce((s, t) => s + t, 0) / recent.length;
  const pMean = previous.reduce((s, t) => s + t, 0) / previous.length;
  return { recent: rMean, previous: pMean, diff: rMean - pMean };
}
