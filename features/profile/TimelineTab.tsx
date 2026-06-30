"use client";

import { motion } from "framer-motion";

const EXAMPLE_TIMELINE = [
  { year: "2026", items: ["Top 100 in Megaminx worldwide (WR32)", "10,000 solves on QTimer", "Built profile settings & social features"] },
  { year: "2025", items: ["Started building QTimer full-time", "Sub-10 on 3×3 (9.84 official)", "Broke into top 500 globally for 3×3"] },
  { year: "2024", items: ["First competition (Singapore Open)", "Official WCA debut — 3×3, 4×4, Megaminx", "Sub-15 on 3×3 average"] },
  { year: "2022", items: ["Started speedcubing seriously", "First sub-30 solve on 3×3", "Joined WCA community"] },
];

export function TimelineTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.15 }}
      className="space-y-0"
    >
      {EXAMPLE_TIMELINE.map((period, i) => (
        <div key={period.year} className="relative pl-8 pb-8 last:pb-0">
          {i < EXAMPLE_TIMELINE.length - 1 && (
            <div className="absolute left-2.75 top-6 bottom-0 w-px bg-border/20" />
          )}
          <div className="absolute left-0 top-1.5 size-5.75 rounded-full bg-bg-elevated/40 border border-border/20 flex items-center justify-center">
            <div className="size-2 rounded-full bg-accent/60" />
          </div>
          <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            {period.year}
          </span>
          <div className="mt-2 space-y-2">
            {period.items.map((item) => (
              <div key={item} className="rounded-lg border border-border/15 bg-bg-elevated/20 px-3.5 py-2.5">
                <p className="text-sm text-primary leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
