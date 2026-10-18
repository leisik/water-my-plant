import { signOutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Leaf, LogOut } from "lucide-react";
import Link from "next/link";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/plants" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground"><Leaf className="size-4" /></span>
            <span>Water My Plant</span>
          </Link>
          <form action={signOutAction}>
            <Button variant="ghost" size="sm"><LogOut aria-hidden="true" /> Sign out</Button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>
      <footer className="mx-auto max-w-6xl px-4 pb-8 text-center text-xs text-muted-foreground sm:px-6">Dates and times are shown in Europe/Warsaw.</footer>
    </div>
  );
}
