"use client";

import { addPastWateringAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMemo } from "react";

function warsawValue(date: Date) {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
  return parts.replace(" ", "T");
}

export function PastWateringForm({ plantId }: { plantId: string }) {
  const action = addPastWateringAction.bind(null, plantId);
  const now = useMemo(() => new Date(), []);
  return (
    <form action={action} className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-end">
      <div className="min-w-0 flex-1 space-y-2">
        <Label htmlFor="watered_at">Add a past watering</Label>
        <Input id="watered_at" name="watered_at" type="datetime-local" required max={warsawValue(now)} className="h-11 rounded-xl" />
      </div>
      <SubmitButton variant="secondary" className="h-11 rounded-xl" pendingLabel="Adding…">Add watering</SubmitButton>
    </form>
  );
}
