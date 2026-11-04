import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { CalendarPlus, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Badge, Button, Dialog, Spinner, STATUS_LABEL } from "@/components/ui";
import { site } from "@/lib/site";
import { cancelBookingByToken, DEFAULT_SETTINGS, fetchSettings, getBookingByToken, type PublicBooking, type Settings } from "@/lib/booking";
import { fmtDateLong, fmtMoney, fmtRange, googleCalendarUrl, icsFile } from "@/lib/format";
import { errorMessage } from "@/lib/utils";

export function ManageBookingPage() {
  const { token } = useParams({ from: "/booking/$token" });
  const [booking, setBooking] = useState<PublicBooking | null | undefined>(undefined);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = `Your booking — ${site.name}`;
    fetchSettings().then(setSettings).catch(() => {});
    getBookingByToken(token)
      .then(setBooking)
      .catch(() => setBooking(null));
  }, [token]);

  async function cancel() {
    setBusy(true);
    try {
      const b = await cancelBookingByToken(token);
      setBooking(b);
      setConfirmOpen(false);
      toast.success("Booking cancelled.");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const tz = settings.timezone;
  const upcoming = booking && new Date(booking.starts_at) > new Date();
  const cancellable = booking && upcoming && (booking.status === "pending" || booking.status === "confirmed");

  return (
    <>
      <Nav solid />
      <main className="mx-auto min-h-dvh max-w-2xl px-4 pb-24 pt-28 sm:px-6">
        {booking === undefined && (
          <div className="flex items-center gap-3 text-fog">
            <Spinner /> Loading your booking…
          </div>
        )}
        {booking === null && (
          <div className="card p-8 text-center">
            <h1 className="display text-[30px] text-cream">Booking not found</h1>
            <p className="mt-3 text-fog">That link doesn't match a booking. Check the link in your confirmation email.</p>
            <Link to="/book" className="btn btn-primary mt-6">
              Make a booking
            </Link>
          </div>
        )}
        {booking && (
          <div className="card animate-rise p-6 sm:p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Your booking</p>
                <h1 className="display mt-2 text-[clamp(1.85rem,3.4vw,2.6rem)] text-cream">{booking.session_name}</h1>
              </div>
              <Badge tone={booking.status}>{STATUS_LABEL[booking.status]}</Badge>
            </div>
            <p className="mt-3 text-[15px] text-fog">
              {booking.status === "pending" && `Waiting on ${site.coach} to confirm. ${site.bookingNotice}`}
              {booking.status === "confirmed" && "Confirmed. See you there."}
              {booking.status === "cancelled" && "This booking has been cancelled."}
              {booking.status === "completed" && "Done and dusted. Book the next one below."}
              {booking.status === "no_show" && "Marked as a no-show. Message Declan if that's wrong."}
            </p>

            <dl className="mt-8 grid gap-4 rounded-xl bg-ink-2 p-5 sm:grid-cols-2">
              <div>
                <dt className="label-caps">When</dt>
                <dd className="mt-1 font-semibold text-cream">
                  {fmtDateLong(booking.starts_at, tz)}
                  <br />
                  <span className="tnum font-medium text-fog">{fmtRange(booking.starts_at, booking.ends_at, tz)}</span>
                </dd>
              </div>
              <div>
                <dt className="label-caps">Where</dt>
                <dd className="mt-1 flex items-start gap-1.5 font-semibold text-cream">
                  <MapPin className="mt-1 size-4 shrink-0 text-mute" /> {settings.location}
                </dd>
              </div>
              <div>
                <dt className="label-caps">Name</dt>
                <dd className="mt-1 font-semibold text-cream">{booking.client_name}</dd>
              </div>
              <div>
                <dt className="label-caps">Price</dt>
                <dd className="mt-1 font-semibold text-cream">{fmtMoney(booking.price_cents)} · pay on the day</dd>
              </div>
            </dl>

            {upcoming && booking.status !== "cancelled" && (
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={googleCalendarUrl({ title: `Muay Thai with ${site.coach}`, start: booking.starts_at, end: booking.ends_at, location: settings.location })}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-soft btn-sm"
                >
                  <CalendarPlus className="size-4" /> Google Calendar
                </a>
                <a
                  href={icsFile({ title: `Muay Thai with ${site.coach}`, start: booking.starts_at, end: booking.ends_at, location: settings.location, uid: booking.id })}
                  download="declan-muay-thai.ics"
                  className="btn btn-soft btn-sm"
                >
                  <CalendarPlus className="size-4" /> Apple / Outlook
                </a>
              </div>
            )}

            <div className="mt-10 flex flex-col gap-3 hairline-t pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Link to="/book" className="btn btn-primary">
                {booking.status === "cancelled" || booking.status === "completed" ? "Book a session" : "Book another"}
              </Link>
              {cancellable && (
                <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                  Cancel this booking
                </Button>
              )}
            </div>
            <p className="mt-4 text-[13px] text-mute">
              Need to move it instead? Cancel here and book a new time, or message {site.coach}
              {site.email ? ` at ${site.email}` : ""}.
            </p>
          </div>
        )}
      </main>
      <Footer />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen} title="Cancel this booking?" description="Your slot will be released for someone else. You can always book again.">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
            Keep it
          </Button>
          <Button variant="danger" loading={busy} onClick={cancel}>
            Yes, cancel
          </Button>
        </div>
      </Dialog>
    </>
  );
}
