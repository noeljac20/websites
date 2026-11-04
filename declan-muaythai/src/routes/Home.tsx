import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Check, Clock, Medal, Users } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";
import { site } from "@/lib/site";
import { FALLBACK_SESSION_TYPES, fetchSessionTypes, type SessionType } from "@/lib/booking";
import { fmtMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export function HomePage() {
  useEffect(() => {
    document.title = `${site.name} — Private Muay Thai Coaching, Melbourne`;
  }, []);
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <SessionSection />
        <Pricing />
        <About />
        <Results />
        <HowToBook />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <MobileBookBar />
    </>
  );
}

/* ================================================================ HERO */
function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink">
      <picture className="absolute inset-0 -z-10">
        <source srcSet="/images/declan-kick.webp" type="image/webp" />
        <img
          src="/images/declan-kick.jpg"
          alt="Declan landing a high kick during a Muay Thai bout"
          className="h-full w-full object-cover object-[62%_30%] motion-safe:animate-drift"
          fetchPriority="high"
        />
      </picture>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(10,10,11,0.75)_0%,rgba(10,10,11,0.15)_38%,rgba(10,10,11,0.55)_68%,#0a0a0b_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(10,10,11,0.7)_0%,rgba(10,10,11,0)_60%)]" />

      <div className="mx-auto mt-auto w-full max-w-6xl px-4 pb-10 pt-32 sm:px-6 sm:pb-16">
        <div className="max-w-3xl">
          <p className="eyebrow animate-rise mb-5 flex items-center gap-3">
            <span className="h-px w-8 bg-gold" /> {site.hero.eyebrow}
          </p>
          <h1 className="display animate-rise text-[clamp(2.6rem,6vw,4.6rem)] text-cream [animation-delay:80ms]">
            {site.hero.headline.map((line, i) => (
              <span key={line} className={cn("block", i === site.hero.headline.length - 1 && "text-red")}>
                {line}
              </span>
            ))}
          </h1>
          <p className="animate-rise mt-6 max-w-xl text-[16px] leading-relaxed text-fog [animation-delay:160ms] sm:text-[17px]">
            {site.hero.sub}
          </p>
          <div className="animate-rise mt-8 flex flex-col gap-3 sm:flex-row sm:items-center [animation-delay:240ms]">
            <Link to="/book" className="btn btn-primary">
              Book a session <ArrowRight className="size-5" />
            </Link>
            <a href="#pricing" className="btn btn-ghost">
              See pricing
            </a>
          </div>
        </div>

        <dl className="animate-rise mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4 [animation-delay:320ms]">
          {site.stats.map((s) => (
            <div key={s.label} className="flex flex-col bg-ink/70 px-5 py-4 backdrop-blur-sm">
              <dt className="order-2 label-caps">{s.label}</dt>
              <dd className="order-1 display-md text-[26px] text-cream">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ================================================================ MARQUEE */
function Marquee() {
  const items = [...site.marquee, ...site.marquee];
  return (
    <div className="relative overflow-hidden bg-ink-2 py-3 hairline-t hairline-b" aria-hidden>
      <div className="flex w-max motion-safe:animate-marquee">
        {items.map((t, i) => (
          <span key={i} className="label-caps mx-5 flex items-center gap-5 text-[12px] text-fog">
            {t} <span className="size-1 rounded-full bg-red" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ================================================================ SESSION */
function SessionSection() {
  return (
    <section id="session" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading eyebrow={site.session.eyebrow} title={site.session.title} />
        </Reveal>
        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {site.session.steps.map((s, i) => (
            <Reveal key={s.n} as="li" delay={i * 90} className="card group relative overflow-hidden p-7">
              <span className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,var(--color-red),transparent)] opacity-0 transition-opacity group-hover:opacity-100" />
              <p className="eyebrow">{s.n}</p>
              <h3 className="display-md mt-3 text-[22px] text-cream">{s.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-fog">{s.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ================================================================ PRICING */
function Pricing() {
  const [types, setTypes] = useState<SessionType[] | null>(null);
  useEffect(() => {
    fetchSessionTypes()
      .then((t) => setTypes(t.length ? t : FALLBACK_SESSION_TYPES))
      .catch(() => setTypes(FALLBACK_SESSION_TYPES));
  }, []);
  const list = types ?? FALLBACK_SESSION_TYPES;

  return (
    <section id="pricing" className="scroll-mt-20 bg-ink-2 py-20 hairline-t sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading eyebrow="Pricing" title="Simple. No lock-in." body="Pay per session or grab a pack. Everything is one-on-one unless you bring a mate." />
          <p className="label-caps shrink-0">Pay on the day · cash or transfer</p>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {list.map((t, i) => {
            const each = t.sessions_included > 1 ? Math.round(t.price_cents / t.sessions_included) : null;
            return (
              <Reveal
                key={t.id}
                delay={i * 70}
                className={cn(
                  "card relative flex flex-col p-6 transition-transform duration-300 hover:-translate-y-1",
                  t.is_featured && "border-red/60 shadow-glow-red lg:-mt-3 lg:mb-3",
                )}
              >
                {t.is_featured && (
                  <span className="absolute -top-3 left-6 rounded-full bg-red px-3 py-1 font-display text-[11px] font-700 uppercase tracking-[0.18em] text-white">
                    Most popular
                  </span>
                )}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="display-md text-[21px] text-cream">{t.name}</h3>
                    {t.tagline && <p className="mt-1 text-[14px] text-fog">{t.tagline}</p>}
                  </div>
                  {t.sessions_included > 1 ? (
                    <Users className="size-5 shrink-0 text-mute" aria-hidden />
                  ) : (
                    <Clock className="size-5 shrink-0 text-mute" aria-hidden />
                  )}
                </div>
                <div className="mt-6 flex items-end gap-2">
                  <span className="display text-[38px] text-cream">{fmtMoney(t.price_cents)}</span>
                  <span className="mb-2 text-[13px] text-mute">
                    {t.sessions_included > 1 ? `${t.sessions_included} sessions` : `${t.duration_min} min`}
                  </span>
                </div>
                {each !== null && <p className="text-[13px] text-gold">{fmtMoney(each)} per session</p>}
                <ul className="mt-6 flex flex-col gap-2.5 text-[14px] text-fog">
                  {t.features.map((f) => (
                    <li key={f} className="flex gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/book"
                  search={{ type: t.slug }}
                  className={cn("btn mt-8 w-full", t.is_featured ? "btn-primary" : "btn-soft")}
                >
                  {t.sessions_included > 1 ? "Book first session" : "Book now"}
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================================================================ ABOUT */
function About() {
  return (
    <section id="about" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal className="relative">
          <div className="relative overflow-hidden rounded-2xl">
            <picture>
              <source srcSet="/images/declan-podium.webp" type="image/webp" />
              <img
                src="/images/declan-podium.jpg"
                alt="Declan wearing a gold medal beside his coach at the Muay Thai Australia National Championships"
                className="aspect-[4/5] w-full object-cover object-top"
                loading="lazy"
              />
            </picture>
            <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(10,10,11,0.85))] p-5 pt-20">
              <p className="flex items-center gap-2 font-display text-[14px] font-600 uppercase tracking-[0.18em] text-gold">
                <Medal className="size-4" /> National Championships 2026
              </p>
            </div>
          </div>
          <div className="pointer-events-none absolute -left-3 -top-3 -z-10 h-full w-full rounded-2xl border border-red/40" aria-hidden />
        </Reveal>

        <Reveal delay={120}>
          <SectionHeading eyebrow={site.about.eyebrow} title={site.about.title} />
          <div className="mt-6 flex flex-col gap-4 text-[16px] leading-relaxed text-fog">
            {site.about.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {site.about.highlights.map((h) => (
              <li key={h} className="card-2 flex items-center gap-3 px-4 py-3 text-[14px] text-cream">
                <span className="size-1.5 shrink-0 rounded-full bg-red" /> {h}
              </li>
            ))}
          </ul>
          <blockquote className="mt-8 border-l-2 border-gold pl-5 font-display text-[20px] font-600 leading-snug text-cream">
            “{site.about.quote}”
          </blockquote>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================ RESULTS */
function Results() {
  return (
    <section className="relative isolate overflow-hidden py-24 sm:py-36">
      <picture className="absolute inset-0 -z-10">
        <source srcSet="/images/declan-win.webp" type="image/webp" />
        <img
          src="/images/declan-win.jpg"
          alt="Referee raising Declan's hand after a win"
          className="h-full w-full object-cover object-[50%_25%]"
          loading="lazy"
        />
      </picture>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#0a0a0b_0%,rgba(10,10,11,0.35)_40%,rgba(10,10,11,0.5)_70%,#0a0a0b_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(10,10,11,0.85)_0%,rgba(10,10,11,0.55)_45%,rgba(10,10,11,0)_75%)]" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="max-w-xl">
          <p className="eyebrow mb-4">Hand raised</p>
          <h2 className="display text-[clamp(1.9rem,4vw,3rem)] text-cream">
            Learn it from <br />
            <span className="text-red">someone who uses it.</span>
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-fog">
            Technique that works on pads is nice. Technique that works under pressure, against someone trying to hit you back, is the point. That's what you're buying.
          </p>
          <Link to="/book" className="btn btn-gold mt-8">
            Start training <ArrowUpRight className="size-5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================ HOW TO BOOK */
function HowToBook() {
  return (
    <section className="bg-ink-2 py-20 hairline-t sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading eyebrow="How it works" title="Booked in under a minute." align="center" />
        </Reveal>
        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {site.howToBook.map((s, i) => (
            <Reveal key={s.title} as="li" delay={i * 90} className="flex items-start gap-5 rounded-xl p-2">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-red font-display text-[16px] font-700 text-white">
                {i + 1}
              </span>
              <div>
                <h3 className="display-md text-[20px] text-cream">{s.title}</h3>
                <p className="mt-1 text-[15px] text-fog">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
        <Reveal className="mt-10 text-center">
          <Link to="/book" className="btn btn-primary">
            Book a session <ArrowRight className="size-5" />
          </Link>
          <p className="mt-3 text-[13px] text-mute">{site.bookingNotice}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================ FAQ */
function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <SectionHeading eyebrow="FAQ" title="Questions people ask before their first session." />
        </Reveal>
        <Reveal delay={100} className="flex flex-col">
          {site.faq.map((f) => (
            <details key={f.q} className="group hairline-b py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-[16px] font-semibold text-cream [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line text-fog transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-5 pr-10 text-[15px] leading-relaxed text-fog">{f.a}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================ FINAL CTA */
function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-ink-2 py-20 hairline-t sm:py-24">
      <div className="pointer-events-none absolute -left-40 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-red/15 blur-3xl" aria-hidden />
      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p className="eyebrow">First session</p>
          <h2 className="display mt-3 text-[clamp(1.9rem,3.6vw,2.75rem)] text-cream">Ready when you are.</h2>
          <p className="mt-3 text-[16px] text-fog">Pick a time that suits you. No payment online, no lock-in, and {site.coach} confirms personally.</p>
        </div>
        <Link to="/book" className="btn btn-primary">
          Book your hour <ArrowRight className="size-5" />
        </Link>
      </div>
    </section>
  );
}

/* ================================================================ MOBILE BAR */
function MobileBookBar() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.7);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ink/90 p-3 backdrop-blur-md transition-transform duration-300 md:hidden",
        show ? "translate-y-0" : "translate-y-full",
      )}
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
    >
      <Link to="/book" className="btn btn-primary w-full">
        Book a session · $40
      </Link>
    </div>
  );
}
