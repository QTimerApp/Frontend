"use client";

import { useState } from "react";
import { Search, X } from "@/components/icons";
import { AnimatePresence, motion } from "framer-motion";
import { useClickOutside } from "@/lib/hooks/useClickOutside";
import { PenaltyFilter, TimeComparator } from "@/types/solve-search";
import type { SolveFilters } from "@/types/solve-search";

const PENALTY_OPTIONS = [
  { label: "Any", value: PenaltyFilter.Any },
  { label: "Penalty", value: PenaltyFilter.WithPenalty },
  { label: "No penalty", value: PenaltyFilter.None },
  { label: "+2", value: PenaltyFilter.PlusTwo },
  { label: "DNF", value: PenaltyFilter.DNF },
];

const TIME_OPTIONS = [
  { label: "Any time", value: TimeComparator.Any },
  { label: "Over", value: TimeComparator.Over },
  { label: "Under", value: TimeComparator.Under },
];

function Pill<T extends string>({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-none px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
        active
          ? "bg-accent/12 text-accent ring-1 ring-accent/25"
          : "bg-bg-active/50 text-muted hover:text-secondary hover:bg-bg-hover/60"
      }`}
    >
      {label}
    </button>
  );
}

export function SolveSearchBar({
  filters,
  onChange,
  resultCount,
}: {
  filters: SolveFilters;
  onChange: (filters: SolveFilters) => void;
  resultCount: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(open, () => setOpen(false));
  const hasTime = filters.timeComparator !== TimeComparator.Any && filters.timeValue;

  function set<K extends keyof SolveFilters>(key: K, value: SolveFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  const hasActiveFilters = filters.penalty !== PenaltyFilter.Any || filters.timeComparator !== TimeComparator.Any || filters.query;
  const filterCount = (filters.penalty !== PenaltyFilter.Any ? 1 : 0) + (filters.timeComparator !== TimeComparator.Any ? 1 : 0);

  return (
    <div ref={ref} className="relative shrink-0 border-b border-border/20">
      <div className="px-3 pt-2.5 pb-2 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted/30 pointer-events-none" />
          <input
            value={filters.query}
            onChange={(e) => set("query", e.target.value)}
            placeholder="Search notes..."
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-bg-primary/80 border border-border/20 text-xs text-primary placeholder:text-muted/30 focus:outline-none focus:ring-1 focus:ring-accent/30 transition-all"
          />
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`relative shrink-0 h-8 px-2.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
            hasActiveFilters
              ? "text-accent border-accent/25 bg-accent/8"
              : "text-muted border-border/20 bg-transparent hover:text-secondary hover:border-border/40"
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5" aria-hidden={true}>
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Filters
          {filterCount > 0 && (
            <span className="size-4 rounded-full bg-accent text-[9px] font-bold text-white flex items-center justify-center leading-none">
              {filterCount}
            </span>
          )}
        </button>
        <span className="text-[11px] font-medium tabular-nums text-muted/50 shrink-0">{resultCount}</span>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-1.5 px-3 pb-2 flex-wrap">
          {filters.penalty !== PenaltyFilter.Any && (
            <button
              type="button"
              onClick={() => set("penalty", PenaltyFilter.Any)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent/8 text-accent text-[10px] font-medium border-none cursor-pointer hover:bg-accent/15 transition-colors"
            >
              <span>
                PENALTY:{" "}
                {filters.penalty === PenaltyFilter.WithPenalty
                  ? "Yes"
                  : filters.penalty === PenaltyFilter.None
                    ? "No"
                    : filters.penalty.toUpperCase()}
              </span>
              <X className="size-2.5" />
            </button>
          )}
          {hasTime && (
            <button
              type="button"
              onClick={() => { set("timeComparator", TimeComparator.Any); set("timeValue", ""); }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent/8 text-accent text-[10px] font-medium border-none cursor-pointer hover:bg-accent/15 transition-colors"
            >
              <span>
                {filters.timeComparator === TimeComparator.Over ? "OVER" : "UNDER"} {filters.timeValue}
              </span>
              <X className="size-2.5" />
            </button>
          )}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="mx-3 mb-2.5 p-3 rounded-xl bg-bg-elevated border border-border/30 shadow-lg"
          >
            <div className="space-y-3">
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Penalty</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PENALTY_OPTIONS.map((opt) => (
                    <Pill
                      key={opt.value}
                      label={opt.label}
                      active={filters.penalty === opt.value}
                      onClick={() => set("penalty", opt.value as SolveFilters["penalty"])}
                    />
                  ))}
                </div>
              </div>

              <div className="h-px bg-border/10" />

              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Time</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {TIME_OPTIONS.map((opt) => (
                    <Pill
                      key={opt.value}
                      label={opt.label}
                      active={filters.timeComparator === opt.value}
                      onClick={() => set("timeComparator", opt.value as SolveFilters["timeComparator"])}
                    />
                  ))}
                </div>
                {filters.timeComparator !== TimeComparator.Any && (
                  <input
                    value={filters.timeValue}
                    onChange={(e) => set("timeValue", e.target.value)}
                    placeholder="e.g. 1:30.000"
                    className="w-full h-8 px-3 rounded-lg bg-bg-primary/80 border border-border/20 text-xs font-mono text-primary placeholder:text-muted/30 focus:outline-none focus:ring-1 focus:ring-accent/30 transition-all mt-1.5"
                    autoFocus
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
