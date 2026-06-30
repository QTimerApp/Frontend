"use client";

import { motion } from "framer-motion";

export type ChartTab = "times" | "averages" | "distribution";

const CHART_TABS: { id: ChartTab; label: string }[] = [
  { id: "times", label: "Solve Times" },
  { id: "averages", label: "Rolling Averages" },
  { id: "distribution", label: "Distribution" },
];

export function TabBar({ active, onChange }: { active: ChartTab; onChange: (t: ChartTab) => void }) {
  return (
    <div className="flex gap-1 bg-bg-elevated/30 rounded-lg p-0.5 border border-border/20 self-start">
      {CHART_TABS.map((tab) => (
        <button type="button"
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            active === tab.id ? "text-primary" : "text-secondary/60 hover:text-secondary"
          }`}
        >
          {active === tab.id && (
            <motion.div layoutId="chart-tab-bg" className="absolute inset-0 bg-bg-elevated rounded-md border border-border/30" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
