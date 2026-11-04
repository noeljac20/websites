// Pure .ics builder for the coach calendar feed. No Deno or Node APIs, so it can be unit-tested anywhere.

export type FeedBooking = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  session_name: string;
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  experience: string | null;
  goals: string | null;
  notes: string | null;
  location: string | null;
  updated_at: string;
};

const EXPERIENCE: Record<string, string> = {
  never: "Never trained",
  beginner: "Beginner (under 6 months)",
  intermediate: "Intermediate",
  fighter: "Competing / fight prep",
};

/** RFC 5545 text escaping. Any line break becomes \n; other control characters (not allowed in TEXT) are dropped. */
export function esc(v: string): string {
  return v
    .replace(/\r\n|\r|\n/g, "\n")
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, String.fromCharCode(92) + ";")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** 20261106T070000Z */
export function stamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Fold lines longer than 75 octets (RFC 5545 3.1), never splitting a UTF-8 character. */
export function fold(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let cur = "";
  let curBytes = 0;
  for (const ch of line) {
    const b = enc.encode(ch).length;
    const limit = parts.length === 0 ? 75 : 74; // continuation lines start with a space
    if (curBytes + b > limit) {
      parts.push(cur);
      cur = "";
      curBytes = 0;
    }
    cur += ch;
    curBytes += b;
  }
  parts.push(cur);
  return parts.join("\r\n ");
}

export function buildCalendar(bookings: FeedBooking[], opts: { dashboardUrl: string; now?: Date }): string {
  const now = stamp((opts.now ?? new Date()).toISOString());
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Declan Woods Muay Thai Kickboxing//Coach feed//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Declan Woods bookings",
    "X-WR-TIMEZONE:Australia/Melbourne",
    "REFRESH-INTERVAL;VALUE=DURATION:PT15M",
    "X-PUBLISHED-TTL:PT15M",
  ];
  for (const b of bookings) {
    const pending = b.status === "pending";
    const completed = b.status === "completed";
    const summary = `${pending ? "Request: " : ""}${b.client_name}, ${b.session_name}`;
    const details = [
      pending ? "Awaiting your confirmation in the coach dashboard." : completed ? "Completed." : "Confirmed.",
      b.client_phone ? `Phone: ${b.client_phone}` : "",
      b.client_email ? `Email: ${b.client_email}` : "",
      b.experience ? `Experience: ${EXPERIENCE[b.experience] ?? b.experience}` : "",
      b.goals ? `Goals: ${b.goals}` : "",
      b.notes ? `Notes: ${b.notes}` : "",
      `Dashboard: ${opts.dashboardUrl}`,
    ].filter(Boolean).join("\n");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${b.id}@declan-woods-bookings`,
      `DTSTAMP:${now}`,
      `LAST-MODIFIED:${stamp(b.updated_at)}`,
      `DTSTART:${stamp(b.starts_at)}`,
      `DTEND:${stamp(b.ends_at)}`,
      `SUMMARY:${esc(summary)}`,
      `DESCRIPTION:${esc(details)}`,
      ...(b.location ? [`LOCATION:${esc(b.location)}`] : []),
      `URL:${opts.dashboardUrl}`,
      `STATUS:${pending ? "TENTATIVE" : "CONFIRMED"}`,
      "TRANSP:OPAQUE",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${esc(summary)}`,
      "TRIGGER:-PT1H",
      "END:VALARM",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
