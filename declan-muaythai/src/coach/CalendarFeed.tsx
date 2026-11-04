import { useEffect, useState } from "react";
import { CalendarPlus, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button, Dialog } from "@/components/ui";
import { calendarFeedUrls, coachFeedToken, coachResetFeedToken } from "@/lib/booking";
import { errorMessage } from "@/lib/utils";

/**
 * Lets Declan subscribe his phone calendar to his bookings. New requests and confirmed sessions then
 * appear in his calendar automatically (phones refresh subscribed calendars periodically), with no email setup.
 */
export function CalendarFeed() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    coachFeedToken().then(setToken).catch((e) => setError(errorMessage(e)));
  }, []);

  const urls = token ? calendarFeedUrls(token) : null;

  function copy() {
    if (!urls) return;
    navigator.clipboard
      .writeText(urls.https)
      .then(() => toast.success("Link copied."))
      .catch(() => toast.error("Could not copy. Select the link and copy it instead."));
  }

  async function reset() {
    setBusy(true);
    try {
      setToken(await coachResetFeedToken());
      setConfirmReset(false);
      toast.success("New link created. Subscribe again with the new link.");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card mt-6 max-w-2xl p-5 sm:p-7" aria-labelledby="feed-heading">
      <h2 id="feed-heading" className="display-md text-[22px] text-cream">
        Bookings in your phone calendar
      </h2>
      <p className="mt-1 text-[14px] text-fog">
        Subscribe once and new requests and confirmed sessions show up in your calendar automatically. Requests waiting for you are marked Request.
      </p>

      {error && <p className="mt-4 text-[14px] text-red">{error}</p>}
      {!urls && !error && <p className="mt-4 text-[14px] text-mute">Loading your link…</p>}

      {urls && (
        <>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href={urls.webcal} className="btn btn-primary btn-sm">
              <CalendarPlus className="size-4" aria-hidden /> iPhone or Mac calendar
            </a>
            <a href={urls.google} target="_blank" rel="noreferrer" className="btn btn-soft btn-sm">
              <CalendarPlus className="size-4" aria-hidden /> Google Calendar
            </a>
            <Button type="button" variant="ghost" size="sm" onClick={copy}>
              <Copy className="size-4" aria-hidden /> Copy link
            </Button>
          </div>
          <p className="mt-4 break-all rounded-md bg-ink-2 px-3 py-2 text-[12px] text-mute select-all">{urls.https}</p>
          <ul className="mt-3 flex list-disc flex-col gap-1 pl-5 text-[12px] text-mute">
            <li>iPhone checks for new bookings about every 15 minutes to an hour. Google Calendar can take several hours, so still check the dashboard for new requests.</li>
            <li>Google Calendar subscriptions have to be added once from a computer (Other calendars, From URL, paste the link). They then sync to the phone app.</li>
          </ul>
          <p className="mt-3 text-[12px] text-mute">
            Keep this link private. Anyone with it can see your bookings.{" "}
            <button type="button" onClick={() => setConfirmReset(true)} className="inline-flex min-h-11 items-center gap-1 font-semibold text-fog underline underline-offset-2 hover:text-cream">
              <RefreshCw className="size-3.5" aria-hidden /> Make a new link
            </button>
          </p>
        </>
      )}

      <Dialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Make a new link?"
        description="The old link stops working. Any calendar using it will stop updating until you subscribe with the new link."
      >
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={() => setConfirmReset(false)}>
            Keep current link
          </Button>
          <Button type="button" variant="danger" loading={busy} onClick={reset}>
            Make a new link
          </Button>
        </div>
      </Dialog>
    </section>
  );
}
