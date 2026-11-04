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
    document.title = `Your booking | ${site.name}`;
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
      toast.success("Your booking has been cancelled.");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const tz = settings.timezone;
  const upcoming = booking && new Date(booking.starts_at) > new Date();
  const cancellable = booking && upcoming && (booking.status === "pending" || booking.status === "confirmed");

  const statusSentence: Record<PublicBooking["status"], string> = {
    pending: `${site.coach} has your request and will confirm it.`,
    confirmed: `Your session is confirmed. ${site.coach} will see you at ${site.gym}.`,
    cancelled: "This booking has been cancelled.",
    completed: "This session has taken place.",
    no_show: `This booking was marked as a no-show. If that is not right, message ${site.instagramHandle} on Instagram.`,
  };

  return (
    <>
      <Nav solid />
      <main className="mx-auto min-h-dvh max-w-2xl px-4 pb-24 pt-28 sm:px-6">
        {booking === undefined && (
          <div className="flex items-center gap-3 text-fog" aria-live="polite">
            <Spinner /> Loading your booking
          </div>
        )}
        {booking === null && (
          <div className="card p-8 text-center">
            <h1 className="display text-[30px] text-cream">Booking not found</h1>
            <p className="mt-3 text-fog">This link does not match a booking. Check the link from your confirmation page.</p>
            <Link to="/book" className="btn btn-primary mt-6">
              Book a session
            </Link>
          </div>
        )}
        {booking && (
          <div className="card animate-rise p-6 sm:p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">{booking.session_name}</p>
                <h1 className="display mt-2 text-[clamp(1.85rem,3.4vw,2.6rem)] text-cream">Your booking</h1>
              </div>
              <Badge tone={booking.status}>{STATUS_LABEL[booking.status]}</Badge>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-fog">{statusSentence[booking.status]}</p>

            <dl className="mt-8 grid gap-4 rounded-xl bg-ink-2 p-5 sm:grid-cols-2">
              <div>
                <dt className="label-caps">Session</dt>
                <dd className="mt-1 font-semibold text-cream">{booking.session_name}</dd>
              </div>
              <div>
                <dt className="label-caps">Name</dt>
                <dd className="mt-1 font-semibold text-cream">{booking.client_name}</dd>
              </div>
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
                  <MapPin className="mt-1 size-4 shrink-0 text-mute" aria-hidden /> {settings.location || site.location}
                </dd>
              </div>
              <div>
                <dt className="label-caps">Price</dt>
                <dd className="mt-1 font-semibold text-cream">
                  {fmtMoney(booking.price_cents)} <span className="font-medium text-fog">paid directly to {site.coach}</span>
                </dd>
              </div>
            </dl>

            {upcoming && booking.status !== "cancelled" && (
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={googleCalendarUrl({
                    title: `Muay Thai with ${site.coach}: ${booking.session_name}`,
                    start: booking.starts_at,
                    end: booking.ends_at,
                    location: settings.location,
                  })}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-soft btn-sm"
                >
                  <CalendarPlus className="size-4" aria-hidden /> Add to Google Calendar
                </a>
                <a
                  href={icsFile({
                    title: `Muay Thai with ${site.coach}: ${booking.session_name}`,
                    start: booking.starts_at,
                    end: booking.ends_at,
                    location: settings.location,
                    uid: booking.id,
                  })}
                  download="declan-muay-thai.ics"
                  className="btn btn-soft btn-sm"
                >
                  <CalendarPlus className="size-4" aria-hidden /> Add to Apple or Outlook calendar
                </a>
              </div>
            )}

            <div className="mt-10 flex flex-col gap-3 hairline-t pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Link to="/book" className="btn btn-primary">
                {booking.status === "cancelled" || booking.status === "completed" ? "Book a session" : "Book another session"}
              </Link>
              {cancellable && (
                <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                  Cancel booking
                </Button>
              )}
            </div>
            {cancellable && (
              <p className="mt-4 text-[13px] leading-relaxed text-mute">
                To change the time, cancel and rebook, or message {site.instagramHandle} on Instagram.
              </p>
            )}
          </div>
        )}
      </main>
      <Footer />

      <Dialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Cancel this booking?"
        description="The time will be released. You can book again at any time."
      >
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
            Keep booking
          </Button>
          <Button variant="danger" loading={busy} onClick={cancel}>
            Cancel booking
          </Button>
        </div>
      </Dialog>
    </>
  );
}
