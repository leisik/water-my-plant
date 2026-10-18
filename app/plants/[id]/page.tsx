import { deleteWateringAction, waterNowAction } from "@/app/actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { FlashMessage } from "@/components/flash-message";
import { PastWateringForm } from "@/components/past-watering-form";
import { PlantPhoto } from "@/components/plant-photo";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { formatDateTime, relativeWateringTime } from "@/lib/dates";
import { createPhotoUrl } from "@/lib/photos";
import type { Plant, WateringEvent } from "@/lib/types";
import { ArrowLeft, Droplets, History, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PlantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("plants").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!data) notFound();
  const plant = data as Plant;
  const { data: history, error } = await supabase.from("watering_events").select("*").eq("plant_id", id).order("watered_at", { ascending: false });
  const events = (history ?? []) as WateringEvent[];
  const photoUrl = await createPhotoUrl(supabase, plant.photo_path);
  const waterAction = waterNowAction.bind(null, id);

  return (
    <>
      <Link href="/plants" className="mb-7 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back to plants</Link>
      <FlashMessage fallbackError={error?.message} />
      <section className="overflow-hidden rounded-[1.75rem] border bg-card shadow-[0_20px_55px_-38px_rgba(22,61,38,.65)] md:grid md:grid-cols-[1.1fr_.9fr]">
        <PlantPhoto src={photoUrl} alt={plant.name} className="aspect-[4/3] h-full min-h-72" />
        <div className="flex flex-col justify-center p-6 sm:p-9">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Plant journal</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">{plant.name}</h1>
          <div className="mt-4 text-sm">{events[0] ? <><p className="font-semibold text-primary">{relativeWateringTime(events[0].watered_at)}</p><p className="mt-1 text-muted-foreground">{formatDateTime(events[0].watered_at)}</p></> : <p className="text-muted-foreground">Not watered yet</p>}</div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <form action={waterAction} className="flex-1"><SubmitButton className="h-12 w-full rounded-xl" pendingLabel="Recording…"><Droplets /> Water now</SubmitButton></form>
            <Button asChild variant="outline" className="h-12 rounded-xl"><Link href={`/plants/${id}/edit`}><Pencil /> Edit</Link></Button>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-3xl">
        <div className="mb-5 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-accent text-primary"><History className="size-5" /></span><div><h2 className="text-2xl font-semibold">Watering history</h2><p className="text-sm text-muted-foreground">{events.length} {events.length === 1 ? "watering" : "waterings"} recorded</p></div></div>
        <PastWateringForm plantId={id} />
        {events.length ? (
          <ol className="mt-5 overflow-hidden rounded-2xl border bg-card">
            {events.map((event, index) => (
              <li key={event.id} className="flex items-center gap-4 border-b px-4 py-4 last:border-0 sm:px-5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-primary"><Droplets className="size-4" /></span>
                <div className="min-w-0 flex-1"><p className="font-medium">{formatDateTime(event.watered_at)}</p>{index === 0 && <p className="text-xs font-medium text-primary">Most recent</p>}</div>
                <form action={deleteWateringAction.bind(null, id, event.id)}><ConfirmSubmitButton variant="ghost" size="icon" message="Delete this watering event? This cannot be undone." aria-label={`Delete watering from ${formatDateTime(event.watered_at)}`}><Trash2 className="text-muted-foreground" /></ConfirmSubmitButton></form>
              </li>
            ))}
          </ol>
        ) : <div className="mt-5 rounded-2xl border border-dashed bg-card/60 px-5 py-10 text-center text-sm text-muted-foreground">No waterings recorded yet. Use “Water now” or add a past watering above.</div>}
      </section>
    </>
  );
}
