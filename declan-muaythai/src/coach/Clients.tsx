import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { toast } from "sonner";
import { Button, EmptyState, Input, Spinner, Textarea } from "@/components/ui";
import { coachFetchBookings, coachFetchClients, coachUpdateClient, type Booking, type Client, type Settings } from "@/lib/booking";
import { fmtDate, fmtMoney } from "@/lib/format";
import { cn, errorMessage } from "@/lib/utils";
import { ContactLinks, PageHeader, StatusBadge, experienceLabel, useLoad } from "./shared";

export function Clients({ settings }: { settings: Settings }) {
  const tz = settings.timezone;
  const clients = useLoad(() => coachFetchClients(), []);
  const bookings = useLoad(() => coachFetchBookings(), []);
  const [q, setQ] = useState("");

  const byClient = useMemo(() => {
    const m = new Map<string, Booking[]>();
    for (const b of bookings.data ?? []) {
      const k = b.client_email;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(b);
    }
    return m;
  }, [bookings.data]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (clients.data ?? []).filter((c) => !needle || c.name.toLowerCase().includes(needle) || c.email.includes(needle) || (c.phone ?? "").includes(needle));
  }, [clients.data, q]);

  return (
    <>
      <PageHeader title="Clients" sub={`${clients.data?.length ?? 0} people have booked with you.`} />
      <div className="relative mb-5">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-mute" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email or phone" className="pl-10" aria-label="Search clients" />
      </div>
      {clients.loading && !clients.data && (
        <div className="flex items-center gap-3 text-fog">
          <Spinner /> Loading
        </div>
      )}
      {clients.data && list.length === 0 && <EmptyState title={q.trim() ? "No clients match that search." : "No clients yet."} body={q.trim() ? undefined : "Every booking creates a client record here."} />}
      <ul className="flex flex-col gap-2">
        {list.map((c) => (
          <ClientRow key={c.id} client={c} bookings={byClient.get(c.email) ?? []} tz={tz} onChange={clients.reload} />
        ))}
      </ul>
    </>
  );
}

function ClientRow({ client: c, bookings, tz, onChange }: { client: Client; bookings: Booking[]; tz: string; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(c.coach_notes ?? "");
  const [busy, setBusy] = useState(false);
  const done = bookings.filter((b) => b.status === "completed");
  const spent = done.reduce((s, b) => s + b.price_cents, 0);
  const next = bookings.find((b) => new Date(b.starts_at) > new Date() && (b.status === "confirmed" || b.status === "pending"));

  async function save() {
    setBusy(true);
    try {
      await coachUpdateClient(c.id, { coach_notes: notes || null });
      toast.success("Notes saved.");
      onChange();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="card-2 overflow-hidden">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 px-4 py-3 text-left" aria-expanded={open}>
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-3 font-display text-[16px] font-700 uppercase text-cream">
          {c.name.slice(0, 1)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-cream">{c.name}</span>
          <span className="block truncate text-[13px] text-fog">
            {done.length} completed · {fmtMoney(spent)}
            {next && ` · next ${fmtDate(next.starts_at, tz)}`}
          </span>
        </span>
        <span className="hidden text-[13px] text-mute sm:inline">{experienceLabel(c.experience)}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-mute transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="hairline-t grid gap-5 px-4 py-4 md:grid-cols-2">
          <div className="flex flex-col gap-3 text-[14px]">
            <p className="text-cream">{c.email}</p>
            <p className="text-cream">{c.phone ?? "No phone number given"}</p>
            <p className="text-fog">Experience: {experienceLabel(c.experience)}</p>
            {c.goals && <p className="text-fog">Goals: {c.goals}</p>}
            <p className="text-mute">Client since {fmtDate(c.created_at, tz, { year: "numeric" })}</p>
            <ContactLinks email={c.email} phone={c.phone} name={c.name} />
            <div>
              <label htmlFor={`cn-${c.id}`} className="label-caps">
                Client notes (private)
              </label>
              <Textarea id={`cn-${c.id}`} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1.5 min-h-[90px] field-sm" placeholder="Injuries, preferences, progress and what to work on next." />
              <div className="mt-2 flex justify-end">
                <Button size="sm" variant="soft" loading={busy} onClick={save} disabled={notes === (c.coach_notes ?? "")}>
                  Save notes
                </Button>
              </div>
            </div>
          </div>
          <div>
            <p className="label-caps mb-2">History</p>
            {bookings.length === 0 && <p className="text-[14px] text-mute">No sessions yet.</p>}
            <ul className="flex flex-col gap-1.5">
              {[...bookings].reverse().map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 rounded-md bg-ink-2 px-3 py-2 text-[13px]">
                  <span className="text-cream">
                    {fmtDate(b.starts_at, tz, { year: "2-digit" })} · {b.session_name}
                  </span>
                  <StatusBadge status={b.status} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
}
