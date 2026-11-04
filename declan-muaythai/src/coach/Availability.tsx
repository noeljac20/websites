import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, Field, Input, Spinner, Switch } from "@/components/ui";
import {
  coachAddBlockedDate,
  coachDeleteRule,
  coachRemoveBlockedDate,
  coachUpsertRule,
  fetchBlockedDates,
  fetchRules,
  type AvailabilityRule,
} from "@/lib/booking";
import { fmtClock, fmtDayString, weekdayName } from "@/lib/format";
import { errorMessage } from "@/lib/utils";
import { PageHeader, useLoad } from "./shared";

const ORDER = [1, 2, 3, 4, 5, 6, 0];

export function Availability() {
  const rules = useLoad(() => fetchRules(), []);
  const blocked = useLoad(() => fetchBlockedDates(), []);

  return (
    <>
      <PageHeader title="Availability" sub="The windows people can book into. Sessions are offered on the hour inside each window (change the interval in Settings)." />
      {rules.loading && !rules.data && (
        <div className="flex items-center gap-3 text-fog">
          <Spinner /> Loading…
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="flex flex-col gap-2">
          {ORDER.map((wd) => (
            <DayRow key={wd} weekday={wd} rules={(rules.data ?? []).filter((r) => r.weekday === wd)} onChange={rules.reload} />
          ))}
        </section>
        <BlockedDates list={blocked.data ?? []} onChange={blocked.reload} />
      </div>
    </>
  );
}

function DayRow({ weekday, rules, onChange }: { weekday: number; rules: AvailabilityRule[]; onChange: () => void }) {
  const [adding, setAdding] = useState(false);
  const [start, setStart] = useState("06:00");
  const [end, setEnd] = useState("09:00");
  const [busy, setBusy] = useState(false);

  async function add() {
    if (end <= start) {
      toast.error("End time must be after start time.");
      return;
    }
    setBusy(true);
    try {
      await coachUpsertRule({ weekday, start_time: start, end_time: end, is_active: true });
      setAdding(false);
      onChange();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function toggle(r: AvailabilityRule, v: boolean) {
    try {
      await coachUpsertRule({ ...r, is_active: v });
      onChange();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  async function remove(r: AvailabilityRule) {
    try {
      await coachDeleteRule(r.id);
      onChange();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  return (
    <div className="card-2 p-4">
      <div className="flex items-center justify-between">
        <h2 className="display-md text-[17px] text-cream">{weekdayName(weekday)}</h2>
        <Button size="sm" variant="soft" onClick={() => setAdding((a) => !a)}>
          <Plus className="size-4" /> Window
        </Button>
      </div>
      {rules.length === 0 && !adding && <p className="mt-2 text-[13px] text-mute">Not available</p>}
      <ul className="mt-2 flex flex-col gap-2">
        {rules.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 rounded-md bg-ink-2 px-3 py-2">
            <span className={`tnum text-[15px] font-semibold ${r.is_active ? "text-cream" : "text-mute line-through"}`}>
              {fmtClock(r.start_time)} – {fmtClock(r.end_time)}
            </span>
            <div className="flex items-center gap-3">
              <Switch checked={r.is_active} onChange={(v) => toggle(r, v)} label={`Toggle ${weekdayName(weekday)} ${fmtClock(r.start_time)} window`} />
              <button type="button" onClick={() => remove(r)} aria-label="Remove window" className="grid size-9 place-items-center rounded-md text-mute hover:bg-red-soft hover:text-[#ff8a8e]">
                <Trash2 className="size-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      {adding && (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <Field id={`s-${weekday}`} label="From">
            <Input id={`s-${weekday}`} type="time" step={900} value={start} onChange={(e) => setStart(e.target.value)} className="field-sm w-[130px]" />
          </Field>
          <Field id={`e-${weekday}`} label="To">
            <Input id={`e-${weekday}`} type="time" step={900} value={end} onChange={(e) => setEnd(e.target.value)} className="field-sm w-[130px]" />
          </Field>
          <Button size="sm" loading={busy} onClick={add}>
            Add
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

function BlockedDates({ list, onChange }: { list: { id: string; day: string; reason: string | null }[]; onChange: () => void }) {
  const [day, setDay] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const upcoming = list.filter((b) => b.day >= new Date().toISOString().slice(0, 10));

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!day) return;
    setBusy(true);
    try {
      await coachAddBlockedDate(day, reason);
      setDay("");
      setReason("");
      onChange();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card h-fit p-5">
      <h2 className="display-md text-[19px] text-cream">Days off</h2>
      <p className="mt-1 text-[13px] text-fog">Fight weeks, holidays, rest days. Nothing can be booked on these dates.</p>
      <form onSubmit={add} className="mt-4 flex flex-col gap-3">
        <Field id="bd-day" label="Date">
          <Input id="bd-day" type="date" value={day} onChange={(e) => setDay(e.target.value)} required className="field-sm" />
        </Field>
        <Field id="bd-reason" label="Reason" optional>
          <Input id="bd-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Fight camp" className="field-sm" />
        </Field>
        <Button size="sm" type="submit" loading={busy}>
          <Plus className="size-4" /> Block date
        </Button>
      </form>
      <ul className="mt-5 flex flex-col gap-2">
        {upcoming.length === 0 && <li className="text-[13px] text-mute">No days blocked.</li>}
        {upcoming.map((b) => (
          <li key={b.id} className="flex items-center justify-between gap-3 rounded-md bg-ink-2 px-3 py-2 text-[14px]">
            <span>
              <span className="font-semibold text-cream">{fmtDayString(b.day, { weekday: "short", day: "numeric", month: "short" })}</span>
              {b.reason && <span className="text-fog"> · {b.reason}</span>}
            </span>
            <button
              type="button"
              onClick={() => coachRemoveBlockedDate(b.id).then(onChange).catch((e) => toast.error(errorMessage(e)))}
              aria-label="Unblock date"
              className="grid size-9 place-items-center rounded-md text-mute hover:bg-red-soft hover:text-[#ff8a8e]"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
