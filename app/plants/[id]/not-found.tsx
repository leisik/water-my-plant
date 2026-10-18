import { Button } from "@/components/ui/button";
import { Sprout } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return <div className="rounded-3xl border border-dashed bg-card/70 px-6 py-20 text-center"><Sprout className="mx-auto mb-4 size-12 text-primary" /><h1 className="text-3xl font-semibold">Plant not found</h1><p className="mt-2 text-sm text-muted-foreground">It may have been deleted, or the link is incorrect.</p><Button asChild className="mt-6"><Link href="/plants">Return to my plants</Link></Button></div>;
}
