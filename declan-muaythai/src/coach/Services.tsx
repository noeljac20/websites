import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge, Button, Dialog, Field, Input, Select, Spinner, Switch, Textarea } from "@/components/ui";
import { coachUpsertSessionType, fetchSessionTypes, type SessionType } from "@/lib/booking";
import { fmtMoney } from "@/lib/format";
import { errorMessage } from "@/lib/utils";
import { PageHeader, useLoad } from "./shared";

const BLANK: SessionType = {
  id: "",
  slug: "",
  name: "",
  tagline: "",
  description: "",
  duration_min: 60,
  price_cents: 4000,
  sessions_included: 1,
  features: [],
  is_active: true,
  is_featured: false,
  sort_order: 10,
};

export function Services() {
  const types = useLoad(() => fetchSessionTypes(true), []);
  const [editing, setEditing] = useState<SessionType | null>(null);

  return (
    <>
      <PageHeader
        title="Services"
        sub="What people can book and what it costs. Changes show on the site immediately."
        action={
          <Button size="sm" onClick={() => setEditing(BLANK)}>
            <Plus className="size-4" /> New service
          </Button>
        }
      />
      {types.loading && !types.data && (
        <div className="flex items-center gap-3 text-fog">
          <Spinner /> Loading…
        </div>
      )}
      <ul className="grid gap-3 md:grid-cols-2">
        {(types.data ?? []).map((t) => (
          <li key={t.id} className={`card flex flex-col p-5 ${!t.is_active ? "opacity-60" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="display-md text-[19px] text-cream">{t.name}</h2>
                <p className="text-[13px] text-fog">{t.tagline}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {t.is_featured && <Badge tone="gold">Featured</Badge>}
                {!t.is_active && <Badge>Hidden</Badge>}
              </div>
            </div>
            <p className="mt-4 display text-[28px] text-cream">
              {fmtMoney(t.price_cents)} <span className="text-[14px] font-sans font-medium normal-case tracking-normal text-mute">· {t.duration_min} min{t.sessions_included > 1 ? ` × ${t.sessions_included}` : ""}</span>
            </p>
            <Button size="sm" variant="soft" className="mt-4 self-start" onClick={() => setEditing(t)}>
              <Pencil className="size-4" /> Edit
            </Button>
          </li>
        ))}
      </ul>
      {editing && (
        <EditDialog
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            types.reload();
          }}
        />
      )}
    </>
  );
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function EditDialog({ initial, onClose, onSaved }: { initial: SessionType; onClose: () => void; onSaved: () => void }) {
  const isNew = !initial.id;
  const [f, setF] = useState({
    ...initial,
    price: (initial.price_cents / 100).toFixed(2),
    featuresText: initial.features.join("\n"),
  });
  const [busy, setBusy] = useState(false);
  const up = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const price = Math.round(Number(f.price) * 100);
    if (!f.name.trim() || Number.isNaN(price) || price < 0) {
      toast.error("Name and a valid price are required.");
      return;
    }
    setBusy(true);
    try {
      await coachUpsertSessionType({
        ...(initial.id ? { id: initial.id } : {}),
        slug: initial.slug || slugify(f.name),
        name: f.name.trim(),
        tagline: f.tagline || null,
        description: f.description || null,
        duration_min: Number(f.duration_min),
        price_cents: price,
        sessions_included: Number(f.sessions_included),
        features: f.featuresText.split("\n").map((s) => s.trim()).filter(Boolean),
        is_active: f.is_active,
        is_featured: f.is_featured,
        sort_order: Number(f.sort_order),
      });
      toast.success(isNew ? "Service added." : "Service updated.");
      onSaved();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()} title={isNew ? "New service" : `Edit ${initial.name}`} wide>
      <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
        <Field id="sv-name" label="Name">
          <Input id="sv-name" value={f.name} onChange={(e) => up("name", e.target.value)} required />
        </Field>
        <Field id="sv-tag" label="Tagline" optional>
          <Input id="sv-tag" value={f.tagline ?? ""} onChange={(e) => up("tagline", e.target.value)} />
        </Field>
        <Field id="sv-price" label="Price (AUD)">
          <Input id="sv-price" type="number" inputMode="decimal" min={0} step="0.01" value={f.price} onChange={(e) => up("price", e.target.value)} required />
        </Field>
        <Field id="sv-dur" label="Duration (minutes)">
          <Select id="sv-dur" value={String(f.duration_min)} onChange={(e) => up("duration_min", Number(e.target.value))}>
            {[30, 45, 60, 75, 90, 120].map((m) => (
              <option key={m} value={m}>
                {m} min
              </option>
            ))}
          </Select>
        </Field>
        <Field id="sv-inc" label="Sessions included" hint="More than 1 makes it a pack.">
          <Input id="sv-inc" type="number" min={1} max={50} value={f.sessions_included} onChange={(e) => up("sessions_included", Number(e.target.value))} />
        </Field>
        <Field id="sv-sort" label="Order on site" hint="Lower shows first.">
          <Input id="sv-sort" type="number" value={f.sort_order} onChange={(e) => up("sort_order", Number(e.target.value))} />
        </Field>
        <div className="sm:col-span-2">
          <Field id="sv-desc" label="Description" optional>
            <Textarea id="sv-desc" value={f.description ?? ""} onChange={(e) => up("description", e.target.value)} className="min-h-[80px]" />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field id="sv-feat" label="Bullet points" hint="One per line.">
            <Textarea id="sv-feat" value={f.featuresText} onChange={(e) => up("featuresText", e.target.value)} />
          </Field>
        </div>
        <label className="flex items-center justify-between rounded-md bg-ink-2 px-4 py-3 text-[14px] text-cream">
          Visible on site <Switch checked={f.is_active} onChange={(v) => up("is_active", v)} label="Visible on site" />
        </label>
        <label className="flex items-center justify-between rounded-md bg-ink-2 px-4 py-3 text-[14px] text-cream">
          Highlight as popular <Switch checked={f.is_featured} onChange={(v) => up("is_featured", v)} label="Featured" />
        </label>
        <div className="flex justify-end gap-3 sm:col-span-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            Save
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
