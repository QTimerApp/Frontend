import type { DayCount } from "@/types/stats";

function ActivityCell({ count, maxCount }: { count: number; maxCount: number }) {
  const intensity = maxCount > 0 ? count / maxCount : 0;
  const bg = count === 0
    ? "bg-bg-elevated/20"
    : intensity > 0.66
      ? "bg-accent"
      : intensity > 0.33
        ? "bg-accent/60"
        : "bg-accent/30";
  return (
    <div
      className={`size-2.5 rounded-sm ${bg}`}
      title={`${count} solves`}
    />
  );
}

export function ActivityCalendar({ days }: { days: DayCount[] }) {
  const maxCount = Math.max(...days.map((d) => d.count), 1);
  const weeks: DayCount[][] = [];
  let currentWeek: DayCount[] = [];
  let lastWeek = days[0]?.weekIndex ?? 0;
  for (const day of days) {
    if (day.weekIndex !== lastWeek) {
      if (currentWeek.length) weeks.push(currentWeek);
      currentWeek = [];
      lastWeek = day.weekIndex;
    }
    currentWeek.push(day);
  }
  if (currentWeek.length) weeks.push(currentWeek);

  const monthLabels: { label: string; weekIndex: number }[] = [];
  for (const day of days) {
    const ym = day.date.slice(0, 7);
    const prev = monthLabels[monthLabels.length - 1];
    if (!prev || ym !== prev.label) {
      monthLabels.push({ label: ym, weekIndex: day.weekIndex });
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex gap-px">
        {monthLabels.map((m, i) => {
          const weekCount = weeks.filter((w) => w[0]?.weekIndex >= m.weekIndex && w[0]?.weekIndex < (monthLabels[i + 1]?.weekIndex ?? Infinity)).length;
          return (
            <span key={m.label} className="text-[8px] text-muted/60" style={{ width: weekCount * 11 }}>
              {["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(m.label.slice(5, 7))]}
            </span>
          );
        })}
      </div>
      <div className="flex gap-px">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-px">
            {Array.from({ length: 7 }, (_, di) => {
              const day = week.find((d) => d.dayOfWeek === di);
              return <ActivityCell key={di} count={day?.count ?? 0} maxCount={maxCount} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
