import { FlashMessage } from "@/components/flash-message";
import { PlantCard } from "@/components/plant-card";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { createPhotoUrl } from "@/lib/photos";
import type { Plant, PlantWithLastWatered, WateringEvent } from "@/lib/types";
import { Plus, Sprout } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "My plants" };

export default async function PlantsPage() {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase.from("plants").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  const plants = (data ?? []) as Plant[];
  const ids = plants.map((plant) => plant.id);
  let events: Pick<WateringEvent, "plant_id" | "watered_at">[] = [];
  if (ids.length) {
    const result = await supabase.from("watering_events").select("plant_id, watered_at").in("plant_id", ids).order("watered_at", { ascending: false });
    events = result.data ?? [];
  }
  const latestByPlant = new Map<string, string>();
  for (const event of events) if (!latestByPlant.has(event.plant_id)) latestByPlant.set(event.plant_id, event.watered_at);
  const enriched: PlantWithLastWatered[] = await Promise.all(plants.map(async (plant) => ({ ...plant, lastWateredAt: latestByPlant.get(plant.id) ?? null, photoUrl: await createPhotoUrl(supabase, plant.photo_path) })));

  return (
    <>
      <FlashMessage fallbackError={error?.message} />
      <div className="mb-8 flex items-end justify-between gap-4">
        <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Your indoor garden</p><h1 className="text-4xl font-semibold sm:text-5xl">My plants</h1><p className="mt-2 text-sm text-muted-foreground">A quiet record of care, one watering at a time.</p></div>
        <Button asChild size="lg" className="h-11 shrink-0 rounded-xl"><Link href="/plants/new"><Plus /> <span className="hidden sm:inline">Add plant</span><span className="sm:hidden">Add</span></Link></Button>
      </div>
      {enriched.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{enriched.map((plant) => <PlantCard key={plant.id} plant={plant} />)}</div>
      ) : (
        <div className="rounded-[1.75rem] border border-dashed bg-card/65 px-6 py-16 text-center sm:py-24">
          <span className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-accent text-primary"><Sprout className="size-8" /></span>
          <h2 className="text-2xl font-semibold">Your garden is ready to grow</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Add your first plant to start keeping a complete watering history.</p>
          <Button asChild className="mt-6 h-11 rounded-xl"><Link href="/plants/new"><Plus /> Add your first plant</Link></Button>
        </div>
      )}
    </>
  );
}
