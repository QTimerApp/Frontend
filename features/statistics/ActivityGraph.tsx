"use client";

import { useMemo, useState, useCallback } from "react";
import type { DayCount } from "@/types/stats";

const S = 13;
const G = 2;
const STEP = S + G;
const LABEL_W = 22;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

const LV = [
  { bg: "var(--bg-active)", op: 0.15 },
  { bg: "var(--accent)", op: 0.15 },
  { bg: "var(--accent)", op: 0.4 },
  { bg: "var(--accent)", op: 0.65 },
  { bg: "var(--accent)", op: 1 },
] as const;

function lvl(c: number, m: number): number {
  if (c === 0) return 0;
  const r = c / m;
  return r <= 0.25 ? 1 : r <= 0.5 ? 2 : r <= 0.75 ? 3 : 4;
}

export function ActivityGraph({ days, total }: { days: DayCount[]; total: number }) {
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);

  const onCellEnter = useCallback((e: React.MouseEvent, count: number, date: string) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTip({ text: `${count} solve${count !== 1 ? "s" : ""} on ${date}`, x: r.left + r.width / 2, y: r.top });
  }, []);

  const onCellLeave = useCallback(() => setTip(null), []);
  const onCellMove = useCallback((e: React.MouseEvent, count: number, date: string) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTip(prev => prev?.text.startsWith(`${count}`) ? { text: prev.text, x: r.left + r.width / 2, y: r.top } : prev ?? { text: `${count} solve${count !== 1 ? "s" : ""} on ${date}`, x: r.left + r.width / 2, y: r.top });
  }, []);

  const { weeks, maxCount } = useMemo(() => {
    if (!days.length) return { weeks: [], maxCount: 1 };
    const map = new Map<number, Map<number, DayCount>>();
    for (const d of days) {
      let w = map.get(d.weekIndex);
      if (!w) { w = new Map(); map.set(d.weekIndex, w); }
      w.set(d.dayOfWeek, d);
    }
    return {
      weeks: Array.from(map.keys()).sort((a, b) => a - b).map((wi) =>
        Array.from({ length: 7 }, (_, dow) => map.get(wi)!.get(dow) ?? null)
      ),
      maxCount: Math.max(...days.map((d) => d.count), 1),
    };
  }, [days]);

  const monthLabels = useMemo(() => {
    if (!weeks.length) return [];
    const out: { label: string; key: string; col: number }[] = [];
    let last = "";
    for (let ci = 0; ci < weeks.length; ci++) {
      const first = weeks[ci].find(Boolean);
      if (!first) continue;
      const d = new Date(first.date + "T00:00:00");
      const m = d.getMonth();
      const y = d.getFullYear();
      const mk = `${y}-${m}`;
      if (mk !== last) {
        out.push({ label: MONTHS[m], key: mk, col: ci });
        last = mk;
      }
    }
    return out;
  }, [weeks]);

  if (!weeks.length) return null;

  return (
    <div className="rounded-xl border border-border/20 bg-bg-elevated/20 p-3">
      {tip && (
        <div
          className="fixed z-50 pointer-events-none px-2 py-1 rounded-md text-xs bg-bg-elevated border border-border/30 text-secondary shadow-lg"
          style={{ left: tip.x, top: tip.y - 6, transform: "translate(-50%,-100%)" }}
        >
          {tip.text}
        </div>
      )}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-secondary/60">Activity</span>
        <span className="text-[10px] text-secondary/50">{total} solves in {days.length} days</span>
      </div>
      <div className="overflow-x-auto pb-0.5">
        <div className="inline-flex flex-col" style={{ gap: 2 }}>
          <div style={{ position: "relative", height: 14, paddingLeft: LABEL_W }}>
            {monthLabels.map((m) => (
              <span
                key={m.key}
                className="absolute top-0 text-[10px] text-secondary/50"
                style={{ left: m.col * STEP, lineHeight: "14px" }}
              >
                {m.label}
              </span>
            ))}
          </div>
          <div className="flex" style={{ gap: 2 }}>
            <div className="flex flex-col text-[10px] text-secondary/40" style={{ width: LABEL_W - 2, gap: G }}>
              {[0, 1, 2, 3, 4, 5, 6].map((dow) => (
                <div key={dow} style={{ height: S, lineHeight: `${S}px` }} className="truncate">
                  {dow === 1 ? "Mon" : dow === 3 ? "Wed" : dow === 5 ? "Fri" : "\u00A0"}
                </div>
              ))}
            </div>
            <div className="flex" style={{ gap: G }}>
              {weeks.map((col, ci) => (
                <div key={ci} className="flex flex-col" style={{ gap: G }}>
                  {col.map((day, dow) => {
                    const idx = day ? lvl(day.count, maxCount) : 0;
                    return (
                      <div
                        key={dow}
                        className="rounded-sm"
                        style={{ width: S, height: S, backgroundColor: LV[idx].bg, opacity: LV[idx].op, cursor: day && day.count > 0 ? "pointer" : "default" }}
                        onMouseEnter={day ? (e) => onCellEnter(e, day.count, day.date) : undefined}
                        onMouseMove={day ? (e) => onCellMove(e, day.count, day.date) : undefined}
                        onMouseLeave={day ? onCellLeave : undefined}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-0.5" style={{ paddingLeft: LABEL_W }}>
            <span className="text-[10px] text-secondary/40 leading-none">Less</span>
            {LV.map((_, i) => (
              <div key={i} className="rounded-sm" style={{ width: S, height: S, backgroundColor: LV[i].bg, opacity: LV[i].op }} />
            ))}
            <span className="text-[10px] text-secondary/40 leading-none">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
