"use client";

import { useStore } from "@/lib/stores/use";
import { useEffect, useMemo, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { formatMilliseconds } from "@/lib/utils/format";
import {
  computeSessionStats, computeSolveHistory, computeDistribution,
  computeRollingAverages, computeMonthlyBreakdown, computeDailyCounts,
  computeCurrentStreak, computeLongestStreak,
  computeMedian, computeIQR, computeConsistencyScore,
  computeRecordAverages, computePercentiles, computeSplitMeans,
} from "@/lib/utils/stats";
import { StatCard } from "@/features/statistics/Card";
import { ActivityGraph } from "@/features/statistics/ActivityGraph";
import { MonthlyOverview } from "@/features/statistics/MonthlyOverview";
import { ChartSection } from "@/features/statistics/ChartSection";
import { Loading } from "@/components/ui/Loading";
import { SessionNav } from "@/features/sessions/Nav";
import { ConsistencySection } from "@/features/statistics/ConsistencySection";
import { RecordAverages } from "@/features/statistics/RecordAverages";
import { SessionSummary } from "@/features/statistics/SessionSummary";
import { Time } from "@/types/timer";
import { TrendSection, PercentilesSection } from "@/features/statistics/TrendSection";
import { useSession } from "@/lib/contexts/Session";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

export default function SessionStats() {
  return (
    <Suspense fallback={null}>
      <SessionStatsContent />
    </Suspense>
  );
}

function SessionStatsContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const setSelectedSessionId = useStore((s) => s.setSelectedSessionId);
  const setSelectedEventId = useStore((s) => s.setSelectedEventId);
  const { session, solves } = useSession();

  useEffect(() => {
    setSelectedSessionId(id);
    if (session) setSelectedEventId(session.eventId);
    if (session === undefined) return;
    if (!session) router.push("/");
  }, [id, session, setSelectedSessionId, setSelectedEventId, router]);

  const computed = useMemo(() => {
    if (!solves || solves.length === 0) return null;

    const sorted = [...solves].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const stats = computeSessionStats(sorted);
    const history = computeSolveHistory(sorted);
    const distribution = computeDistribution(sorted, 15);
    const rollingAo5 = computeRollingAverages(sorted, 5);
    const rollingAo12 = computeRollingAverages(sorted, 12);
    const rollingAo50 = computeRollingAverages(sorted, 50);
    const monthly = computeMonthlyBreakdown(sorted);
    const daily = computeDailyCounts(sorted);

    const daysWith = daily.filter(d => d.count > 0);
    const activeDays = daysWith.length;
    const totalDays = daily.length;
    const totalWeeks = Math.max(1, Math.ceil(totalDays / 7));
    const avgDay = activeDays > 0 ? (stats.count / activeDays).toFixed(1) : "—";
    const avgWeek = activeDays > 0 ? (stats.count / totalWeeks).toFixed(1) : "—";
    const avgMonth = activeDays > 0 ? (stats.count / Math.max(1, monthly.length)).toFixed(1) : "—";
    const totalTimeSpent = sorted.reduce((sum, s) => sum + s.timeMs + (s.penalty === "plus2" ? Time.second * 2 : 0), 0);
    const curStreak = computeCurrentStreak(daily);
    const longestStreak = computeLongestStreak(daily);
    const median = computeMedian(sorted);
    const iqr = computeIQR(sorted);
    const consistencyScore = computeConsistencyScore(sorted);
    const recordAverages = computeRecordAverages(sorted);
    const percentiles = computePercentiles(sorted);
    const trend25 = computeSplitMeans(sorted, 25);
    const trend50 = computeSplitMeans(sorted, 50);

    return {
      sorted,
      stats,
      history,
      distribution,
      rollingAo5,
      rollingAo12,
      rollingAo50,
      monthly,
      daily,
      activity: { curStreak, longestStreak, avgDay, avgWeek, avgMonth },
      totalTimeSpent,
      median, iqr, consistencyScore, recordAverages, percentiles, trend25, trend50,
    };
  }, [solves]);

  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "overview";
  const setTab = useCallback((t: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (t === "overview") p.delete("tab");
    else p.set("tab", t);
    router.replace(`/session/${id}/stats${p.toString() ? `?${p.toString()}` : ""}`, { scroll: false });
  }, [id, router, searchParams]);
  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "performance", label: "Performance" },
    { id: "averages", label: "Averages" },
    { id: "charts", label: "Charts" },
  ] as const;

  if (!computed) {
    return (
      <>
        <title>{session?.name ? `${session.name} stats - QTimer` : "Session stats - QTimer"}</title>
        <main className="flex flex-col max-w-4xl mx-auto w-full px-4 py-4">
          <SessionNav sessionId={id} />
          <div className="flex flex-1 items-center justify-center text-xs text-muted pt-16">
            {solves === undefined ? <Loading variant="skeleton" lines={3} /> : "No solves yet"}
          </div>
        </main>
      </>
    );
  }

  const { sorted, stats, history, distribution, rollingAo5, rollingAo12, rollingAo50, monthly, daily, activity, totalTimeSpent, median, iqr, consistencyScore, recordAverages, percentiles, trend25, trend50 } = computed;

  return (
    <>
      <title>{`${session?.name || "Session"} stats - QTimer`}</title>
      <main className="flex flex-col max-w-4xl mx-auto w-full px-4 py-4 gap-3">
        <SessionNav sessionId={id} />

        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-bold text-primary">{session?.name || "Session"}</h1>
          <div className="flex items-center gap-2 text-[11px] text-secondary/50">
            <span>{stats.count} solve{stats.count !== 1 ? "s" : ""}</span>
            {sorted[0]?.createdAt && (
              <>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>{formatDate(sorted[0].createdAt)}</span>
              </>
            )}
            {sorted.length > 1 && sorted[sorted.length - 1]?.createdAt && (
              <>
                <span className="text-secondary/30">&ndash;</span>
                <span>{formatDate(sorted[sorted.length - 1].createdAt)}</span>
              </>
            )}
          </div>
        </div>

        <MonthlyOverview monthly={monthly} />

        <div className="flex gap-1 bg-bg-elevated/60 rounded-lg p-0.5 border border-border/20 self-start overflow-x-auto">
          {TABS.map((t) => (
            <button type="button"
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                tab === t.id ? "text-primary" : "text-secondary/50 hover:text-secondary"
              }`}
            >
              {tab === t.id && (
                <motion.div layoutId="session-tab" className="absolute inset-0 bg-bg-primary rounded-md border border-border/30" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              )}
              <span className="relative z-10">{t.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="space-y-3">
              <section className="space-y-2">
                <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider">Activity</h2>
                <ActivityGraph days={daily} total={stats.count} />
              </section>

              <section className="space-y-2">
                <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider">Summary</h2>
                <SessionSummary
                  count={stats.count}
                  best={stats.best}
                  mean={stats.mean}
                  worst={stats.worst}
                  dnfCount={stats.dnfCount}
                  totalTime={totalTimeSpent}
                />
              </section>

              <section className="space-y-2">
                <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider">Streaks</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
                  <StatCard label="Current Streak" value={`${activity.curStreak}d`} variant={activity.curStreak > 0 ? "best" : undefined} />
                  <StatCard label="Longest Streak" value={`${activity.longestStreak}d`} />
                  <StatCard label="Avg / Day" value={activity.avgDay} />
                  <StatCard label="Avg / Week" value={activity.avgWeek} />
                  <StatCard label="Avg / Month" value={activity.avgMonth} />
                </div>
              </section>
            </motion.div>
          )}

          {tab === "performance" && (
            <motion.div key="performance" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="space-y-3">
              <ConsistencySection median={median} iqr={iqr} consistency={consistencyScore} stdDev={stats.stdDev} />
              <TrendSection
                recent25={trend25.recent} prev25={trend25.previous} diff25={trend25.diff}
                recent50={trend50.recent} prev50={trend50.previous} diff50={trend50.diff}
              />
              <PercentilesSection percentiles={percentiles} />
            </motion.div>
          )}

          {tab === "averages" && (
            <motion.div key="averages" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="space-y-3">
              <section className="space-y-2">
                <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider">Current</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
                  <StatCard label="Best" value={stats.best != null ? formatMilliseconds(stats.best) : "—"} variant="best" />
                  <StatCard label="Worst" value={stats.worst != null ? formatMilliseconds(stats.worst) : "—"} variant="worst" />
                  <StatCard label="Mean" value={stats.mean != null ? formatMilliseconds(stats.mean) : "—"} />
                  <StatCard label="Std Dev" value={stats.stdDev != null ? formatMilliseconds(stats.stdDev) : "—"} />
                  {stats.ao5 != null && <StatCard label="Ao5" value={stats.ao5} />}
                  {stats.ao12 != null && <StatCard label="Ao12" value={stats.ao12} />}
                  {stats.ao50 != null && <StatCard label="Ao50" value={stats.ao50} />}
                  {stats.ao100 != null && <StatCard label="Ao100" value={stats.ao100} />}
                  <StatCard label="DNF" value={String(stats.dnfCount)} />
                  <StatCard label="Success" value={`${(stats.successRate * 100).toFixed(0)}%`} />
                </div>
              </section>
              <section className="space-y-2">
                <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider">Best Ever</h2>
                <RecordAverages records={recordAverages} />
              </section>
            </motion.div>
          )}

          {tab === "charts" && (
            <motion.div key="charts" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
              <ChartSection
                history={history}
                rollingAo5={rollingAo5}
                rollingAo12={rollingAo12}
                rollingAo50={rollingAo50}
                distribution={distribution}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}

