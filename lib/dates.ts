const TIME_ZONE = "Europe/Warsaw";

export function formatDateTime(value: string | Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: TIME_ZONE,
  }).format(new Date(value));
}

export function formatShortDate(value: string | Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(new Date(value));
}

export function relativeWateringTime(value: string | Date) {
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
  const days = Math.floor(elapsed / 86_400_000);
  if (days === 0) return "Watered today";
  if (days === 1) return "Watered yesterday";
  if (days < 30) return `Watered ${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "Watered 1 month ago";
  if (months < 12) return `Watered ${months} months ago`;
  const years = Math.floor(days / 365);
  return `Watered ${years} ${years === 1 ? "year" : "years"} ago`;
}

export function warsawLocalDateTimeToIso(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match;
  const desiredUtcShape = Date.UTC(+year, +month - 1, +day, +hour, +minute);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(desiredUtcShape));
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((item) => item.type === type)?.value);
  const displayedAsUtc = Date.UTC(part("year"), part("month") - 1, part("day"), part("hour"), part("minute"));
  const candidate = new Date(desiredUtcShape - (displayedAsUtc - desiredUtcShape));
  if (Number.isNaN(candidate.getTime())) return null;
  const roundTrip = new Intl.DateTimeFormat("sv-SE", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(candidate).replace(" ", "T");
  return roundTrip === value ? candidate.toISOString() : null;
}
