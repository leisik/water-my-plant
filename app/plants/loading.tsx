export default function Loading() {
  return <div className="animate-pulse"><div className="mb-8 h-12 w-56 rounded-xl bg-muted" /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="overflow-hidden rounded-3xl border bg-card"><div className="aspect-[5/4] bg-muted" /><div className="space-y-3 p-5"><div className="h-7 w-2/3 rounded bg-muted" /><div className="h-4 w-1/2 rounded bg-muted" /><div className="h-11 rounded-xl bg-muted" /></div></div>)}</div></div>;
}
