import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function Home() {
  if (!hasEnvVars) redirect("/login");
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  redirect(data?.claims ? "/plants" : "/login");
}
