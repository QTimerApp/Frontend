"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { DBSolve } from "@/types/db";
import { formatMilliseconds, formatMsLabel } from "@/lib/utils/format";
import { isDNF, effectiveTimeMs } from "@/types/penalty";
import { computeSolveHistory, computeDistribution, countDNF, computeSuccessRate, computeAo } from "@/lib/utils/stats";
import { PUZZLE_TYPES } from "@/features/sessions/puzzle-types";
import { StatCard } from "./Card";
import { tickStyle, axisStyle, tooltipStyle } from "./chart-styles";

export function PuzzleStatRow({ label, solves, index }: { label: string; solves: DBSolve[]; index: number }) {
  const [open, setOpen] = useState(false);
  const [chartMounted, setChartMounted] = useState(false);

  useEffect(() => {
    if (!open) { setChartMounted(false); return; }
    const raf = requestAnimationFrame(() => setChartMounted(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);
  const valid = solves.filter((s) => !isDNF(s.penalty ?? null));
  const times = valid.map((s) => effectiveTimeMs(s.timeMs, s.penalty ?? null));
  const best = times.length ? Math.min(...times) : null;
  const mean = times.length ? times.reduce((a, b) => a + b, 0) / times.length : null;
  const dnfCount = countDNF(solves);
  const rate = computeSuccessRate(solves);

  const history = useMemo(() => computeSolveHistory(solves), [solves]);
  const distribution = useMemo(() => computeDistribution(solves, 8), [solves]);
  const distData = distribution.map((b) => ({ range: formatMilliseconds(b.rangeStart), count: b.count }));

  return (
    <div className="rounded-xl border border-border/15 bg-bg-elevated/20 overflow-hidden">
      <button type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-bg-hover/30 transition-colors text-left"
      >
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.15 }}
          className="size-2.5 text-muted shrink-0"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
        <div className="size-5 flex items-center justify-center text-muted">
          {PUZZLE_TYPES.find((p) => p.name === label)?.icon?.()}
        </div>
        <span className="text-sm font-semibold text-primary flex-1">{label}</span>
        <span className="text-xs text-muted tabular-nums">{solves.length} solves</span>
        {best != null && (
          <span className="text-xs font-mono font-bold text-accent tabular-nums">{formatMsLabel(best)}</span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border/10">
              <div className="grid grid-cols-4 gap-2">
                <StatCard label="Best" value={best != null ? formatMsLabel(best) : "—"} />
                <StatCard label="Mean" value={mean != null ? formatMsLabel(mean) : "—"} />
                <StatCard label="DNF" value={`${dnfCount}`} sub={solves.length ? `${(rate * 100).toFixed(1)}%` : ""} />
                <StatCard label="Ao5" value={computeAo(solves, 5) ?? "—"} />
              </div>

              {chartMounted && history.length > 1 && (
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 1, height: 1 }} minHeight={160}>
                    <LineChart data={history} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" {...axisStyle} />
                      <XAxis dataKey="index" tick={tickStyle} tickLine={false} axisLine={axisStyle} />
                      <YAxis tick={tickStyle} tickLine={false} axisLine={axisStyle} tickFormatter={formatMsLabel} width={50} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => typeof v === "number" ? [formatMsLabel(v), "Time"] : ["—", "Time"]} />
                      <Line type="monotone" dataKey="time" stroke="var(--accent)" strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: "var(--accent)" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {chartMounted && distData.length > 0 && (
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 1, height: 1 }} minHeight={128}>
                    <BarChart data={distData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" {...axisStyle} />
                      <XAxis dataKey="range" tick={{ fontSize: 8, fill: "var(--text-secondary)" }} tickLine={false} axisLine={axisStyle} interval={0} angle={-30} textAnchor="end" height={40} />
                      <YAxis tick={tickStyle} tickLine={false} axisLine={axisStyle} allowDecimals={false} width={25} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [typeof v === "number" ? v : 0, "Solves"]} />
                      <Bar dataKey="count" fill="var(--accent)" radius={[2, 2, 0, 0]} opacity={0.6} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
