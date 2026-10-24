import { waterNowAction } from "@/app/actions";
import { PlantPhoto } from "@/components/plant-photo";
import { SubmitButton } from "@/components/submit-button";
import { WateringDayButton } from "@/components/watering-day-button";
import { recentWateringDays, warsawDateKey } from "@/lib/dates";
import type { Plant, WateringEvent } from "@/lib/types";
import { Droplets } from "lucide-react";
import Link from "next/link";

export function PlantWateringList({ plants, events, days, historyUnavailable }: {
  plants: (Plant & { photoUrl: string | null })[];
  events: Pick<WateringEvent, "plant_id" | "watered_at">[];
  days: ReturnType<typeof recentWateringDays>;
  historyUnavailable: boolean;
}) {
  const wateredDays = new Map<string, Set<string>>();
  for (const event of events) {
    const dates = wateredDays.get(event.plant_id) ?? new Set<string>();
    dates.add(warsawDateKey(event.watered_at));
    wateredDays.set(event.plant_id, dates);
  }

  return (
    <section aria-label="Plant watering history" className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 text-xs text-muted-foreground">
        <p>Last 10 days · today first</p>
        <p><span className="font-bold text-primary">✓</span> Watered <span className="ml-3 font-bold">✗</span> Not watered</p>
      </div>
      <div role="region" aria-label="Watering table, scroll horizontally to see all days" tabIndex={0} className="relative overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <caption className="sr-only">Daily watering history in Europe/Warsaw, newest day first. Open a plant for its full history.</caption>
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th scope="col" className="sticky left-0 z-20 w-[172px] min-w-[172px] border-b bg-muted px-3 py-4 text-left font-medium">Plant</th>
              {days.map((day, index) => (
                <th key={day.key} scope="col" className={`min-w-11 border-b px-2 py-3 text-center font-medium ${index === 0 ? "bg-accent text-accent-foreground" : "bg-muted/50"}`}>
                  <span className="sr-only">{day.label}{index === 0 ? ", today" : ""}</span>
                  <span aria-hidden="true" className="block uppercase">{day.weekday}</span>
                  <span aria-hidden="true" className="mt-1 block text-base font-semibold tabular-nums">{day.day}</span>
                </th>
              ))}
              <th scope="col" className="border-b bg-muted/50 px-3"><span className="sr-only">Record watering</span></th>
            </tr>
          </thead>
          <tbody>
            {plants.map((plant) => (
              <tr key={plant.id} className="group">
                <th scope="row" className="sticky left-0 z-10 border-b bg-card px-3 py-4 text-left font-medium group-last:border-b-0">
                  <Link href={`/plants/${plant.id}`} className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <span className="block size-10 shrink-0 overflow-hidden rounded-lg [&_svg]:size-5">
                      <PlantPhoto src={plant.photoUrl} alt="" className="h-10 w-10" />
                    </span>
                    <span title={plant.name} className="block w-[100px] max-w-[100px] truncate leading-5">{plant.name}</span>
                  </Link>
                </th>
                {historyUnavailable ? (
                  <td colSpan={days.length} className="border-b px-4 text-center text-muted-foreground group-last:border-b-0">Watering history unavailable</td>
                ) : days.map((day, index) => {
                  const watered = wateredDays.get(plant.id)?.has(day.key) ?? false;
                  return (
                    <td key={day.key} className={`border-b text-center group-last:border-b-0 ${index === 0 ? "bg-accent/30" : ""}`}>
                      <WateringDayButton plantId={plant.id} plantName={plant.name} date={day.key} dateLabel={day.label} watered={watered} />
                    </td>
                  );
                })}
                <td className="border-b px-3 group-last:border-b-0">
                  <form action={waterNowAction.bind(null, plant.id)}>
                    <SubmitButton variant="outline" size="sm" className="whitespace-nowrap rounded-lg" pendingLabel="Recording…" aria-label={`Water ${plant.name} now`}><Droplets aria-hidden="true" /> Water now</SubmitButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t px-4 py-3 text-xs text-muted-foreground">Hold any ✗ to record watering for that day. With a keyboard, focus it and press Enter or Space. Scroll sideways to see all days.</p>
    </section>
  );
}
