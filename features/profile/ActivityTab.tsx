"use client";

import { motion } from "framer-motion";
import { User, Layers } from "@/components/icons";

const EXAMPLE_ACTIVITY = [
  { type: "solve" as const, label: "Set a new PB on 3×3", detail: "7.84 seconds (OLL skip)", time: "2h ago" },
  { type: "solve" as const, label: "Completed 500 solves on Megaminx", detail: "5,432 total solves", time: "1d ago" },
  { type: "solve" as const, label: "New best Ao12 on 4×4", detail: "42.15 average", time: "3d ago" },
  { type: "social" as const, label: "Started following @max", detail: "Speedcuber from Germany", time: "5d ago" },
  { type: "solve" as const, label: "Hit 10,000 total solves", detail: "All events combined", time: "1w ago" },
  { type: "solve" as const, label: "Sub-20 on 5×5 for the first time", detail: "19.43 seconds", time: "2w ago" },
];

export function ActivityTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.15 }}
      className="space-y-1"
    >
      {EXAMPLE_ACTIVITY.map((item, i) => (
        <div
          key={i}
          className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-bg-elevated/20 transition-colors"
        >
          <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
            item.type === "solve"
              ? "bg-accent/10 text-accent"
              : "bg-emerald-500/10 text-emerald-500"
          }`}>
            {item.type === "solve" ? (
              <Layers className="size-4" />
            ) : (
              <User className="size-4" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-primary font-medium">{item.label}</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">{item.detail}</p>
          </div>
          <span className="text-xs text-muted-foreground/50 shrink-0 pt-0.5">{item.time}</span>
        </div>
      ))}
    </motion.div>
  );
}
