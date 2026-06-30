"use client";

import { motion } from "framer-motion";
import type { UserProfile } from "@/types/user";
import { SectionLabel, MetricCard } from "./shared";

export function OverviewTab({ user }: { user: UserProfile }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.15 }}
      className="space-y-7"
    >
      {user.events && user.events.length > 0 && (
        <section>
          <SectionLabel>Events</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {user.events.map((e) => (
              <span key={e} className="px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
                {e}
              </span>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionLabel>Statistics</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <MetricCard label="Total Solves" value={(user.totalSolves ?? 0).toLocaleString()} />
          <MetricCard label="Events" value={String(user.events?.length ?? 0)} />
          <MetricCard label="Followers" value={(user.followers ?? 0).toLocaleString()} />
          <MetricCard label="Following" value={(user.following ?? 0).toLocaleString()} />
        </div>
      </section>
    </motion.div>
  );
}
