import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { Spinner, EmptyState, Button } from "@/components/ui";
import { coachFetchBookings, coachFetchClients, type Booking, type Settings } from "@/lib/booking";
import { fmtMoney, fmtTime, localDay, todayLocal, addDays } from "@/lib/format";
import { useLoad, PageHeader, StatusBadge } from "./shared";
import { BookingRow } from "./Schedule";

export function Overview({ settings, onGo }: { settings: Settings; onGo: (tab: string) => void }) {
  const tz = settings.timezone;
  const today = todayLocal(tz);
  const bookings = useLoad(() => coachFetchBookings({ from: new Date(Date.now() - 14 * 864e5).toISOString() }), []);
  const clients = useLoad(() => coachFetchClients(), []);

  const stats = useMemo(() => {
    const all = [...(bookings.data ?? [])].sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    const todays = all.filter((b) => localDay(b.starts_at, tz) === today && b.status !== "cancelled");
    const pending = all.filter((b) => b.status === "pending" && new Date(b.starts_at) > new Date());
    const weekStart = addDays(today, -((new Date(today + "T12:00:00Z").getUTCDay() + 6) % 7));
    const weekEnd = addDays(weekStart, 7);
    const week = all.filter((b) => {
      const d = localDay(b.starts_at, tz);
      return d >= weekStart && d < weekEnd && (b.status === "confirmed" || b.status === "completed");
    });
    const revenue = week.reduce((s, b) => s + b.price_cents, 0);
    return { todays, pending, week, revenue };
  }, [bookings.data, today, tz]);

  if (bookings.loading && !bookings.data) {
    return (
      <div className="flex items-center gap-3 text-fog">
        <Spinner /> Loading…
      </div>
    );
  }

  const tiles = [
    { label: "Sessions today", value: String(stats.todays.length) },
    { label: "Awaiting confirmation", value: String(stats.pending.length), tone: stats.pending.length ? "text-amber" : "" },
    { label: "This week (booked)", value: fmtMoney(stats.revenue), sub: `${stats.week.length} sessions` },
    { label: "Clients", value: String(clients.data?.length ?? "–") },
  ];

  return (
    <>
      <PageHeader title="Today" sub={new Intl.DateTimeFormat("en-AU", { weekday: "long", day: "numeric", month: "long", timeZone: tz }).format(new Date())} />

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="card p-4 sm:p-5">
            <dt className="label-caps">{t.label}</dt>
            <dd className={`display-md mt-2 text-[28px] text-cream ${t.tone ?? ""}`}>{t.value}</dd>
            {t.sub && <p className="text-[12px] text-mute">{t.sub}</p>}
          </div>
        ))}
      </dl>

      {stats.pending.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="display-md text-[19px] text-cream">Needs a reply</h2>
            <Button variant="ghost" size="sm" onClick={() => onGo("schedule")}>
              All bookings <ArrowRight className="size-4" />
            </Button>
          </div>
          <ul className="flex flex-col gap-2">
            {stats.pending.slice(0, 5).map((b) => (
              <BookingRow key={b.id} booking={b} tz={tz} onChange={bookings.reload} />
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="display-md mb-3 text-[19px] text-cream">Today's sessions</h2>
        {stats.todays.length === 0 ? (
          <EmptyState title="Nothing booked today" body="Enjoy the rest day, or add a walk-in from the Schedule tab." action={<Button variant="soft" size="sm" onClick={() => onGo("schedule")}>Open schedule</Button>} />
        ) : (
          <ul className="flex flex-col gap-2">
            {stats.todays.map((b: Booking) => (
              <li key={b.id} className="card-2 flex items-center justify-between gap-4 px-4 py-3">
                <div className="flex items-center gap-4">
                  <span className="tnum display-md w-[72px] text-[18px] text-cream">{fmtTime(b.starts_at, tz)}</span>
                  <div>
                    <p className="font-semibold text-cream">{b.client_name}</p>
                    <p className="text-[13px] text-fog">{b.session_name}</p>
                  </div>
                </div>
                <StatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
