"use client";

import { Camera, X } from "lucide-react";
import { useEffect, useState } from "react";

export function PhotoInput({ currentUrl }: { currentUrl?: string | null }) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [selected, setSelected] = useState(false);

  useEffect(() => () => { if (selected && preview) URL.revokeObjectURL(preview); }, [preview, selected]);

  return (
    <div className="space-y-3">
      <label htmlFor="photo" className="block text-sm font-medium">Plant photo <span className="font-normal text-muted-foreground">(optional)</span></label>
      {preview ? (
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Selected plant preview" className="h-full w-full object-cover" />
          <button type="button" onClick={() => { setPreview(null); setSelected(false); const input = document.getElementById("photo") as HTMLInputElement | null; if (input) input.value = ""; }} className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/60 text-white" aria-label="Clear selected photo"><X className="size-4" /></button>
        </div>
      ) : (
        <label htmlFor="photo" className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-primary/30 bg-accent/35 text-center text-sm text-muted-foreground transition hover:bg-accent/60">
          <span className="grid size-12 place-items-center rounded-full bg-card text-primary shadow-sm"><Camera /></span>
          <span><strong className="font-medium text-foreground">Choose a photo</strong><br />JPG, PNG or WebP · max 5 MB</span>
        </label>
      )}
      <input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) { setPreview(URL.createObjectURL(file)); setSelected(true); } }} />
    </div>
  );
}
