import { useState } from "react";
import { toast } from "sonner";
import { Button, Field, Input, Select, Switch } from "@/components/ui";
import { coachUpdateSettings, type Settings } from "@/lib/booking";
import { errorMessage } from "@/lib/utils";
import { PageHeader } from "./shared";

const ZONES = ["Australia/Melbourne", "Australia/Sydney", "Australia/Brisbane", "Australia/Adelaide", "Australia/Perth", "Australia/Hobart", "Australia/Darwin", "Pacific/Auckland"];

export function SettingsPanel({ settings, onSaved }: { settings: Settings; onSaved: (s: Settings) => void }) {
  const [f, setF] = useState(settings);
  const [busy, setBusy] = useState(false);
  const up = <K extends keyof Settings>(k: K, v: Settings[K]) => setF((s) => ({ ...s, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const saved = await coachUpdateSettings({
        timezone: f.timezone,
        slot_interval_min: Number(f.slot_interval_min),
        min_notice_hours: Number(f.min_notice_hours),
        max_advance_days: Number(f.max_advance_days),
        buffer_min: Number(f.buffer_min),
        auto_confirm: f.auto_confirm,
        location: f.location,
      });
      onSaved(saved);
      toast.success("Settings saved.");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Settings" sub="How the booking calendar behaves." />
      <form onSubmit={save} className="card grid max-w-2xl gap-5 p-5 sm:grid-cols-2 sm:p-7">
        <Field id="st-loc" label="Location shown to clients" hint="Gym name and suburb. Shown to clients on the booking and confirmation pages.">
          <Input id="st-loc" value={f.location} onChange={(e) => up("location", e.target.value)} />
        </Field>
        <Field id="st-tz" label="Timezone">
          <Select id="st-tz" value={f.timezone} onChange={(e) => up("timezone", e.target.value)}>
            {ZONES.map((z) => (
              <option key={z} value={z}>
                {z.replace("_", " ")}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="st-int" label="Start times every" hint="Slots are offered at this interval inside each availability window.">
          <Select id="st-int" value={String(f.slot_interval_min)} onChange={(e) => up("slot_interval_min", Number(e.target.value))}>
            {[30, 45, 60, 90, 120].map((m) => (
              <option key={m} value={m}>
                {m} minutes
              </option>
            ))}
          </Select>
        </Field>
        <Field id="st-buf" label="Gap between sessions" hint="Time kept free before and after each booking.">
          <Select id="st-buf" value={String(f.buffer_min)} onChange={(e) => up("buffer_min", Number(e.target.value))}>
            {[0, 15, 30, 45, 60].map((m) => (
              <option key={m} value={m}>
                {m === 0 ? "None" : `${m} minutes`}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="st-notice" label="Minimum notice (hours)" hint="Bookings cannot be made closer to the start time than this.">
          <Input id="st-notice" type="number" min={0} max={168} value={f.min_notice_hours} onChange={(e) => up("min_notice_hours", Number(e.target.value))} />
        </Field>
        <Field id="st-adv" label="How far ahead (days)" hint="How far into the future the calendar opens.">
          <Input id="st-adv" type="number" min={1} max={365} value={f.max_advance_days} onChange={(e) => up("max_advance_days", Number(e.target.value))} />
        </Field>
        <label className="flex items-center justify-between rounded-md bg-ink-2 px-4 py-3 text-[14px] text-cream sm:col-span-2">
          <span>
            Auto-confirm new bookings
            <span className="block text-[12px] text-mute">When this is off, new requests wait for you to confirm them.</span>
          </span>
          <Switch checked={f.auto_confirm} onChange={(v) => up("auto_confirm", v)} label="Auto-confirm bookings" />
        </label>
        <div className="flex justify-end sm:col-span-2">
          <Button type="submit" loading={busy}>
            Save settings
          </Button>
        </div>
      </form>
    </>
  );
}
