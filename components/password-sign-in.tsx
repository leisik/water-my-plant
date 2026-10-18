"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Leaf, LoaderCircle, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PasswordSignIn({ configured }: { configured: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    const { data: authorized } = await supabase.rpc("is_authorized_user");
    if (!authorized) {
      await supabase.auth.signOut();
      setError("This account is not authorized to access the garden.");
      setLoading(false);
      return;
    }
    router.replace("/plants");
    router.refresh();
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <span className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground"><Leaf /></span>
        <h1 className="text-balance text-4xl font-semibold">Welcome back to your garden</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Sign in with your private account. Your browser will keep you signed in.</p>
      </div>
      {!configured && <p role="alert" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Add your Supabase URL and publishable key to <code>.env.local</code> before signing in.</p>}
      <form onSubmit={signIn} className="space-y-5">
        <div className="space-y-2"><Label htmlFor="email">Email address</Label><Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" className="h-12 rounded-xl bg-white" /></div>
        <div className="space-y-2">
          <div className="flex items-center justify-between"><Label htmlFor="password">Password</Label><Link href="/auth/forgot-password" className="text-xs font-medium text-primary hover:underline">Forgot password?</Link></div>
          <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" className="h-12 rounded-xl bg-white" />
        </div>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <Button type="submit" className="h-12 w-full rounded-xl" disabled={!configured || loading}>{loading ? <LoaderCircle className="animate-spin" /> : <LockKeyhole />}{loading ? "Signing in…" : "Sign in"}</Button>
      </form>
      <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">No public sign-up. Only the allowlisted account can access plant data.</p>
    </div>
  );
}
