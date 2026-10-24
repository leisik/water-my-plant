import { recentWateringMonths, warsawDateKey } from "@/lib/dates";
import type { WateringEvent } from "@/lib/types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WateringCalendar({ events }: { events: Pick<WateringEvent, "watered_at">[] }) {
  const months = recentWateringMonths();
  const waterings = new Map<string, number>();
  for (const event of events) {
    const key = warsawDateKey(event.watered_at);
    waterings.set(key, (waterings.get(key) ?? 0) + 1);
  }

  return (
    <div className="mb-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>This month and the previous two months · Europe/Warsaw</p>
        <p><span className="font-bold text-primary">✓</span> Watered <span className="ml-3 font-bold">✗</span> Not watered</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {months.map((month) => (
          <div key={month.key} className="rounded-2xl border bg-card p-3 sm:p-4">
            <table className="w-full table-fixed border-separate border-spacing-1 text-center text-xs">
              <caption className="pb-4 text-left font-sans text-base font-semibold">{month.label}</caption>
              <thead><tr>{WEEKDAYS.map((day) => <th key={day} scope="col" className="pb-2 font-medium text-muted-foreground">{day}</th>)}</tr></thead>
              <tbody>
                {month.weeks.map((week, weekIndex) => (
                  <tr key={weekIndex}>
                    {week.map((day, dayIndex) => {
                      if (!day) return <td key={`empty-${dayIndex}`} className="h-12" />;
                      const count = waterings.get(day.key) ?? 0;
                      const status = day.isFuture ? "Future date" : count ? `Watered (${count} ${count === 1 ? "record" : "records"})` : "Not watered";
                      return (
                        <td key={day.key} aria-current={day.isToday ? "date" : undefined} className={`h-12 rounded-lg ${day.isToday ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : ""} ${day.isFuture ? "text-muted-foreground/50" : count ? "bg-accent/60 text-primary" : "bg-muted/40 text-muted-foreground"}`}>
                          <span className="sr-only">{day.label}{day.isToday ? ", today" : ""}: {status}</span>
                          <span aria-hidden="true" className="block text-[11px] tabular-nums">{day.day}</span>
                          <span aria-hidden="true" className="block text-lg font-bold leading-5">{day.isFuture ? "–" : count ? "✓" : "✗"}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
