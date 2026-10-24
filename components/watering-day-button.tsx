"use client";

import { recordWateringDayAction } from "@/app/actions";
import { LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const HOLD_DURATION = 600;

export function WateringDayButton({ plantId, plantName, date, dateLabel, watered }: {
  plantId: string;
  plantName: string;
  date: string;
  dateLabel: string;
  watered: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [holding, setHolding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const busy = useRef(false);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function cancelHold() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    origin.current = null;
    setHolding(false);
  }

  async function recordWatering() {
    if (busy.current || watered || saved) return;
    busy.current = true;
    setPending(true);
    setError(null);
    try {
      const result = await recordWateringDayAction(plantId, date);
      if (result.error) setError(result.error);
      else setSaved(true);
    } catch {
      setError("Unable to save watering. Please try again.");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  if (watered || saved) {
    return <span role="status"><span aria-hidden="true" className="text-2xl font-bold text-primary">✓</span><span className="sr-only">{plantName}, {dateLabel}: Watered</span></span>;
  }

  return (
    <div className="relative">
      <button
        type="button"
        disabled={pending}
        aria-label={`Record watering for ${plantName} on ${dateLabel}. Hold to water, or press Enter or Space.`}
        aria-busy={pending}
        title={error ?? `Hold to water ${plantName} on ${dateLabel}`}
        className={`relative mx-auto grid size-11 touch-auto select-none place-items-center overflow-hidden rounded-lg text-2xl font-bold text-muted-foreground/70 [-webkit-touch-callout:none] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait ${holding ? "bg-accent text-primary" : "hover:bg-accent/50"}`}
        onPointerDown={(event) => {
          if (event.button !== 0 || !event.isPrimary || busy.current) return;
          cancelHold();
          event.currentTarget.setPointerCapture(event.pointerId);
          origin.current = { x: event.clientX, y: event.clientY };
          setHolding(true);
          timer.current = setTimeout(() => {
            cancelHold();
            void recordWatering();
          }, HOLD_DURATION);
        }}
        onPointerMove={(event) => {
          if (origin.current && Math.hypot(event.clientX - origin.current.x, event.clientY - origin.current.y) > 10) cancelHold();
        }}
        onPointerUp={cancelHold}
        onPointerCancel={cancelHold}
        onLostPointerCapture={cancelHold}
        onBlur={cancelHold}
        onKeyDown={(event) => { if (event.key === "Escape") cancelHold(); }}
        onContextMenu={(event) => event.preventDefault()}
        onClick={(event) => {
          // Native keyboard and assistive-technology clicks have no pointer click count.
          if (event.detail === 0) { cancelHold(); void recordWatering(); }
        }}
      >
        {holding && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 origin-left animate-[watering-hold_600ms_linear_forwards] bg-primary" />}
        {pending ? <LoaderCircle aria-hidden="true" className="size-5 animate-spin" /> : <span aria-hidden="true">✗</span>}
      </button>
      {error && <p role="alert" className="absolute bottom-full left-1/2 z-30 mb-1 w-44 -translate-x-1/2 rounded-lg border bg-card p-2 text-xs font-normal text-destructive shadow-md dark:text-red-300">{error}</p>}
    </div>
  );
}
