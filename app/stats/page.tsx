"use client";

import { useMemo, useCallback, useState, Suspense } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { db } from "@/lib/db";
import {
  formatMilliseconds,
  formatMsLabel,
  formatTimeSpent,
} from "@/lib/utils/format";
import { isDNF, effectiveTimeMs, Penalty } from "@/types/penalty";
import {
  computeSessionStats,
  computeSolveHistory,
  computeDistribution,
  computeMonthlyBreakdown,
  computeDailyCounts,
  computeCurrentStreak,
  computeLongestStreak,
  countDNF,
  computeLongestSession,
  computeMostActiveDay,
} from "@/lib/utils/stats";
import { PUZZLE_TYPES } from "@/features/sessions/puzzle-types";
import { Loading } from "@/components/ui/Loading";
import { StatCard } from "@/features/statistics/Card";
import { PuzzleStatRow } from "@/features/statistics/PuzzleStatRow";
import { ActivityCalendar } from "@/features/statistics/ActivityCalendar";
import { Stats } from "@/components/icons";
import { Time } from "@/types/timer";

const tickStyle = { fontSize: 11, fill: "var(--text-secondary)" };
const axisStyle = { stroke: "var(--border)", opacity: 0.3 };
const tooltipStyle = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "var(--text-primary)",
};

export default function StatsPage() {
  return (
    <Suspense fallback={null}>
      <StatsPageContent />
    </Suspense>
  );
}

function StatsPageContent() {
  const allSolves = useLiveQuery(() => db.solves.toArray());
  const sessions = useLiveQuery(() => db.sessions.toArray());

  const data = useMemo(() => {
    if (!allSolves || !sessions) return null;

    const sessionMap = new Map(sessions.map((s) => [s.id, s]));
    const puzzleMap = new Map<string, typeof allSolves>();
    for (const solve of allSolves) {
      const session = sessionMap.get(solve.sessionId);
      const key = session?.eventId ?? "Unknown";
      if (!puzzleMap.has(key)) puzzleMap.set(key, []);
      puzzleMap.get(key)!.push(solve);
    }

    const sortedAll = [...allSolves].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    const overall = computeSessionStats(sortedAll);
    const history = computeSolveHistory(sortedAll);
    const distribution = computeDistribution(sortedAll, 12);
    const monthly = computeMonthlyBreakdown(sortedAll);
    const dailyCounts = computeDailyCounts(sortedAll);
    const currentStreak = computeCurrentStreak(dailyCounts);
    const longestStreak = computeLongestStreak(dailyCounts);

    const totalTimeSpent = allSolves.reduce(
      (sum, s) =>
        sum + s.timeMs + (s.penalty === Penalty.PlusTwo ? Time.second * 2 : 0),
      0,
    );

    const today = new Date().toISOString().slice(0, 10);
    const todayCount = allSolves.filter((s) =>
      s.createdAt?.startsWith(today),
    ).length;

    const puzzles = Array.from(puzzleMap.entries()).map(([key, solves]) => ({
      key,
      solves,
    }));

    const longestSession = computeLongestSession(sortedAll);
    const mostActiveDay = computeMostActiveDay(dailyCounts);

    return {
      overall,
      history,
      distribution,
      monthly,
      dailyCounts,
      currentStreak,
      longestStreak,
      totalTimeSpent,
      todayCount,
      puzzles,
      longestSession,
      mostActiveDay,
    };
  }, [allSolves, sessions]);

  const [tab, setTab] = useState<"times" | "distribution">("times");
  const router = useRouter();
  const searchParams = useSearchParams();
  const mainTab = searchParams.get("tab") || "overview";
  const setMainTab = useCallback(
    (t: string) => {
      const p = new URLSearchParams(searchParams.toString());
      if (t === "overview") p.delete("tab");
      else p.set("tab", t);
      router.replace(`/stats${p.toString() ? `?${p.toString()}` : ""}`, {
        scroll: false,
      });
    },
    [router, searchParams],
  );
  const MAIN_TABS = [
    { id: "overview", label: "Overview" },
    { id: "puzzles", label: "Puzzles" },
    { id: "charts", label: "Charts" },
  ] as const;

  if (!data) {
    return (
      <main className="flex flex-1 flex-col">
        <title>QTimer - Stats</title>
        <Loading variant="page" />
      </main>
    );
  }

  const {
    overall,
    history,
    distribution,
    monthly,
    dailyCounts,
    currentStreak,
    longestStreak,
    totalTimeSpent,
    todayCount,
    puzzles,
    longestSession,
    mostActiveDay,
  } = data;

  const distData = distribution.map((b) => ({
    range: formatMilliseconds(b.rangeStart),
    count: b.count,
  }));
  const showTimes = tab === "times" && history.length > 1;
  const showDistribution = tab === "distribution" && distData.length > 0;
  const chartEmpty =
    (tab === "times" && history.length <= 1) ||
    (tab === "distribution" && distData.length <= 0);

  return (
    <>
      <title>QTimer - Stats</title>
      <main className="flex flex-col flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full px-5 pt-8 pb-16 space-y-6">
          <h1 className="text-xl font-bold text-primary">Statistics</h1>

          {overall.count === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="size-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Stats className="size-6 text-accent" />
              </div>
              <p className="text-sm text-muted">No solves yet</p>
            </div>
          )}

          {overall.count > 0 && (
            <>
              <div className="flex gap-1 bg-bg-elevated/60 rounded-lg p-0.5 border border-border/20 self-start overflow-x-auto">
                {MAIN_TABS.map((t) => (
                  <button type="button"
                    key={t.id}
                    onClick={() => setMainTab(t.id)}
                    className={`relative px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                      mainTab === t.id
                        ? "text-primary"
                        : "text-secondary/50 hover:text-secondary"
                    }`}
                  >
                    {mainTab === t.id && (
                      <motion.div
                        layoutId="global-tab"
                        className="absolute inset-0 bg-bg-primary rounded-md border border-border/30"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <span className="relative z-10">{t.label}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {mainTab === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      <StatCard label="Total" value={String(overall.count)} />
                      <StatCard label="Today" value={String(todayCount)} />
                      <StatCard
                        label="Best"
                        value={
                          overall.best != null
                            ? formatMsLabel(overall.best)
                            : "—"
                        }
                      />
                      <StatCard
                        label="Mean"
                        value={
                          overall.mean != null
                            ? formatMsLabel(overall.mean)
                            : "—"
                        }
                      />
                      <StatCard
                        label="DNF Rate"
                        value={`${((overall.dnfCount / overall.count) * 100).toFixed(1)}%`}
                        sub={`${overall.dnfCount} / ${overall.count}`}
                      />
                      <StatCard
                        label="+2 Count"
                        value={String(overall.plus2Count)}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <StatCard
                        label="Std Dev"
                        value={
                          overall.stdDev != null
                            ? formatMsLabel(overall.stdDev)
                            : "—"
                        }
                      />
                      <StatCard
                        label="Worst"
                        value={
                          overall.worst != null
                            ? formatMsLabel(overall.worst)
                            : "—"
                        }
                      />
                      <StatCard
                        label="Success"
                        value={`${(overall.successRate * 100).toFixed(1)}%`}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <StatCard
                        label="Total Time Spent"
                        value={formatTimeSpent(totalTimeSpent)}
                      />
                      <StatCard
                        label="Sessions"
                        value={String(sessions?.length ?? 0)}
                      />
                    </div>

                    <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-bg-elevated/30 border border-border/15">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted">
                          Current streak
                        </span>
                        <span className="text-lg font-bold tabular-nums text-accent">
                          {currentStreak}
                        </span>
                        <span className="text-xs text-muted">days</span>
                      </div>
                      <div className="w-px h-6 bg-border/20" />
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted">
                          Longest streak
                        </span>
                        <span className="text-lg font-bold tabular-nums text-primary">
                          {longestStreak}
                        </span>
                        <span className="text-xs text-muted">days</span>
                      </div>
                    </div>

                    {dailyCounts.length > 0 && (
                      <section className="space-y-2">
                        <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider">
                          Activity
                        </h2>
                        <div className="rounded-xl border border-border/20 bg-bg-elevated/20 p-3">
                          <ActivityCalendar days={dailyCounts} />
                        </div>
                      </section>
                    )}

                    <section className="space-y-2">
                      <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider">
                        Milestones
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="flex flex-col items-center gap-1 px-3 py-3 rounded-xl bg-bg-elevated/30 border border-border/15">
                          <span className="text-lg font-bold tabular-nums text-primary">
                            {overall.count}
                          </span>
                          <span className="text-[10px] text-muted">Total solves</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 px-3 py-3 rounded-xl bg-bg-elevated/30 border border-border/15">
                          <span className="text-lg font-bold tabular-nums text-primary">
                            {Math.floor(totalTimeSpent / Time.hour)}
                          </span>
                          <span className="text-[10px] text-muted">Hours spent</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 px-3 py-3 rounded-xl bg-bg-elevated/30 border border-border/15">
                          <span className="text-lg font-bold tabular-nums text-primary">
                            {sessions?.length ?? 0}
                          </span>
                          <span className="text-[10px] text-muted">Sessions</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 px-3 py-3 rounded-xl bg-bg-elevated/30 border border-border/15">
                          <span className="text-lg font-bold tabular-nums text-primary">
                            {longestSession?.count ?? 0}
                          </span>
                          <span className="text-[10px] text-muted">Longest session</span>
                        </div>
                      </div>
                    </section>
                  </motion.div>
                )}

                {mainTab === "puzzles" && puzzles.length > 0 && (
                  <motion.div
                    key="puzzles"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-3"
                  >
                    <div
                      className="grid gap-2"
                      style={{
                        gridTemplateColumns: `repeat(${Math.min(puzzles.length, 4)}, 1fr)`,
                      }}
                    >
                      {puzzles.map((p) => {
                        const valid = p.solves.filter(
                          (s) => !isDNF(s.penalty ?? null),
                        );
                        const times = valid.map((s) =>
                          effectiveTimeMs(s.timeMs, s.penalty ?? null),
                        );
                        const best = times.length ? Math.min(...times) : null;
                        const mean = times.length
                          ? times.reduce((a, b) => a + b, 0) / times.length
                          : null;
                        const dnfRate = p.solves.length
                          ? (countDNF(p.solves) / p.solves.length) * 100
                          : 0;
                        const PuzzleIcon = PUZZLE_TYPES.find(
                          (pt) => pt.name === p.key,
                        )?.icon;
                        return (
                          <div
                            key={p.key}
                            className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl bg-bg-elevated/30 border border-border/15"
                          >
                            <div className="size-6 text-muted">
                              {PuzzleIcon && <PuzzleIcon />}
                            </div>
                            <span className="text-[10px] font-bold text-primary">
                              {p.key}
                            </span>
                            <span className="text-[10px] text-muted tabular-nums">
                              {p.solves.length} solves
                            </span>
                            {best != null && (
                              <span className="text-xs font-bold text-accent tabular-nums">
                                {formatMsLabel(best)}
                              </span>
                            )}
                            {mean != null && (
                              <span className="text-[9px] text-muted/60 tabular-nums">
                                μ {formatMsLabel(mean)}
                              </span>
                            )}
                            <span className="text-[9px] text-muted/60">
                              {dnfRate.toFixed(0)}% DNF
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {puzzles.length > 1 && (
                      <div className="h-40 rounded-xl border border-border/20 bg-bg-elevated/20 p-3">
                        <ResponsiveContainer
                          width="100%"
                          height="100%"
                          initialDimension={{ width: 1, height: 1 }}
                          minHeight={160}
                        >
                          <BarChart
                            data={puzzles.map((p) => {
                              const valid = p.solves.filter(
                                (s) => !isDNF(s.penalty ?? null),
                              );
                              const times = valid.map((s) =>
                                effectiveTimeMs(s.timeMs, s.penalty ?? null),
                              );
                              return {
                                name: p.key,
                                best: times.length ? Math.min(...times) : null,
                                mean: times.length
                                  ? times.reduce((a, b) => a + b, 0) /
                                    times.length
                                  : null,
                                count: p.solves.length,
                              };
                            })}
                            margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              {...axisStyle}
                            />
                            <XAxis
                              dataKey="name"
                              tick={{
                                fontSize: 9,
                                fill: "var(--text-secondary)",
                              }}
                              tickLine={false}
                              axisLine={axisStyle}
                            />
                            <YAxis
                              tick={tickStyle}
                              tickLine={false}
                              axisLine={axisStyle}
                              tickFormatter={formatMsLabel}
                              width={50}
                            />
                            <Tooltip
                              contentStyle={tooltipStyle}
                              formatter={(v: unknown) =>
                                typeof v === "number"
                                  ? [formatMsLabel(v), "Time"]
                                  : ["—", "Time"]
                              }
                            />
                            <Bar
                              dataKey="best"
                              name="Best"
                              fill="var(--accent)"
                              radius={[3, 3, 0, 0]}
                              opacity={0.8}
                            />
                            <Bar
                              dataKey="mean"
                              name="Mean"
                              fill="#3b82f6"
                              radius={[3, 3, 0, 0]}
                              opacity={0.6}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                        <div className="flex items-center justify-center gap-4 text-xs text-secondary/60 mt-1">
                          <span className="flex items-center gap-1.5">
                            <span className="size-3 rounded-sm bg-accent opacity-80" />{" "}
                            Best
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="size-3 rounded-sm bg-blue-500 opacity-60" />{" "}
                            Mean
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      {puzzles.map((p, i) => (
                        <PuzzleStatRow
                          key={p.key}
                          label={p.key}
                          solves={p.solves}
                          index={i}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {mainTab === "charts" && (
                  <motion.div
                    key="charts"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-3"
                  >
                    <section className="space-y-2">
                      <div className="rounded-xl border border-border/20 bg-bg-elevated/20 p-3 space-y-3">
                        <div className="flex gap-1 bg-bg-elevated/30 rounded-lg p-0.5 border border-border/20 self-start">
                          {(["times", "distribution"] as const).map((t) => (
                            <button type="button"
                              key={t}
                              onClick={() => setTab(t)}
                              className={`relative px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                                tab === t
                                  ? "text-primary"
                                  : "text-secondary/60 hover:text-secondary"
                              }`}
                            >
                              {tab === t && (
                                <motion.div
                                  layoutId="chart-subtab"
                                  className="absolute inset-0 bg-bg-elevated rounded-md border border-border/30"
                                  transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 30,
                                  }}
                                />
                              )}
                              <span className="relative z-10">
                                {t === "times" ? "Solve Times" : "Distribution"}
                              </span>
                            </button>
                          ))}
                        </div>
                        <AnimatePresence mode="wait">
                          {showTimes && (
                            <motion.div
                              key="times"
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              transition={{ duration: 0.15 }}
                              className="h-52"
                            >
                              <ResponsiveContainer
                                width="100%"
                                height="100%"
                                initialDimension={{ width: 1, height: 1 }}
                                minHeight={208}
                              >
                                <LineChart
                                  data={history}
                                  margin={{
                                    top: 4,
                                    right: 4,
                                    bottom: 4,
                                    left: 4,
                                  }}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    {...axisStyle}
                                  />
                                  <XAxis
                                    dataKey="index"
                                    tick={tickStyle}
                                    tickLine={false}
                                    axisLine={axisStyle}
                                  />
                                  <YAxis
                                    tick={tickStyle}
                                    tickLine={false}
                                    axisLine={axisStyle}
                                    tickFormatter={formatMsLabel}
                                    width={60}
                                  />
                                  <Tooltip
                                    contentStyle={tooltipStyle}
                                    labelStyle={{
                                      color: "var(--text-primary)",
                                      fontWeight: 600,
                                    }}
                                    formatter={(v: unknown) =>
                                      typeof v === "number"
                                        ? [formatMsLabel(v), "Time"]
                                        : ["—", "Time"]
                                    }
                                    labelFormatter={(l) => `Solve #${l}`}
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="time"
                                    stroke="var(--accent)"
                                    strokeWidth={1.5}
                                    dot={false}
                                    activeDot={{ r: 3, fill: "var(--accent)" }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </motion.div>
                          )}

                          {showDistribution && (
                            <motion.div
                              key="distribution"
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              transition={{ duration: 0.15 }}
                              className="h-52"
                            >
                              <ResponsiveContainer
                                width="100%"
                                height="100%"
                                initialDimension={{ width: 1, height: 1 }}
                                minHeight={208}
                              >
                                <BarChart
                                  data={distData}
                                  margin={{
                                    top: 4,
                                    right: 4,
                                    bottom: 4,
                                    left: 4,
                                  }}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    {...axisStyle}
                                  />
                                  <XAxis
                                    dataKey="range"
                                    tick={{
                                      fontSize: 9,
                                      fill: "var(--text-secondary)",
                                    }}
                                    tickLine={false}
                                    axisLine={axisStyle}
                                    interval={0}
                                    angle={-30}
                                    textAnchor="end"
                                    height={50}
                                  />
                                  <YAxis
                                    tick={tickStyle}
                                    tickLine={false}
                                    axisLine={axisStyle}
                                    allowDecimals={false}
                                    width={30}
                                  />
                                  <Tooltip
                                    contentStyle={tooltipStyle}
                                    formatter={(v: unknown) => [
                                      typeof v === "number" ? v : 0,
                                      "Solves",
                                    ]}
                                  />
                                  <Bar
                                    dataKey="count"
                                    fill="var(--accent)"
                                    radius={[3, 3, 0, 0]}
                                    opacity={0.7}
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </motion.div>
                          )}
                          {chartEmpty && (
                            <motion.div
                              key="empty"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-center justify-center h-32 text-xs text-secondary/40"
                            >
                              Not enough data for this chart
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </section>

                    {monthly.length > 0 && (
                      <section className="space-y-2">
                        <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider">
                          Monthly Breakdown
                        </h2>
                        <div className="rounded-xl border border-border/20 bg-bg-elevated/20 p-3">
                          <div className="h-44">
                            <ResponsiveContainer
                              width="100%"
                              height="100%"
                              initialDimension={{ width: 1, height: 1 }}
                              minHeight={176}
                            >
                              <BarChart
                                data={monthly.map((m) => ({
                                  ...m,
                                  month:
                                    m.month.slice(5, 7) +
                                    "/" +
                                    m.month.slice(2, 4),
                                }))}
                                margin={{
                                  top: 4,
                                  right: 4,
                                  bottom: 4,
                                  left: 4,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  {...axisStyle}
                                />
                                <XAxis
                                  dataKey="month"
                                  tick={{
                                    fontSize: 9,
                                    fill: "var(--text-secondary)",
                                  }}
                                  tickLine={false}
                                  axisLine={axisStyle}
                                />
                                <YAxis
                                  tick={tickStyle}
                                  tickLine={false}
                                  axisLine={axisStyle}
                                  allowDecimals={false}
                                  width={25}
                                />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Bar
                                  dataKey="count"
                                  fill="var(--accent)"
                                  radius={[2, 2, 0, 0]}
                                  opacity={0.7}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {monthly.slice(-12).map((m) => (
                              <div
                                key={m.month}
                                className="flex items-center justify-between px-2 py-1 rounded-lg bg-bg-elevated/30 text-[11px]"
                              >
                                <span className="text-secondary">
                                  {m.month.slice(5, 7) +
                                    "/" +
                                    m.month.slice(2, 4)}
                                </span>
                                <span className="font-medium tabular-nums text-primary">
                                  {m.count}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </main>
    </>
  );
}
