"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatMilliseconds } from "@/lib/utils/format";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { TabBar, type ChartTab } from "./TabBar";
import { tickStyle, axisStyle, tooltipStyle } from "./chart-styles";
import type { SolvePoint, RollingAveragePoint, DistributionBin } from "@/types/stats";

function TimesChart({ history }: { history: SolvePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 1, height: 1 }} minHeight={192}>
      <LineChart data={history} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <CartesianGrid strokeDasharray="3 3" {...axisStyle} />
        <XAxis dataKey="index" tick={tickStyle} tickLine={false} axisLine={axisStyle} />
        <YAxis tick={tickStyle} tickLine={false} axisLine={axisStyle} tickFormatter={(v: unknown) => typeof v === "number" ? formatMilliseconds(v) : ""} width={60} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--text-primary)", fontWeight: 600 }} formatter={(value: unknown) => typeof value === "number" ? [formatMilliseconds(value), "Time"] : ["—", "Time"]} labelFormatter={(label) => `Solve #${label}`} />
        <Line type="monotone" dataKey="time" stroke="var(--accent)" strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: "var(--accent)" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function AveragesChart({ ao5, ao12, ao50 }: { ao5: RollingAveragePoint[]; ao12: RollingAveragePoint[]; ao50: RollingAveragePoint[] }) {
  return (
    <>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 1, height: 1 }} minHeight={192}>
        <LineChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" {...axisStyle} />
          <XAxis dataKey="index" tick={tickStyle} tickLine={false} axisLine={axisStyle} />
          <YAxis tick={tickStyle} tickLine={false} axisLine={axisStyle} tickFormatter={(v: unknown) => typeof v === "number" ? formatMilliseconds(v) : ""} width={60} />
          <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--text-primary)", fontWeight: 600 }} formatter={(value: unknown, name: unknown) => {
            const label = typeof name === "string" ? name : "Average";
            if (typeof value !== "number" || !isFinite(value)) return ["DNF", label];
            return [formatMilliseconds(value), label];
          }} labelFormatter={(label) => `Solve #${label}`} />
          <Line data={ao5.filter((d) => d.value != null && isFinite(d.value))} type="monotone" dataKey="value" name="Ao5" stroke="#f97316" strokeWidth={1.5} dot={false} connectNulls={false} />
          <Line data={ao12.filter((d) => d.value != null && isFinite(d.value))} type="monotone" dataKey="value" name="Ao12" stroke="#3b82f6" strokeWidth={1.5} dot={false} connectNulls={false} />
          {ao50.length > 0 && (
            <Line data={ao50.filter((d) => d.value != null && isFinite(d.value))} type="monotone" dataKey="value" name="Ao50" stroke="#22c55e" strokeWidth={1.5} dot={false} connectNulls={false} />
          )}
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 text-xs text-secondary/60 mt-1">
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded-full bg-orange-500" /> Ao5</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded-full bg-blue-500" /> Ao12</span>
        {ao50.length > 0 && <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded-full bg-green-500" /> Ao50</span>}
      </div>
    </>
  );
}

function DistributionChart({ data }: { data: { range: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 1, height: 1 }} minHeight={192}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <CartesianGrid strokeDasharray="3 3" {...axisStyle} />
        <XAxis dataKey="range" tick={{ fontSize: 9, fill: "var(--text-secondary)" }} tickLine={false} axisLine={axisStyle} interval={0} angle={-30} textAnchor="end" height={50} />
        <YAxis tick={tickStyle} tickLine={false} axisLine={axisStyle} allowDecimals={false} width={30} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--text-primary)", fontWeight: 600 }} formatter={(value: unknown) => [typeof value === "number" ? value : 0, "Solves"]} />
        <Bar dataKey="count" fill="var(--accent)" radius={[3, 3, 0, 0]} opacity={0.7} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ChartSection({
  history, rollingAo5, rollingAo12, rollingAo50, distribution,
}: {
  history: SolvePoint[];
  rollingAo5: RollingAveragePoint[];
  rollingAo12: RollingAveragePoint[];
  rollingAo50: RollingAveragePoint[];
  distribution: DistributionBin[];
}) {
  const [tab, setTab] = useState<ChartTab>("times");

  const distData = useMemo(() =>
    distribution.map((b) => ({ range: formatMilliseconds(b.rangeStart), count: b.count })),
  [distribution]);

  const showTimes = tab === "times" && history.length > 1;
  const showAverages = tab === "averages" && rollingAo5.length > 0;
  const showDistribution = tab === "distribution" && distData.length > 0;
  const empty = (tab === "times" && history.length <= 1) || (tab === "averages" && rollingAo5.length <= 0) || (tab === "distribution" && distData.length <= 0);

  return (
    <div className="flex flex-col gap-3 rounded-xl p-3 border border-border/20 bg-bg-elevated/20">
      <TabBar active={tab} onChange={setTab} />
      <AnimatePresence mode="wait">
        {showTimes && (
          <motion.div key="times" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="h-48">
            <TimesChart history={history} />
          </motion.div>
        )}
        {showAverages && (
          <motion.div key="averages" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="h-48">
            <AveragesChart ao5={rollingAo5} ao12={rollingAo12} ao50={rollingAo50} />
          </motion.div>
        )}
        {showDistribution && (
          <motion.div key="distribution" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="h-48">
            <DistributionChart data={distData} />
          </motion.div>
        )}
        {empty && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center h-32 text-xs text-secondary/40">
            Not enough data for this chart
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
