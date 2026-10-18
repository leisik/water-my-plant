"use client";

import { ImageOff, Sprout } from "lucide-react";
import { useState } from "react";

export function PlantPhoto({ src, alt, className = "aspect-[4/3]" }: { src: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div className={`${className} grid w-full place-items-center bg-gradient-to-br from-[#dce8d9] to-[#f1ead9] text-primary/60`}><Sprout className="size-14" aria-hidden="true" /><span className="sr-only">No photo for {alt}</span></div>;
  }
  return (
    <div className={`${className} relative w-full overflow-hidden bg-muted`}>
      {/* Private Supabase signed URLs are short-lived and cannot be safely preconfigured for next/image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-cover" onError={() => setFailed(true)} />
      <span className="sr-only"><ImageOff />Image unavailable</span>
    </div>
  );
}
