import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import { setFlashMessage } from "@/lib/flash";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/plants";
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: authorized } = await supabase.rpc("is_authorized_user");
      if (!authorized) {
        await supabase.auth.signOut();
        await setFlashMessage("error", "This account is not authorized.");
        return NextResponse.redirect(new URL("/login", url.origin));
      }
      const forwardedHost = request.headers.get("x-forwarded-host");
      const origin = process.env.NODE_ENV === "development" || !forwardedHost
        ? url.origin
        : `https://${forwardedHost}`;
      return NextResponse.redirect(new URL(safeNext, origin));
    }
  }
  await setFlashMessage("error", "Unable to verify the sign-in link.");
  return NextResponse.redirect(new URL("/login", url.origin));
}
