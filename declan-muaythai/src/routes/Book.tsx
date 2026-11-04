import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CalendarPlus, Check, ChevronLeft, ChevronRight, Clock, ExternalLink, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Button, Field, Input, Select, Spinner, Textarea } from "@/components/ui";
import { site } from "@/lib/site";
import {
  createBooking,
  fetchSessionTypes,
  fetchSettings,
  fetchSlots,
  DEFAULT_SETTINGS,
  type CreatedBooking,
  type SessionType,
  type Settings,
  type Slot,
} from "@/lib/booking";
import {
  addDays,
  addMonths,
  fmtDateLong,
  fmtDayString,
  fmtMoney,
  fmtRange,
  fmtTime,
  googleCalendarUrl,
  icsFile,
  monthGrid,
  monthLabel,
  monthOf,
  partOfDay,
  todayLocal,
} from "@/lib/format";
import { cn, errorMessage } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4;

const STEPS = ["Session", "Time", "Details"];

export function BookPage() {
  const search = useSearch({ from: "/book" });
  const navigate = useNavigate();

  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [types, setTypes] = useState<SessionType[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [step, setStep] = useState<Step>(1);
  const [type, setType] = useState<SessionType | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [created, setCreated] = useState<CreatedBooking | null>(null);

  useEffect(() => {
    document.title = `Book a session — ${site.name}`;
    Promise.all([fetchSettings(), fetchSessionTypes()])
      .then(([s, t]) => {
        setSettings(s);
        setTypes(t);
        const pre = t.find((x) => x.slug === search.type);
        if (pre) {
          setType(pre);
          setStep(2);
        }
      })
      .catch((e) => setLoadError(errorMessage(e, "Couldn't load session types.")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const tz = settings.timezone;

  return (
    <>
      <Nav solid />
      <main className="mx-auto min-h-dvh max-w-6xl px-4 pb-24 pt-28 sm:px-6">
        {step < 4 && (
          <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Book a session</p>
              <h1 className="display mt-2 text-[clamp(1.85rem,3.4vw,2.6rem)] text-cream">
                {step === 1 && "Pick your session."}
                {step === 2 && "Pick a time."}
                {step === 3 && "Your details."}
              </h1>
            </div>
            <Stepper step={step} />
          </header>
        )}

        {loadError && (
          <div className="card-2 border-red/40 p-5 text-[15px] text-fog" role="alert">
            {loadError} If this keeps happening, message {site.coach} directly{site.email ? ` at ${site.email}` : ""}.
          </div>
        )}

        {!loadError && types === null && (
          <div className="flex items-center gap-3 py-20 text-fog">
            <Spinner /> Loading…
          </div>
        )}

        {types && step === 1 && (
          <ChooseType
            types={types}
            selected={type}
            onSelect={(t) => {
              setType(t);
              setSlot(null);
              setStep(2);
              void navigate({ to: "/book", search: { type: t.slug }, replace: true });
            }}
          />
        )}

        {type && step === 2 && (
          <ChooseTime
            type={type}
            settings={settings}
            selected={slot}
            onBack={() => setStep(1)}
            onSelect={(s) => {
              setSlot(s);
              setStep(3);
            }}
          />
        )}

        {type && slot && step === 3 && (
          <Details
            type={type}
            slot={slot}
            tz={tz}
            onBack={() => setStep(2)}
            onDone={(b) => {
              setCreated(b);
              setStep(4);
            }}
            onSlotTaken={() => {
              setSlot(null);
              setStep(2);
            }}
          />
        )}

        {created && type && step === 4 && <Confirmation booking={created} settings={settings} />}
      </main>
      <Footer />
    </>
  );
}

/* ---------------------------------------------------------------- stepper */
function Stepper({ step }: { step: Step }) {
  return (
    <ol className="flex items-center gap-2" aria-label={`Step ${step} of ${STEPS.length}`}>
      {STEPS.map((label, i) => {
        const n = (i + 1) as Step;
        const state = n < step ? "done" : n === step ? "current" : "todo";
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              aria-current={state === "current" ? "step" : undefined}
              className={cn(
                "grid size-8 place-items-center rounded-full font-display text-[14px] font-700",
                state === "done" && "bg-green text-ink",
                state === "current" && "bg-red text-white",
                state === "todo" && "border border-line text-mute",
              )}
            >
              {state === "done" ? <Check className="size-4" /> : n}
            </span>
            <span className={cn("label-caps hidden sm:inline", state === "current" && "text-cream")}>{label}</span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-line-strong" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

/* ---------------------------------------------------------------- step 1 */
function ChooseType({ types, selected, onSelect }: { types: SessionType[]; selected: SessionType | null; onSelect: (t: SessionType) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {types.map((t, i) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onSelect(t)}
          className={cn(
            "card group animate-rise flex flex-col items-start p-6 text-left transition-all hover:-translate-y-0.5 hover:border-cream/40",
            selected?.id === t.id && "border-red/70 shadow-glow-red",
          )}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex w-full items-start justify-between gap-4">
            <div>
              <h2 className="display-md text-[22px] text-cream">{t.name}</h2>
              {t.tagline && <p className="mt-1 text-[14px] text-fog">{t.tagline}</p>}
            </div>
            {t.is_featured && (
              <span className="rounded-full bg-red-soft px-2.5 py-1 font-display text-[11px] font-700 uppercase tracking-[0.16em] text-red">
                Popular
              </span>
            )}
          </div>
          {t.description && <p className="mt-4 text-[15px] leading-relaxed text-fog">{t.description}</p>}
          <div className="mt-6 flex w-full items-end justify-between">
            <div>
              <span className="display text-[30px] text-cream">{fmtMoney(t.price_cents)}</span>
              <span className="ml-2 text-[13px] text-mute">
                {t.sessions_included > 1 ? `· ${t.sessions_included} × ${t.duration_min} min` : `· ${t.duration_min} min`}
              </span>
            </div>
            <span className="btn btn-soft btn-sm group-hover:bg-red group-hover:text-white group-hover:border-red">
              Choose <ArrowRight className="size-4" />
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- step 2 */
function ChooseTime({
  type,
  settings,
  selected,
  onSelect,
  onBack,
}: {
  type: SessionType;
  settings: Settings;
  selected: Slot | null;
  onSelect: (s: Slot) => void;
  onBack: () => void;
}) {
  const tz = settings.timezone;
  const today = todayLocal(tz);
  const lastDay = addDays(today, settings.max_advance_days);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState(monthOf(today));
  const [day, setDay] = useState<string | null>(selected?.day ?? null);
  const [pending, setPending] = useState<Slot | null>(selected);

  useEffect(() => {
    setSlots(null);
    fetchSlots(type.id, today, lastDay)
      .then((s) => {
        setSlots(s);
        if (!day) {
          const first = s[0]?.day;
          if (first) {
            setDay(first);
            setMonth(monthOf(first));
          }
        }
      })
      .catch((e) => setError(errorMessage(e, "Couldn't load availability.")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type.id]);

  const byDay = useMemo(() => {
    const m = new Map<string, Slot[]>();
    for (const s of slots ?? []) {
      if (!m.has(s.day)) m.set(s.day, []);
      m.get(s.day)!.push(s);
    }
    return m;
  }, [slots]);

  const daySlots = day ? byDay.get(day) ?? [] : [];
  const grouped = useMemo(() => {
    const g: Record<string, Slot[]> = {};
    for (const s of daySlots) {
      const k = partOfDay(s.starts_at, tz);
      (g[k] ??= []).push(s);
    }
    return g;
  }, [daySlots, tz]);

  const firstMonth = monthOf(today);
  const lastMonth = monthOf(lastDay);
  const cells = monthGrid(month);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      {/* calendar */}
      <section className="card p-5 sm:p-6" aria-label="Choose a date">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="display-md text-[20px] text-cream">{monthLabel(month)}</h2>
          <div className="flex gap-2">
            <button
              type="button"
              className="grid size-10 place-items-center rounded-md border border-line text-fog hover:text-cream disabled:opacity-30"
              onClick={() => setMonth(addMonths(month, -1))}
              disabled={month <= firstMonth}
              aria-label="Previous month"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              className="grid size-10 place-items-center rounded-md border border-line text-fog hover:text-cream disabled:opacity-30"
              onClick={() => setMonth(addMonths(month, 1))}
              disabled={month >= lastMonth}
              aria-label="Next month"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
            <span key={d} className="label-caps py-2">
              {d}
            </span>
          ))}
          {cells.map((c, i) =>
            c === null ? (
              <span key={`b${i}`} />
            ) : (
              <button
                key={c}
                type="button"
                disabled={!byDay.has(c)}
                aria-pressed={day === c}
                onClick={() => {
                  setDay(c);
                  setPending(null);
                }}
                className={cn(
                  "relative mx-auto grid aspect-square w-full max-w-12 place-items-center rounded-md text-[15px] font-semibold tnum transition-colors",
                  byDay.has(c) ? "bg-ink-2 text-cream hover:bg-surface-3" : "text-faint",
                  day === c && "bg-red text-white hover:bg-red",
                  c === today && day !== c && "ring-1 ring-gold/60",
                )}
              >
                {Number(c.slice(-2))}
                {byDay.has(c) && day !== c && <span className="absolute bottom-1 size-1 rounded-full bg-gold" aria-hidden />}
              </button>
            ),
          )}
        </div>
        <p className="mt-4 flex items-center gap-2 text-[13px] text-mute">
          <Clock className="size-3.5" /> Times shown in {tz.replace("_", " ").split("/").pop()} time
        </p>
        {slots === null && !error && (
          <p className="mt-3 flex items-center gap-2 text-[13px] text-fog">
            <Spinner className="size-4" /> Checking availability…
          </p>
        )}
        {slots && slots.length === 0 && (
          <p className="mt-3 text-[14px] text-fog">
            No open slots in the next {settings.max_advance_days} days. Message {site.coach} and we'll find a time.
          </p>
        )}
        {error && (
          <p className="mt-3 text-[14px] text-[#ff7a7f]" role="alert">
            {error}
          </p>
        )}
      </section>

      {/* times */}
      <section className="flex flex-col" aria-label="Choose a time">
        <div className="card flex-1 p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="label-caps">{type.name}</p>
              <h2 className="display-md mt-1 text-[20px] text-cream">{day ? fmtDayString(day) : "Choose a date"}</h2>
            </div>
            <span className="rounded-full bg-surface-3 px-3 py-1 text-[13px] text-fog">{type.duration_min} min</span>
          </div>

          {day && daySlots.length === 0 && <p className="text-[15px] text-fog">Nothing open this day.</p>}

          {(["Morning", "Afternoon", "Evening"] as const).map((part) =>
            grouped[part]?.length ? (
              <div key={part} className="mb-5">
                <p className="label-caps mb-2">{part}</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {grouped[part].map((s) => (
                    <button
                      key={s.starts_at}
                      type="button"
                      className="chip"
                      aria-pressed={pending?.starts_at === s.starts_at}
                      onClick={() => setPending(s)}
                    >
                      {fmtTime(s.starts_at, tz)}
                    </button>
                  ))}
                </div>
              </div>
            ) : null,
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="size-4" /> Back
          </Button>
          <Button disabled={!pending} onClick={() => pending && onSelect(pending)}>
            {pending ? `Continue · ${fmtTime(pending.starts_at, tz)}` : "Pick a time"} <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------- step 3 */
type FormState = { name: string; email: string; phone: string; experience: string; goals: string; notes: string };
type FormErrors = Partial<Record<keyof FormState, string>>;

function Details({
  type,
  slot,
  tz,
  onBack,
  onDone,
  onSlotTaken,
}: {
  type: SessionType;
  slot: Slot;
  tz: string;
  onBack: () => void;
  onDone: (b: CreatedBooking) => void;
  onSlotTaken: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => {
    try {
      const saved = localStorage.getItem("dmt.client");
      return saved ? { ...{ name: "", email: "", phone: "", experience: "", goals: "", notes: "" }, ...JSON.parse(saved) } : { name: "", email: "", phone: "", experience: "", goals: "", notes: "" };
    } catch {
      return { name: "", email: "", phone: "", experience: "", goals: "", notes: "" };
    }
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (form.name.trim().length < 2) e.name = "Enter your name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) e.email = "Enter a valid email address.";
    if (form.phone && form.phone.replace(/[^\d+]/g, "").length < 8) e.phone = "Enter a valid phone number.";
    if (!form.experience) e.experience = "Choose the option closest to you.";
    return e;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      summaryRef.current?.focus();
      return;
    }
    setSubmitting(true);
    try {
      try {
        localStorage.setItem("dmt.client", JSON.stringify({ name: form.name, email: form.email, phone: form.phone, experience: form.experience }));
      } catch {
        /* ignore */
      }
      const b = await createBooking({
        sessionTypeId: type.id,
        startsAt: slot.starts_at,
        name: form.name,
        email: form.email,
        phone: form.phone,
        experience: form.experience,
        goals: form.goals,
        notes: form.notes,
      });
      onDone(b);
    } catch (err) {
      const msg = errorMessage(err);
      if (/no longer available|just taken/i.test(msg)) {
        toast.error(msg);
        onSlotTaken();
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const errorList = Object.entries(errors);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={submit} noValidate className="card flex flex-col gap-5 p-5 sm:p-7">
        {errorList.length > 0 && (
          <div ref={summaryRef} tabIndex={-1} className="rounded-md border border-red/40 bg-red-soft p-4" role="alert">
            <p className="font-semibold text-cream">Please fix the following:</p>
            <ul className="mt-1 list-disc pl-5 text-[14px] text-fog">
              {errorList.map(([k, v]) => (
                <li key={k}>
                  <a href={`#f-${k}`} className="underline">
                    {v}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="f-name" label="Full name" error={errors.name}>
            <Input id="f-name" autoComplete="name" value={form.name} onChange={set("name")} invalid={!!errors.name} aria-describedby={errors.name ? "f-name-error" : undefined} placeholder="Your name" />
          </Field>
          <Field id="f-email" label="Email" error={errors.email} hint="Your confirmation and manage link go here.">
            <Input id="f-email" type="email" inputMode="email" autoComplete="email" value={form.email} onChange={set("email")} invalid={!!errors.email} aria-describedby={errors.email ? "f-email-error" : "f-email-hint"} placeholder="you@example.com" />
          </Field>
          <Field id="f-phone" label="Mobile" error={errors.phone} optional hint={`So ${site.coach} can text you if anything changes.`}>
            <Input id="f-phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} invalid={!!errors.phone} aria-describedby={errors.phone ? "f-phone-error" : "f-phone-hint"} placeholder="04xx xxx xxx" />
          </Field>
          <Field id="f-experience" label="Experience" error={errors.experience}>
            <Select id="f-experience" value={form.experience} onChange={set("experience")} aria-invalid={!!errors.experience} aria-describedby={errors.experience ? "f-experience-error" : undefined}>
              <option value="">Choose one…</option>
              {site.experienceOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field id="f-goals" label="What do you want out of training?" optional hint="Fitness, technique, a first fight, confidence… anything helps.">
          <Textarea id="f-goals" value={form.goals} onChange={set("goals")} placeholder="e.g. I want to get fit and learn how to kick properly." maxLength={1000} />
        </Field>
        <Field id="f-notes" label="Anything else?" optional hint="Injuries, a partner's name for a 2-on-1, questions.">
          <Textarea id="f-notes" value={form.notes} onChange={set("notes")} className="min-h-[80px]" maxLength={1000} />
        </Field>
        <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="ghost" onClick={onBack}>
            <ArrowLeft className="size-4" /> Change time
          </Button>
          <Button type="submit" loading={submitting} className="sm:min-w-[220px]">
            Request booking <ArrowRight className="size-4" />
          </Button>
        </div>
        <p className="text-[13px] text-mute">
          No payment now. {site.bookingNotice} Pay on the day.
        </p>
      </form>

      <aside className="card h-fit p-5 sm:p-6 lg:sticky lg:top-24">
        <p className="label-caps">Your session</p>
        <h2 className="display-md mt-2 text-[22px] text-cream">{type.name}</h2>
        <dl className="mt-4 flex flex-col gap-3 text-[15px]">
          <div className="flex justify-between gap-4 hairline-b pb-3">
            <dt className="text-fog">When</dt>
            <dd className="text-right text-cream">
              {fmtDateLong(slot.starts_at, tz)}
              <br />
              <span className="tnum">{fmtRange(slot.starts_at, slot.ends_at, tz)}</span>
            </dd>
          </div>
          <div className="flex justify-between gap-4 hairline-b pb-3">
            <dt className="text-fog">Where</dt>
            <dd className="text-right text-cream">{site.location}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-fog">Price</dt>
            <dd className="display-md text-[22px] text-cream">{fmtMoney(type.price_cents)}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}

/* ---------------------------------------------------------------- step 4 */
function Confirmation({ booking, settings }: { booking: CreatedBooking; settings: Settings }) {
  const tz = settings.timezone;
  const title = `Muay Thai with ${site.coach} — ${booking.session_name}`;
  const details = `${booking.session_name} with ${site.coach}. Manage your booking: ${window.location.origin}/booking/${booking.token}`;
  const confirmed = booking.status === "confirmed";

  return (
    <div className="mx-auto max-w-2xl animate-rise">
      <div className="card overflow-hidden">
        <div className="stripe-red h-2 opacity-80" aria-hidden />
        <div className="p-6 sm:p-10">
          <span className="grid size-14 place-items-center rounded-full bg-green-soft text-green">
            <Check className="size-7" />
          </span>
          <p className="eyebrow mt-6">{confirmed ? "You're booked" : "Request received"}</p>
          <h1 className="display mt-2 text-[clamp(1.85rem,3.4vw,2.6rem)] text-cream">
            {confirmed ? "See you there." : "Request sent."}
          </h1>
          <p className="mt-4 text-[16px] leading-relaxed text-fog">
            {confirmed
              ? `Your session is locked in. We've sent the details to ${booking ? "your email" : ""}.`
              : `${site.coach} will confirm your session shortly, usually within 24 hours. Keep this page or use the link below to manage it.`}
          </p>

          <dl className="mt-8 grid gap-4 rounded-xl bg-ink-2 p-5 sm:grid-cols-2">
            <div>
              <dt className="label-caps">Session</dt>
              <dd className="mt-1 text-[16px] font-semibold text-cream">{booking.session_name}</dd>
            </div>
            <div>
              <dt className="label-caps">Price</dt>
              <dd className="mt-1 text-[16px] font-semibold text-cream">{fmtMoney(booking.price_cents)} · pay on the day</dd>
            </div>
            <div>
              <dt className="label-caps">When</dt>
              <dd className="mt-1 text-[16px] font-semibold text-cream">
                {fmtDateLong(booking.starts_at, tz)}
                <br />
                <span className="tnum font-medium text-fog">{fmtRange(booking.starts_at, booking.ends_at, tz)}</span>
              </dd>
            </div>
            <div>
              <dt className="label-caps">Where</dt>
              <dd className="mt-1 flex items-start gap-1.5 text-[16px] font-semibold text-cream">
                <MapPin className="mt-1 size-4 shrink-0 text-mute" /> {settings.location}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={googleCalendarUrl({ title, start: booking.starts_at, end: booking.ends_at, details, location: settings.location })}
              target="_blank"
              rel="noreferrer"
              className="btn btn-soft btn-sm"
            >
              <CalendarPlus className="size-4" /> Google Calendar
            </a>
            <a
              href={icsFile({ title, start: booking.starts_at, end: booking.ends_at, details, location: settings.location, uid: booking.id })}
              download="declan-muay-thai.ics"
              className="btn btn-soft btn-sm"
            >
              <CalendarPlus className="size-4" /> Apple / Outlook
            </a>
            <Link to="/booking/$token" params={{ token: booking.token }} className="btn btn-soft btn-sm">
              <ExternalLink className="size-4" /> Manage booking
            </Link>
          </div>

          <div className="mt-8 rounded-xl border border-line p-5 text-[14px] text-fog">
            <p className="font-semibold text-cream">Before your session</p>
            <ul className="mt-2 list-disc pl-5">
              <li>Bring water, a towel and comfortable training clothes.</li>
              <li>Gloves and wraps are provided for your first sessions.</li>
              <li>Arrive five minutes early so we can use the full hour.</li>
            </ul>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/" className="btn btn-ghost">
              Back to site
            </Link>
            <Link to="/book" className="btn btn-primary" onClick={() => window.location.assign("/book")}>
              Book another
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
