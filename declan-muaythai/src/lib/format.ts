/** Date/time helpers. All public-facing times are shown in the coach's timezone. */

export function fmtMoney(cents: number) {
  const dollars = cents / 100;
  return dollars % 1 === 0 ? `$${dollars.toFixed(0)}` : `$${dollars.toFixed(2)}`;
}

export function fmtTime(iso: string | Date, tz: string) {
  return new Intl.DateTimeFormat("en-AU", { hour: "numeric", minute: "2-digit", timeZone: tz })
    .format(new Date(iso))
    .replace(/\s?(am|pm)/i, (m) => m.trim().toLowerCase());
}

export function fmtDate(iso: string | Date, tz: string, opts: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: tz,
    ...opts,
  }).format(new Date(iso));
}

export function fmtDateLong(iso: string | Date, tz: string) {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: tz,
  }).format(new Date(iso));
}

export function fmtRange(startIso: string, endIso: string, tz: string) {
  return `${fmtTime(startIso, tz)} – ${fmtTime(endIso, tz)}`;
}

/** "YYYY-MM-DD" for an instant, in the given timezone. */
export function localDay(iso: string | Date, tz: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: tz,
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function todayLocal(tz: string) {
  return localDay(new Date(), tz);
}

/** Pretty label for a "YYYY-MM-DD" string without timezone drift. */
export function fmtDayString(day: string, opts: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }) {
  const [y, m, d] = day.split("-").map(Number);
  return new Intl.DateTimeFormat("en-AU", { ...opts, timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d, 12)));
}

export function addDays(day: string, n: number) {
  const [y, m, d] = day.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n, 12));
  return dt.toISOString().slice(0, 10);
}

export function monthOf(day: string) {
  return day.slice(0, 7);
}

export function addMonths(month: string, n: number) {
  const [y, m] = month.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + n, 1, 12));
  return dt.toISOString().slice(0, 7);
}

export function monthLabel(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en-AU", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, 1, 12)),
  );
}

/** Days of a month as "YYYY-MM-DD", plus leading blanks so the grid starts on Monday. */
export function monthGrid(month: string) {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1, 12));
  const daysInMonth = new Date(Date.UTC(y, m, 0, 12)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7; // Monday = 0
  const cells: (string | null)[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(`${month}-${String(d).padStart(2, "0")}`);
  return cells;
}

export function weekdayName(i: number, style: "long" | "short" = "long") {
  const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return style === "long" ? names[i] : names[i].slice(0, 3);
}

/** "HH:MM" (24h, from Postgres time) to "6:00am" */
export function fmtClock(t: string) {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")}${suffix}`;
}

export function partOfDay(iso: string, tz: string): "Morning" | "Afternoon" | "Evening" {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: tz }).format(new Date(iso)));
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

/** Google Calendar / .ics helpers */
function icsStamp(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function googleCalendarUrl(opts: { title: string; start: string; end: string; details?: string; location?: string }) {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${icsStamp(opts.start)}/${icsStamp(opts.end)}`,
    details: opts.details ?? "",
    location: opts.location ?? "",
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

export function icsFile(opts: { title: string; start: string; end: string; details?: string; location?: string; uid: string }) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Declan Woods Muay Thai Kickboxing//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${opts.uid}`,
    `DTSTAMP:${icsStamp(new Date().toISOString())}`,
    `DTSTART:${icsStamp(opts.start)}`,
    `DTEND:${icsStamp(opts.end)}`,
    `SUMMARY:${opts.title}`,
    `DESCRIPTION:${(opts.details ?? "").replace(/\n/g, "\\n")}`,
    `LOCATION:${opts.location ?? ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return "data:text/calendar;charset=utf-8," + encodeURIComponent(lines.join("\r\n"));
}
