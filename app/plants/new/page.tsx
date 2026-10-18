import { createPlantAction } from "@/app/actions";
import { FlashMessage } from "@/components/flash-message";
import { PlantForm } from "@/components/plant-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Add plant" };

export default function NewPlantPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/plants" className="mb-7 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back to plants</Link>
      <div className="mb-8"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">New companion</p><h1 className="text-4xl font-semibold">Add a plant</h1><p className="mt-2 text-sm text-muted-foreground">A photo makes your garden easier to scan at a glance.</p></div>
      <FlashMessage />
      <div className="rounded-[1.5rem] border bg-card p-5 shadow-sm sm:p-8"><PlantForm action={createPlantAction} cancelHref="/plants" /></div>
    </div>
  );
}
