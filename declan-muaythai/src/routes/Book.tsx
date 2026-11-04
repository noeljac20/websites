import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CalendarPlus, Check, ChevronLeft, ChevronRight, Copy, ExternalLink, MapPin } from "lucide-react";
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
const STEP_HEADINGS: Record<Step, string> = { 1: "Choose a session", 2: "Choose a time", 3: "Your details", 4: "Booking request received" };

/** "Australia/Melbourne" to "Melbourne" for copy like "All times are Melbourne time." */
function cityName(tz: string) {
  return (tz.split("/").pop() ?? tz).replace(/_/g, " ");
}

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
  // The details form lives in step 3, which unmounts when the visitor goes back a step. The draft is kept here so
  // goals, notes and the child's details survive a "Change time" round trip.
  const [draft, setDraft] = useState<FormState | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    document.title = `Book a session | ${site.name}`;
    Promise.all([fetchSettings(), fetchSessionTypes()])
      .then(([s, t]) => {
        setSettings(s);
        setTypes(t);
        // A link from the pricing section can preselect a session and skip straight to the calendar.
        const pre = t.find((x) => x.slug === search.type);
        if (pre) {
          setType(pre);
          setStep(2);
        }
      })
      .catch((e) => setLoadError(errorMessage(e, "The session list could not be loaded.")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On every step change (not on first load): scroll to the top and move focus to the step heading so screen reader
  // and keyboard users land on the new step rather than wherever the last button was.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    const id = window.setTimeout(() => headingRef.current?.focus({ preventScroll: true }), 50);
    return () => window.clearTimeout(id);
  }, [step]);

  const tz = settings.timezone;

  function reset() {
    setCreated(null);
    setSlot(null);
    setType(null);
    setDraft(null);
    setStep(1);
    void navigate({ to: "/book", search: {}, replace: true });
  }

  return (
    <>
      <Nav solid />
      <main className="mx-auto min-h-dvh max-w-6xl px-4 pb-24 pt-28 sm:px-6">
        {step < 4 && (
          <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Book a session</p>
              <h1 ref={headingRef} tabIndex={-1} className="display mt-2 text-[clamp(1.85rem,3.4vw,2.6rem)] text-cream outline-none">
                {STEP_HEADINGS[step]}
              </h1>
            </div>
            <Stepper step={step} />
          </header>
        )}

        {loadError && (
          <div className="card-2 border-red/40 p-5 text-[15px] text-fog" role="alert">
            {loadError} Message {site.instagramHandle} on Instagram.
          </div>
        )}

        {!loadError && types === null && (
          <div className="flex items-center gap-3 py-20 text-fog" aria-live="polite">
            <Spinner /> Loading sessions
          </div>
        )}

        {types && step === 1 && (
          <ChooseType
            types={types}
            selected={type}
            onSelect={(t) => {
              setType(t);
              setSlot(null);
              setDraft(null);
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
            onChangeSession={() => setStep(1)}
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
            location={settings.location || site.location}
            initial={draft}
            onDraftChange={setDraft}
            onChangeSession={() => setStep(1)}
            onChangeTime={() => setStep(2)}
            onDone={(b) => {
              setCreated(b);
              setDraft(null);
              setStep(4);
            }}
            onSlotTaken={() => {
              setSlot(null);
              setStep(2);
            }}
          />
        )}

        {created && type && step === 4 && (
          <Confirmation booking={created} settings={settings} forKids={type.for_kids} headingRef={headingRef} onBookAnother={reset} />
        )}
      </main>
      <Footer />
    </>
  );
}

/* ---------------------------------------------------------------- stepper */
function Stepper({ step }: { step: Step }) {
  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <p className="label-caps text-fog">
        Step {step} of {STEPS.length}
      </p>
      <ol className="flex items-center gap-2" aria-label="Booking steps">
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
                {state === "done" ? <Check className="size-4" aria-hidden /> : n}
                <span className="sr-only">
                  {label}
                  {state === "done" ? ", completed" : state === "current" ? ", current step" : ""}
                </span>
              </span>
              <span className={cn("label-caps hidden sm:inline", state === "current" && "text-cream")} aria-hidden>
                {label}
              </span>
              {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-line-strong" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------------------------------------------------------------- step 1 */
function ChooseType({ types, selected, onSelect }: { types: SessionType[]; selected: SessionType | null; onSelect: (t: SessionType) => void }) {
  return (
    <div>
      <p className="mb-5 max-w-2xl text-[15px] leading-relaxed text-fog">
        All sessions are 1-on-1 at {site.gym}. Nothing is paid online.
      </p>
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
                <span className="display-md block text-[22px] text-cream">{t.name}</span>
                {t.tagline && <span className="mt-1 block text-[14px] text-fog">{t.tagline}</span>}
              </div>
              {t.for_kids && (
                <span className="shrink-0 rounded-full bg-gold-soft px-2.5 py-1 font-display text-[12px] font-700 text-gold">
                  Ages 7+
                </span>
              )}
            </div>
            {t.description && <span className="mt-4 block text-[15px] leading-relaxed text-fog">{t.description}</span>}
            <div className="mt-6 flex w-full items-end justify-between">
              <div>
                <span className="display text-[30px] text-cream">{fmtMoney(t.price_cents)}</span>
                <span className="ml-2 text-[13px] text-mute">{t.duration_min} minutes</span>
              </div>
              <span className="btn btn-soft btn-sm group-hover:bg-red group-hover:text-white group-hover:border-red" aria-hidden>
                Choose <ArrowRight className="size-4" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- step 2 */
function ChooseTime({
  type,
  settings,
  selected,
  onSelect,
  onChangeSession,
}: {
  type: SessionType;
  settings: Settings;
  selected: Slot | null;
  onSelect: (s: Slot) => void;
  onChangeSession: () => void;
}) {
  const tz = settings.timezone;
  const today = todayLocal(tz);
  const lastDay = addDays(today, settings.max_advance_days);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState(monthOf(selected?.day ?? today));
  const [day, setDay] = useState<string | null>(selected?.day ?? null);
  const [pending, setPending] = useState<Slot | null>(selected);

  useEffect(() => {
    setSlots(null);
    fetchSlots(type.id, today, lastDay)
      .then((s) => {
        setSlots(s);
        // A time chosen earlier (via "Change time") may have been booked by someone else in the meantime.
        if (pending && !s.some((x) => x.starts_at === pending.starts_at)) {
          setPending(null);
          toast.error("That time is no longer available. Please choose another.");
        }
        if (!day) {
          const first = s[0]?.day;
          if (first) {
            setDay(first);
            setMonth(monthOf(first));
          }
        }
      })
      .catch((e) => setError(errorMessage(e, "Availability could not be loaded.")));
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
  const loading = slots === null && !error;

  function chooseDay(c: string) {
    setDay(c);
    setPending(null);
    // On narrow screens the times card sits below the calendar, so bring it into view after a tap.
    if (window.innerWidth < 1024) document.getElementById("choose-time-section")?.scrollIntoView({ block: "start" });
  }

  return (
    <div>
      {/* selected session, with a way back */}
      <div className="card-2 mb-6 flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className="text-[15px] text-fog">
          <span className="label-caps mr-2">Session</span>
          <span className="font-semibold text-cream">{type.name}</span>
          <span className="text-mute">
            {" "}
            · {type.duration_min} minutes · {fmtMoney(type.price_cents)}
          </span>
        </p>
        <button
          type="button"
          onClick={onChangeSession}
          className="-mx-2 inline-flex min-h-11 items-center px-2 text-[14px] font-semibold text-cream underline underline-offset-4 hover:text-gold"
        >
          Change session
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* calendar */}
        <section className="card p-4 sm:p-6" aria-labelledby="choose-date-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="choose-date-heading" className="display-md text-[20px] text-cream">
              {monthLabel(month)}
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                className="grid size-11 place-items-center rounded-md border border-line text-fog hover:text-cream disabled:opacity-30"
                onClick={() => setMonth(addMonths(month, -1))}
                disabled={month <= firstMonth}
                aria-label="Previous month"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                className="grid size-11 place-items-center rounded-md border border-line text-fog hover:text-cream disabled:opacity-30"
                onClick={() => setMonth(addMonths(month, 1))}
                disabled={month >= lastMonth}
                aria-label="Next month"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center sm:gap-1">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
              <span key={d} className="label-caps py-2" aria-hidden>
                {d}
              </span>
            ))}
            {cells.map((c, i) => {
              if (c === null) return <span key={`b${i}`} />;
              const available = byDay.has(c);
              const isToday = c === today;
              return (
                <button
                  key={c}
                  type="button"
                  disabled={!available}
                  aria-pressed={day === c}
                  aria-label={`${fmtDayString(c)}${isToday ? ", today" : ""}${available ? ", times available" : ", no times available"}`}
                  onClick={() => chooseDay(c)}
                  className={cn(
                    "relative mx-auto grid aspect-square min-h-11 w-full place-items-center rounded-md text-[15px] font-semibold tnum transition-colors sm:max-w-12",
                    available ? "bg-ink-2 text-cream hover:bg-surface-3" : "text-faint",
                    day === c && "bg-red text-white hover:bg-red",
                    // Today is marked with a short underline so it never looks like the gold focus ring.
                    isToday && day !== c && "after:absolute after:bottom-1.5 after:h-0.5 after:w-4 after:rounded-full after:bg-cream/50",
                  )}
                >
                  {Number(c.slice(-2))}
                  {available && day !== c && <span className="absolute bottom-1 size-1 rounded-full bg-gold" aria-hidden />}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-col gap-1.5 text-[13px] text-mute">
            <p className="flex items-center gap-2">
              <span className="inline-block size-1.5 rounded-full bg-gold" aria-hidden /> A dot marks a day with open times.
            </p>
            <p>
              All times are {cityName(tz)} time. Sessions are {type.duration_min} minutes.
            </p>
          </div>
          <div aria-live="polite">
            {loading && (
              <div className="mt-3 flex flex-col gap-2">
                <p className="flex items-center gap-2 text-[13px] text-fog">
                  <Spinner className="size-4" /> Checking availability
                </p>
                <div className="grid grid-cols-4 gap-2" aria-hidden>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <span key={i} className="h-11 animate-pulse rounded-md bg-surface-2" />
                  ))}
                </div>
              </div>
            )}
            {slots && slots.length === 0 && (
              <p className="mt-3 text-[14px] text-fog">
                No open times in the next {settings.max_advance_days} days. Message {site.instagramHandle} on Instagram.
              </p>
            )}
          </div>
          {error && (
            <p className="mt-3 text-[14px] text-[#ff7a7f]" role="alert">
              {error}
            </p>
          )}
        </section>

        {/* times */}
        <section id="choose-time-section" className="flex scroll-mt-24 flex-col" aria-labelledby="choose-time-heading">
          <div className="card flex-1 p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 id="choose-time-heading" className="display-md text-[20px] text-cream">
                {day ? fmtDayString(day) : "Choose a date first"}
              </h2>
              <span className="shrink-0 rounded-full bg-surface-3 px-3 py-1 text-[13px] text-fog">{type.duration_min} min</span>
            </div>

            {day && !loading && daySlots.length === 0 && <p className="text-[15px] text-fog">No times are open on this day. Try another date.</p>}

            {(["Morning", "Afternoon", "Evening"] as const).map((part) =>
              grouped[part]?.length ? (
                <div key={part} className="mb-5">
                  <p className="label-caps mb-2" id={`part-${part}`}>
                    {part}
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="group" aria-labelledby={`part-${part}`}>
                    {grouped[part].map((s) => (
                      <button
                        key={s.starts_at}
                        type="button"
                        className="chip"
                        aria-pressed={pending?.starts_at === s.starts_at}
                        aria-label={`${fmtTime(s.starts_at, tz)} to ${fmtTime(s.ends_at, tz)}`}
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
            <Button variant="ghost" onClick={onChangeSession}>
              <ArrowLeft className="size-4" /> Back
            </Button>
            <Button disabled={!pending} onClick={() => pending && onSelect(pending)}>
              {pending ? `Continue with ${fmtTime(pending.starts_at, tz)}` : "Continue"} <ArrowRight className="size-4" />
            </Button>
          </div>
          {!pending && <p className="mt-2 text-right text-[13px] text-mute">Choose a time to continue.</p>}
        </section>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- step 3 */
type FormState = {
  name: string;
  phone: string;
  email: string;
  experience: string;
  childName: string;
  childAge: string;
  goals: string;
  notes: string;
};
const EMPTY_FORM: FormState = { name: "", phone: "", email: "", experience: "", childName: "", childAge: "", goals: "", notes: "" };
type FormErrors = Partial<Record<keyof FormState, string>>;

/** Name, email and mobile from the last booking on this device. Experience is not restored: it differs per person. */
function loadSaved(): FormState {
  try {
    const saved = localStorage.getItem("dmt.client");
    if (!saved) return EMPTY_FORM;
    const { name = "", email = "", phone = "" } = JSON.parse(saved) as Partial<FormState>;
    return { ...EMPTY_FORM, name, email, phone };
  } catch {
    return EMPTY_FORM;
  }
}

function Details({
  type,
  slot,
  tz,
  location,
  initial,
  onDraftChange,
  onChangeSession,
  onChangeTime,
  onDone,
  onSlotTaken,
}: {
  type: SessionType;
  slot: Slot;
  tz: string;
  location: string;
  initial: FormState | null;
  onDraftChange: (f: FormState) => void;
  onChangeSession: () => void;
  onChangeTime: () => void;
  onDone: (b: CreatedBooking) => void;
  onSlotTaken: () => void;
}) {
  const forKids = type.for_kids;
  const [form, setForm] = useState<FormState>(() => initial ?? loadSaved());
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  // Keep the parent's draft in step so a trip back to step 1 or 2 does not lose what was typed.
  useEffect(() => {
    onDraftChange(form);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  // The error summary only mounts after the render that sets `errors`, so focus it from an effect rather than
  // synchronously in submit(); otherwise the ref is still null on the first failed submit. A single scrollIntoView
  // with scroll-mt-24 on the element keeps it clear of the fixed nav (a second scrollBy would fight the smooth scroll).
  useEffect(() => {
    if (!Object.keys(errors).length) return;
    const el = summaryRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: "start" });
  }, [errors]);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function focusField(k: string) {
    const el = document.getElementById(`f-${k}`);
    el?.focus();
    el?.scrollIntoView({ block: "center" });
  }

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (form.name.trim().length < 2) e.name = forKids ? "Enter the parent or guardian's name." : "Enter your name.";
    if (form.phone && form.phone.replace(/[^\d+]/g, "").length < 8) e.phone = "Enter a valid mobile number.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) e.email = "Enter a valid email address.";
    if (!form.experience) e.experience = forKids ? "Choose the option closest to your child's experience." : "Choose the option closest to your experience.";
    if (forKids) {
      if (!form.childName.trim()) e.childName = "Enter your child's name.";
      const age = Number(form.childAge);
      if (!form.childAge.trim() || !Number.isInteger(age) || age < 1 || age > 17) e.childAge = "Enter your child's age.";
      else if (age < 7) e.childAge = "Kids sessions are for ages 7 and up.";
    }
    return e;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    try {
      try {
        localStorage.setItem("dmt.client", JSON.stringify({ name: form.name, email: form.email, phone: form.phone }));
      } catch {
        /* ignore */
      }
      // Kids bookings carry the child's name and age as a leading "Child: ..." line in notes; the coach dashboard splits it back out.
      const childLine = forKids ? `Child: ${form.childName.trim()}, age ${form.childAge.trim()}` : "";
      const b = await createBooking({
        sessionTypeId: type.id,
        startsAt: slot.starts_at,
        name: form.name,
        email: form.email,
        phone: form.phone,
        experience: form.experience,
        goals: form.goals,
        notes: forKids ? `${childLine}\n${form.notes}`.trimEnd() : form.notes,
      });
      onDone(b);
    } catch (err) {
      const msg = errorMessage(err);
      if (/no longer available|just taken/i.test(msg)) {
        toast.error("That time was just booked by someone else. Please choose another time.");
        onSlotTaken();
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const errorList = Object.entries(errors);
  const describedBy = (k: keyof FormState) => (errors[k] ? `f-${k}-error` : `f-${k}-hint`);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={submit} noValidate className="card flex flex-col gap-5 p-5 sm:p-7">
        {errorList.length > 0 && (
          // Focused from the effect above; each field also announces its own error, so no role="alert" here.
          <div ref={summaryRef} tabIndex={-1} className="scroll-mt-24 rounded-md border border-red/40 bg-red-soft p-4 outline-none">
            <p className="font-semibold text-cream">Please check the following</p>
            <ul className="mt-1 list-disc pl-5 text-[14px] text-fog">
              {errorList.map(([k, v]) => (
                <li key={k}>
                  <a
                    href={`#f-${k}`}
                    className="underline"
                    onClick={(e) => {
                      e.preventDefault();
                      focusField(k);
                    }}
                  >
                    {v}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[13px] text-mute">Nothing has been sent yet.</p>
          </div>
        )}

        {forKids && (
          // TODO: confirm kids supervision policy with Declan
          <p className="text-[15px] leading-relaxed text-fog">
            Your details first, then your child's.
          </p>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="f-name" label={forKids ? "Parent or guardian's name" : "Your name"} error={errors.name}>
            <Input
              id="f-name"
              autoComplete="name"
              value={form.name}
              onChange={set("name")}
              invalid={!!errors.name}
              aria-describedby={errors.name ? "f-name-error" : undefined}
              placeholder={forKids ? "Your name" : "First and last name"}
            />
          </Field>
          <Field id="f-phone" label="Mobile" error={errors.phone} optional hint="For updates about this booking.">
            <Input
              id="f-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={set("phone")}
              invalid={!!errors.phone}
              aria-describedby={describedBy("phone")}
              placeholder="04xx xxx xxx"
            />
          </Field>
          {/* TODO: no confirmation email is sent yet. Once email sending is set up, update this hint to say the confirmation goes here. */}
          <Field id="f-email" label="Email" error={errors.email} hint="For updates about this booking.">
            <Input
              id="f-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={form.email}
              onChange={set("email")}
              invalid={!!errors.email}
              aria-describedby={describedBy("email")}
              placeholder="you@example.com"
            />
          </Field>
          <Field id="f-experience" label={forKids ? "Your child's experience" : "Your experience"} error={errors.experience} hint={undefined}>
            <Select
              id="f-experience"
              value={form.experience}
              onChange={set("experience")}
              aria-invalid={!!errors.experience}
              aria-describedby={describedBy("experience")}
            >
              <option value="">Choose one</option>
              {site.experienceOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
          {forKids && (
            <>
              <Field id="f-childName" label="Child's name" error={errors.childName}>
                <Input
                  id="f-childName"
                  value={form.childName}
                  onChange={set("childName")}
                  invalid={!!errors.childName}
                  aria-describedby={errors.childName ? "f-childName-error" : undefined}
                  maxLength={80}
                />
              </Field>
              <Field id="f-childAge" label="Child's age" error={errors.childAge} hint="Kids sessions are for ages 7 and up.">
                <Input
                  id="f-childAge"
                  type="number"
                  inputMode="numeric"
                  min={7}
                  max={17}
                  value={form.childAge}
                  onChange={set("childAge")}
                  invalid={!!errors.childAge}
                  aria-describedby={describedBy("childAge")}
                />
              </Field>
            </>
          )}
        </div>

        <Field
          id="f-goals"
          label={forKids ? "What would you like your child to get out of training?" : "What would you like to get out of training?"}
          optional
          hint="For example fitness, technique or confidence."
        >
          <Textarea id="f-goals" value={form.goals} onChange={set("goals")} aria-describedby="f-goals-hint" maxLength={1000} />
        </Field>
        <Field
          id="f-notes"
          label="Anything else"
          optional
          hint={`Injuries or anything ${site.coach} should know.`}
        >
          <Textarea id="f-notes" value={form.notes} onChange={set("notes")} aria-describedby="f-notes-hint" className="min-h-[80px]" maxLength={1000} />
        </Field>

        <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="ghost" onClick={onChangeTime}>
            <ArrowLeft className="size-4" /> Back
          </Button>
          <Button type="submit" loading={submitting} className="sm:min-w-[240px]">
            Send booking request <ArrowRight className="size-4" />
          </Button>
        </div>
        <p className="text-[13px] leading-relaxed text-mute">
          {site.paymentNote} {site.cancelNote}
        </p>
      </form>

      <aside className="card h-fit p-5 sm:p-6 lg:sticky lg:top-24" aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="display-md text-[22px] text-cream">
          Your booking
        </h2>
        <dl className="mt-4 flex flex-col gap-3 text-[15px]">
          <SummaryRow label="Session" value={type.name} onChange={onChangeSession} />
          <SummaryRow label="Date" value={fmtDateLong(slot.starts_at, tz)} onChange={onChangeTime} />
          <SummaryRow label="Time" value={<span className="tnum">{fmtRange(slot.starts_at, slot.ends_at, tz)}</span>} onChange={onChangeTime} />
          <SummaryRow label="Where" value={location} />
          <SummaryRow label="Price" value={<span className="display-md text-[22px]">{fmtMoney(type.price_cents)}</span>} last />
        </dl>
        <p className="mt-4 text-[13px] text-mute">Payment is arranged with {site.coach}.</p>
      </aside>
    </div>
  );
}

function SummaryRow({ label, value, onChange, last }: { label: string; value: React.ReactNode; onChange?: () => void; last?: boolean }) {
  return (
    <div className={cn("flex items-start justify-between gap-4", !last && "hairline-b pb-3")}>
      <dt className="text-fog">{label}</dt>
      <dd className="flex items-start justify-end gap-3 text-right text-cream">
        <span>{value}</span>
        {onChange && (
          <button
            type="button"
            onClick={onChange}
            className="-my-3 -mr-2 inline-flex min-h-11 shrink-0 items-center px-2 text-[13px] font-semibold text-mute underline underline-offset-4 hover:text-gold"
            aria-label={`Change ${label.toLowerCase()}`}
          >
            Change
          </button>
        )}
      </dd>
    </div>
  );
}

/* ---------------------------------------------------------------- step 4 */
function Confirmation({
  booking,
  settings,
  forKids,
  headingRef,
  onBookAnother,
}: {
  booking: CreatedBooking;
  settings: Settings;
  forKids: boolean;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onBookAnother: () => void;
}) {
  const tz = settings.timezone;
  const title = `Muay Thai with ${site.coach}: ${booking.session_name}`;
  const manageUrl = `${window.location.origin}/booking/${booking.token}`;
  const details = `${booking.session_name} with ${site.coach}. Manage your booking: ${manageUrl}`;
  const confirmed = booking.status === "confirmed";
  const location = settings.location || site.location;

  function copyLink() {
    navigator.clipboard
      .writeText(manageUrl)
      .then(() => toast.success("Manage link copied."))
      .catch(() => toast.error("The link could not be copied. You can select and copy it instead."));
  }

  return (
    <div className="mx-auto max-w-2xl animate-rise">
      <div className="card overflow-hidden">
        <div className="stripe-red h-2 opacity-80" aria-hidden />
        <div className="p-6 sm:p-10">
          <span className="grid size-14 place-items-center rounded-full bg-green-soft text-green">
            <Check className="size-7" aria-hidden />
          </span>
          <p className="eyebrow mt-6">{confirmed ? "Confirmed" : "Request received"}</p>
          <h1 ref={headingRef} tabIndex={-1} className="display mt-2 text-[clamp(1.85rem,3.4vw,2.6rem)] text-cream outline-none">
            {confirmed ? "Booking confirmed" : "Booking request received"}
          </h1>
          <p className="mt-4 text-[16px] leading-relaxed text-fog">
            {confirmed
              ? "Your session is booked. Save the manage link below to check or cancel it later."
              : `${site.coach} will confirm your request. Save the manage link below to check or cancel it later.`}
          </p>

          <dl className="mt-8 grid gap-4 rounded-xl bg-ink-2 p-5 sm:grid-cols-2">
            <div>
              <dt className="label-caps">Session</dt>
              <dd className="mt-1 text-[16px] font-semibold text-cream">{booking.session_name}</dd>
            </div>
            <div>
              <dt className="label-caps">Price</dt>
              <dd className="mt-1 text-[16px] font-semibold text-cream">
                {fmtMoney(booking.price_cents)} <span className="font-medium text-fog">paid directly to {site.coach}</span>
              </dd>
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
                <MapPin className="mt-1 size-4 shrink-0 text-mute" aria-hidden /> {location}
              </dd>
            </div>
          </dl>

          {/* TODO: no confirmation email is sent yet, so this page is the only place the manage link appears. */}
          <div className="mt-6 rounded-xl border border-line p-4">
            <p className="text-[14px] font-semibold text-cream">Your manage link</p>
            <p className="mt-1 break-all text-[14px] text-fog select-all">{manageUrl}</p>
            <button type="button" onClick={copyLink} className="btn btn-soft btn-sm mt-3">
              <Copy className="size-4" aria-hidden /> Copy link
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={googleCalendarUrl({ title, start: booking.starts_at, end: booking.ends_at, details, location })}
              target="_blank"
              rel="noreferrer"
              className="btn btn-soft btn-sm"
            >
              <CalendarPlus className="size-4" aria-hidden /> Add to Google Calendar
            </a>
            <a
              href={icsFile({ title, start: booking.starts_at, end: booking.ends_at, details, location, uid: booking.id })}
              download="declan-muay-thai.ics"
              className="btn btn-soft btn-sm"
            >
              <CalendarPlus className="size-4" aria-hidden /> Add to Apple or Outlook calendar
            </a>
            <Link to="/booking/$token" params={{ token: booking.token }} className="btn btn-soft btn-sm">
              <ExternalLink className="size-4" aria-hidden /> Manage this booking
            </Link>
          </div>

          <p className="mt-8 text-[14px] text-fog">To cancel, use the manage link above.</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/" className="btn btn-ghost">
              Back to home
            </Link>
            <button type="button" className="btn btn-primary" onClick={onBookAnother}>
              Book another session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
