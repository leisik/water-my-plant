import { PhotoInput } from "@/components/photo-input";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export function PlantForm({ action, name = "", photoUrl, cancelHref }: { action: (formData: FormData) => void | Promise<void>; name?: string; photoUrl?: string | null; cancelHref: string }) {
  return (
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Plant name</Label>
        <Input id="name" name="name" defaultValue={name} maxLength={80} required autoFocus placeholder="e.g. Monstera" className="h-12 rounded-xl bg-card" />
      </div>
      <PhotoInput currentUrl={photoUrl} />
      {photoUrl && (
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" name="remove_photo" className="size-4 rounded border-input accent-primary" /> Remove current photo without replacing it
        </label>
      )}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href={cancelHref} className="inline-flex h-11 items-center justify-center rounded-xl border bg-card px-5 text-sm font-medium transition hover:bg-accent">Cancel</Link>
        <SubmitButton size="lg" className="h-11 rounded-xl" pendingLabel="Saving plant…">Save plant</SubmitButton>
      </div>
    </form>
  );
}
