import { ClearFlashCookie } from "@/components/clear-flash-cookie";
import { readFlashMessage } from "@/lib/flash";
import { CheckCircle2, CircleAlert } from "lucide-react";

export async function FlashMessage({ fallbackError }: { fallbackError?: string }) {
  const flash = await readFlashMessage();
  const message = flash?.message ?? fallbackError;
  if (!message) return null;
  const isError = flash ? flash.type === "error" : true;
  return (
    <div role={isError ? "alert" : "status"} className={`mb-6 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${isError ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200" : "border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200"}`}>
      {isError ? <CircleAlert className="mt-0.5 size-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0" />}
      <p>{message}</p>
      {flash && <ClearFlashCookie />}
    </div>
  );
}
