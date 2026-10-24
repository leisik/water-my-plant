import { deletePlantAction, updatePlantAction } from "@/app/actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { FlashMessage } from "@/components/flash-message";
import { PlantForm } from "@/components/plant-form";
import { requireUser } from "@/lib/auth";
import { createPhotoUrl } from "@/lib/photos";
import type { Plant } from "@/lib/types";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata = { title: "Edit plant" };

export default async function EditPlantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("plants").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!data) notFound();
  const plant = data as Plant;
  const photoUrl = await createPhotoUrl(supabase, plant.photo_path);
  return (
    <div className="mx-auto max-w-2xl">
      <Link href={`/plants/${id}`} className="mb-7 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back to {plant.name}</Link>
      <div className="mb-8"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Plant settings</p><h1 className="text-4xl font-semibold">Edit {plant.name}</h1></div>
      <FlashMessage />
      <div className="rounded-[1.5rem] border bg-card p-5 shadow-sm sm:p-8"><PlantForm action={updatePlantAction.bind(null, id)} name={plant.name} photoUrl={photoUrl} cancelHref={`/plants/${id}`} /></div>
      <div className="mt-8 rounded-2xl border border-red-200 bg-red-50/70 p-5 dark:border-red-900 dark:bg-red-950/30"><h2 className="font-sans text-sm font-semibold text-red-900 dark:text-red-200">Delete plant</h2><p className="mt-1 text-sm leading-6 text-red-800/80 dark:text-red-200/80">This permanently removes the plant, its photo, and every watering event.</p><form action={deletePlantAction.bind(null, id)} className="mt-4"><ConfirmSubmitButton variant="destructive" title="Delete plant?" message={`Delete ${plant.name}, its photo, and all watering history? This cannot be undone.`}><Trash2 /> Delete plant</ConfirmSubmitButton></form></div>
    </div>
  );
}
