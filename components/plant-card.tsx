import { waterNowAction } from "@/app/actions";
import { PlantPhoto } from "@/components/plant-photo";
import { SubmitButton } from "@/components/submit-button";
import { formatShortDate, relativeWateringTime } from "@/lib/dates";
import type { PlantWithLastWatered } from "@/lib/types";
import { Droplets } from "lucide-react";
import Link from "next/link";

export function PlantCard({ plant }: { plant: PlantWithLastWatered }) {
  const action = waterNowAction.bind(null, plant.id);
  return (
    <article className="group overflow-hidden rounded-[1.4rem] border bg-card shadow-[0_10px_35px_-24px_rgba(22,61,38,.5)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_-24px_rgba(22,61,38,.55)]">
      <Link href={`/plants/${plant.id}`} className="block overflow-hidden">
        <PlantPhoto src={plant.photoUrl} alt={plant.name} className="aspect-[5/4] transition duration-500 group-hover:scale-[1.02]" />
      </Link>
      <div className="p-5">
        <Link href={`/plants/${plant.id}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <h2 className="text-2xl font-semibold leading-tight">{plant.name}</h2>
        </Link>
        <div className="mb-5 mt-2 min-h-10 text-sm">
          {plant.lastWateredAt ? <><p className="font-medium text-primary">{relativeWateringTime(plant.lastWateredAt)}</p><p className="text-muted-foreground">{formatShortDate(plant.lastWateredAt)}</p></> : <p className="text-muted-foreground">Not watered yet</p>}
        </div>
        <form action={action}>
          <SubmitButton className="h-11 w-full rounded-xl" pendingLabel="Recording…"><Droplets /> Water now</SubmitButton>
        </form>
      </div>
    </article>
  );
}
