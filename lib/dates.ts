const TIME_ZONE = "Europe/Warsaw";

export function warsawDateKey(value: string | Date) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function recentWateringDays(now: Date = new Date()) {
  // Subtract calendar days from the Warsaw date, including across DST changes.
  const today = new Date(`${warsawDateKey(now)}T12:00:00Z`);
  return Array.from({ length: 10 }, (_, index) => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - index);
    return {
      key: warsawDateKey(date),
      weekday: new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, weekday: "short" }).format(date),
      day: new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, day: "numeric" }).format(date),
      label: formatShortDate(date),
    };
  });
}

export function recentWateringMonths(now: Date = new Date()) {
  const today = warsawDateKey(now);
  const [year, month] = today.split("-").map(Number);
  return Array.from({ length: 3 }, (_, index) => {
    const start = new Date(Date.UTC(year, month - 1 - index, 1, 12));
    const offset = (start.getUTCDay() + 6) % 7; // Monday first.
    const daysInMonth = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0)).getUTCDate();
    const cells = Array.from({ length: 42 }, (_, cell) => {
      const day = cell - offset + 1;
      if (day < 1 || day > daysInMonth) return null;
      const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), day, 12));
      const key = warsawDateKey(date);
      return { key, day, label: formatShortDate(date), isToday: key === today, isFuture: key > today };
    });
    return {
      key: start.toISOString().slice(0, 7),
      label: new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, month: "long", year: "numeric" }).format(start),
      weeks: Array.from({ length: 6 }, (_, week) => cells.slice(week * 7, week * 7 + 7)),
    };
  });
}

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
