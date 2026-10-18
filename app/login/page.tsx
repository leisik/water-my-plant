import { PasswordSignIn } from "@/components/password-sign-in";
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";
import { redirect } from "next/navigation";
import { FlashMessage } from "@/components/flash-message";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (hasEnvVars) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (data?.claims) redirect("/plants");
  }
  return <main className="grid min-h-screen place-items-center px-5 py-12"><div className="w-full max-w-md rounded-[1.75rem] border bg-card/90 p-7 shadow-[0_22px_60px_-35px_rgba(22,61,38,.6)] sm:p-10"><FlashMessage /><PasswordSignIn configured={Boolean(hasEnvVars)} /></div></main>;
}
