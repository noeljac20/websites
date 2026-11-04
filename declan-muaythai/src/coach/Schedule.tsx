import { useMemo, useState } from "react";
import { Check, ChevronDown, Copy, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button, Dialog, EmptyState, Field, Input, Select, Spinner, Textarea } from "@/components/ui";
import {
  coachCreateBooking,
  coachFetchBookings,
  coachUpdateBooking,
  fetchSessionTypes,
  type Booking,
  type BookingStatus,
  type SessionType,
  type Settings,
} from "@/lib/booking";
import { fmtDayString, fmtMoney, fmtRange, fmtTime, localDay, todayLocal } from "@/lib/format";
import { cn, errorMessage } from "@/lib/utils";
import { ContactLinks, PageHeader, StatusBadge, confirmationText, experienceLabel, useLoad } from "./shared";

type Filter = "upcoming" | "past" | "cancelled";

export function Schedule({ settings }: { settings: Settings }) {
  const tz = settings.timezone;
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [addOpen, setAddOpen] = useState(false);
  const all = useLoad(() => coachFetchBookings({ from: new Date(Date.now() - 120 * 864e5).toISOString() }), []);

  const list = useMemo(() => {
    const now = Date.now();
    const rows = [...(all.data ?? [])].sort((a, b) => a.starts_at.localeCompare(b.starts_at)).filter((b) => {
      if (filter === "cancelled") return b.status === "cancelled";
      if (b.status === "cancelled") return false;
      const future = new Date(b.ends_at).getTime() >= now;
      return filter === "upcoming" ? future : !future;
    });
    if (filter === "past") rows.reverse();
    const groups = new Map<string, Booking[]>();
    for (const b of rows) {
      const d = localDay(b.starts_at, tz);
      if (!groups.has(d)) groups.set(d, []);
      groups.get(d)!.push(b);
    }
    return [...groups.entries()];
  }, [all.data, filter, tz]);

  const today = todayLocal(tz);

  return (
    <>
      <PageHeader
        title="Schedule"
        sub="Confirm requests, mark sessions done, add walk-ins."
        action={
          <Button onClick={() => setAddOpen(true)} size="sm">
            <Plus className="size-4" /> Add booking
          </Button>
        }
      />
      <div className="mb-5 flex gap-1 rounded-md bg-surface-2 p-1" role="tablist">
        {(["upcoming", "past", "cancelled"] as Filter[]).map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={cn(
              "flex-1 rounded px-3 py-2 font-display text-[14px] font-600 uppercase tracking-[0.12em] transition-colors",
              filter === f ? "bg-surface-3 text-cream" : "text-mute hover:text-fog",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {all.loading && !all.data && (
        <div className="flex items-center gap-3 text-fog">
          <Spinner /> Loading…
        </div>
      )}
      {all.error && <p className="text-[#ff7a7f]">{all.error}</p>}
      {all.data && list.length === 0 && <EmptyState title={`No ${filter} bookings`} body={filter === "upcoming" ? "New requests from the website will show up here." : undefined} />}

      <div className="flex flex-col gap-7">
        {list.map(([day, rows]) => (
          <section key={day}>
            <h2 className="mb-2 flex items-baseline gap-2">
              <span className="display-md text-[17px] text-cream">{fmtDayString(day, { weekday: "long", day: "numeric", month: "short" })}</span>
              {day === today && <span className="rounded-full bg-gold-soft px-2 py-0.5 font-display text-[11px] font-700 uppercase tracking-[0.14em] text-gold">Today</span>}
            </h2>
            <ul className="flex flex-col gap-2">
              {rows.map((b) => (
                <BookingRow key={b.id} booking={b} tz={tz} onChange={all.reload} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <AddBookingDialog open={addOpen} onOpenChange={setAddOpen} tz={tz} onCreated={all.reload} />
    </>
  );
}

/* ---------------------------------------------------------------- row */
export function BookingRow({ booking: b, tz, onChange }: { booking: Booking; tz: string; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState(b.coach_notes ?? "");

  async function setStatus(status: BookingStatus) {
    setBusy(status);
    try {
      await coachUpdateBooking(b.id, status === "cancelled" ? { status, cancelled_by: "coach", cancelled_at: new Date().toISOString() } : { status });
      toast.success(`Marked ${status.replace("_", "-")}.`);
      onChange();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  async function saveNotes() {
    setBusy("notes");
    try {
      await coachUpdateBooking(b.id, { coach_notes: notes || null });
      toast.success("Notes saved.");
      onChange();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  function copyConfirmation() {
    navigator.clipboard
      .writeText(confirmationText(b, tz))
      .then(() => toast.success("Confirmation message copied."))
      .catch(() => toast.error("Couldn't copy."));
  }

  const past = new Date(b.ends_at).getTime() < Date.now();

  return (
    <li className={cn("card-2 overflow-hidden", b.status === "pending" && "border-amber/40")}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 px-4 py-3 text-left" aria-expanded={open}>
        <span className="tnum display-md w-[76px] shrink-0 text-[18px] text-cream">{fmtTime(b.starts_at, tz)}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-cream">{b.client_name}</span>
          <span className="block truncate text-[13px] text-fog">
            {b.session_name} · {fmtMoney(b.price_cents)}
            {b.source === "coach" && " · added by you"}
          </span>
        </span>
        <StatusBadge status={b.status} />
        <ChevronDown className={cn("size-4 shrink-0 text-mute transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="hairline-t grid gap-5 px-4 py-4 md:grid-cols-[1fr_1fr]">
          <div className="flex flex-col gap-3 text-[14px]">
            <Row k="Time" v={fmtRange(b.starts_at, b.ends_at, tz)} />
            <Row k="Email" v={b.client_email} />
            <Row k="Phone" v={b.client_phone ?? "—"} />
            <Row k="Experience" v={experienceLabel(b.experience)} />
            {b.goals && <Row k="Goals" v={b.goals} />}
            {b.notes && <Row k="Notes" v={b.notes} />}
            <Row k="Requested" v={new Date(b.created_at).toLocaleString("en-AU", { timeZone: tz, dateStyle: "medium", timeStyle: "short" })} />
            <ContactLinks email={b.client_email} phone={b.client_phone} name={b.client_name} />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {b.status === "pending" && (
                <Button size="sm" loading={busy === "confirmed"} onClick={() => setStatus("confirmed")}>
                  <Check className="size-4" /> Confirm
                </Button>
              )}
              {(b.status === "confirmed" || b.status === "pending") && past && (
                <Button size="sm" variant="gold" loading={busy === "completed"} onClick={() => setStatus("completed")}>
                  Mark completed
                </Button>
              )}
              {(b.status === "confirmed" || b.status === "pending") && past && (
                <Button size="sm" variant="soft" loading={busy === "no_show"} onClick={() => setStatus("no_show")}>
                  No-show
                </Button>
              )}
              {(b.status === "confirmed" || b.status === "pending") && (
                <Button size="sm" variant="danger" loading={busy === "cancelled"} onClick={() => setStatus("cancelled")}>
                  <X className="size-4" /> Cancel
                </Button>
              )}
              {b.status === "cancelled" && !past && (
                <Button size="sm" variant="soft" loading={busy === "confirmed"} onClick={() => setStatus("confirmed")}>
                  Reinstate
                </Button>
              )}
              {(b.status === "completed" || b.status === "no_show") && (
                <Button size="sm" variant="soft" loading={busy === "confirmed"} onClick={() => setStatus("confirmed")}>
                  Undo
                </Button>
              )}
              {b.status === "confirmed" && !past && (
                <Button size="sm" variant="soft" onClick={copyConfirmation}>
                  <Copy className="size-4" /> Copy confirmation text
                </Button>
              )}
            </div>
            <div>
              <label htmlFor={`notes-${b.id}`} className="label-caps">
                Session notes (private)
              </label>
              <Textarea id={`notes-${b.id}`} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1.5 min-h-[90px] field-sm" placeholder="What you worked on, what to do next time…" />
              <div className="mt-2 flex justify-end">
                <Button size="sm" variant="soft" loading={busy === "notes"} onClick={saveNotes} disabled={notes === (b.coach_notes ?? "")}>
                  Save notes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-3">
      <span className="w-[88px] shrink-0 text-mute">{k}</span>
      <span className="min-w-0 break-words text-cream">{v}</span>
    </div>
  );
}

/* ---------------------------------------------------------------- add dialog */
function AddBookingDialog({ open, onOpenChange, tz, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; tz: string; onCreated: () => void }) {
  const types = useLoad(() => fetchSessionTypes(true), []);
  const [form, setForm] = useState({ name: "", email: "", phone: "", typeId: "", day: todayLocal(tz), time: "17:00", status: "confirmed" as BookingStatus, notes: "" });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const typeList = (types.data ?? []).filter((t) => t.is_active);
  const chosen: SessionType | undefined = typeList.find((t) => t.id === form.typeId) ?? typeList[0];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!chosen) return;
    if (form.name.trim().length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      toast.error("Name and a valid email are required.");
      return;
    }
    setBusy(true);
    try {
      const startsAt = localToIso(form.day, form.time, tz);
      await coachCreateBooking({ sessionType: chosen, startsAt, name: form.name, email: form.email, phone: form.phone, status: form.status, notes: form.notes });
      toast.success("Booking added.");
      onOpenChange(false);
      onCreated();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Add a booking" description="For walk-ins, phone bookings or regulars. Skips the public availability rules but still blocks the time." wide>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field id="ab-name" label="Client name">
          <Input id="ab-name" value={form.name} onChange={set("name")} required />
        </Field>
        <Field id="ab-email" label="Email">
          <Input id="ab-email" type="email" value={form.email} onChange={set("email")} required />
        </Field>
        <Field id="ab-phone" label="Phone" optional>
          <Input id="ab-phone" type="tel" value={form.phone} onChange={set("phone")} />
        </Field>
        <Field id="ab-type" label="Session">
          <Select id="ab-type" value={chosen?.id ?? ""} onChange={set("typeId")}>
            {typeList.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} · {fmtMoney(t.price_cents)}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="ab-day" label="Date">
          <Input id="ab-day" type="date" value={form.day} onChange={set("day")} required />
        </Field>
        <Field id="ab-time" label="Start time" hint={`${tz.split("/").pop()?.replace("_", " ")} time`}>
          <Input id="ab-time" type="time" step={300} value={form.time} onChange={set("time")} required />
        </Field>
        <Field id="ab-status" label="Status">
          <Select id="ab-status" value={form.status} onChange={set("status")}>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed (past session)</option>
          </Select>
        </Field>
        <Field id="ab-notes" label="Notes" optional>
          <Input id="ab-notes" value={form.notes} onChange={set("notes")} />
        </Field>
        <div className="flex justify-end gap-3 sm:col-span-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            Add booking
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

/** Convert a wall-clock date + time in `tz` into a UTC ISO string. */
export function localToIso(day: string, time: string, tz: string) {
  const [y, m, d] = day.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  // first guess: treat as UTC, then correct by the zone offset at that instant
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const offset = tzOffsetMs(guess, tz);
  let result = guess - offset;
  // second pass handles DST boundaries
  const offset2 = tzOffsetMs(result, tz);
  if (offset2 !== offset) result = guess - offset2;
  return new Date(result).toISOString();
}

function tzOffsetMs(utcMs: number, tz: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const g = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"), g("second"));
  return asUtc - Math.floor(utcMs / 1000) * 1000;
}
