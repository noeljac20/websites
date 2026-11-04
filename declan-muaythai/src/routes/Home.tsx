import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Check, Clock, Medal } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { SessionVideos } from "@/components/SessionVideos";
import { SectionHeading } from "@/components/ui";
import { site } from "@/lib/site";
import { FALLBACK_SESSION_TYPES, fetchSessionTypes, type SessionType } from "@/lib/booking";
import { fmtMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export function HomePage() {
  useEffect(() => {
    document.title = "Declan Woods | Muay Thai and kickboxing coaching in Pakenham";
  }, []);
  return (
    // Bottom padding on phones matches the fixed book bar so it never covers the last footer row (Coach login).
    <div className="pb-[calc(72px+env(safe-area-inset-bottom))] md:pb-0">
      <Nav />
      <main>
        <Hero />
        <SportSection />
        <Pricing />
        <About />
        <TrainingBand />
        <HowToBook />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <MobileBookBar />
    </div>
  );
}

/* ================================================================ HERO */
function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink">
      {/* Phones: photo across the top, text below it. Tablet and up: full-bleed photo behind the text. */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[62svh] overflow-hidden md:inset-0 md:h-auto">
      <picture className="absolute inset-0">
        {/* Phones get the portrait bag photo; the wide kick photo crops to just a leg on a tall screen. */}
        <source media="(max-width: 767px)" srcSet="/images/declan-bag.webp" type="image/webp" />
        <source media="(max-width: 767px)" srcSet="/images/declan-bag.jpg" type="image/jpeg" />
        <source srcSet="/images/declan-kick.webp" type="image/webp" />
        <img
          src="/images/declan-kick.jpg"
          alt="Declan training at The Headhunters Gym"
          className="h-full w-full object-cover object-[60%_20%] motion-safe:animate-drift md:object-[62%_30%]"
          fetchPriority="high"
        />
      </picture>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,11,0.55)_0%,rgba(10,10,11,0)_28%,rgba(10,10,11,0.2)_60%,#0a0a0b_100%)] md:bg-[linear-gradient(180deg,rgba(10,10,11,0.75)_0%,rgba(10,10,11,0.15)_38%,rgba(10,10,11,0.55)_68%,#0a0a0b_100%)]" />
      <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(10,10,11,0.7)_0%,rgba(10,10,11,0)_60%)] md:block" />
      </div>

      <div className="mx-auto mt-auto w-full max-w-6xl px-4 pb-10 pt-[46svh] sm:px-6 sm:pb-16 md:pt-32">
        <div className="max-w-3xl">
          <p className="eyebrow animate-rise mb-5 flex items-center gap-3">
            <span className="h-px w-8 bg-gold" /> {site.hero.eyebrow}
          </p>
          <h1 className="display animate-rise text-[clamp(2rem,4.2vw,3.3rem)] text-cream [animation-delay:80ms]">
            {site.hero.headline.map((line, i) => (
              <span key={line} className="sm:block">
                {i > 0 ? " " : ""}
                {line}
              </span>
            ))}
          </h1>
          <p className="animate-rise mt-5 max-w-lg text-[16px] leading-relaxed text-fog [animation-delay:160ms]">
            {site.hero.sub}
          </p>
          <div className="animate-rise mt-8 flex flex-col gap-3 sm:flex-row sm:items-center [animation-delay:240ms]">
            <Link to="/book" className="btn btn-primary">
              Book a session <ArrowRight className="size-5" />
            </Link>
            <a href="#pricing" className="btn btn-ghost">
              View pricing
            </a>
            {site.instagram && (
              <a
                href={site.instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center gap-1.5 px-1 text-[15px] font-semibold text-fog transition-colors hover:text-cream"
              >
                Instagram <ArrowUpRight className="size-4" />
              </a>
            )}
          </div>
          {site.limitedSpots && (
            <p className="animate-rise mt-5 flex items-center gap-2 text-[13px] text-mute [animation-delay:280ms]">
              <span className="size-1.5 rounded-full bg-gold" aria-hidden /> {site.limitedSpotsText}
            </p>
          )}
        </div>

        <dl className="animate-rise mt-12 grid grid-cols-2 gap-px overflow-hidden max-w-md rounded-xl border border-line bg-line [animation-delay:320ms]">
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

/* ================================================================ THE SPORT */
function SportSection() {
  return (
    <section id="muay-thai" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div>
            <Reveal>
              <SectionHeading eyebrow={site.sport.eyebrow} title={site.sport.title} />
            </Reveal>
            <div className="mt-10 flex flex-col gap-4">
              {site.sport.items.map((s, i) => (
                <Reveal key={s.title} delay={i * 90} className="card p-7">
                  <h3 className="display-md text-[22px] text-cream">{s.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-fog">{s.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal delay={120}>
            <Photo
              src="declan-ring"
              alt="Declan with training partners beside the ring at the gym"
              className="aspect-square object-[50%_60%]"
            />
          </Reveal>
        </div>
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
          <SectionHeading eyebrow={site.pricing.eyebrow} title={site.pricing.title} body={site.pricing.intro} />
          {site.pricing.note && <p className="shrink-0 text-[13px] text-mute md:text-right">{site.pricing.note}</p>}
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-3xl gap-4 md:grid-cols-2">
          {list.map((t, i) => (
            <Reveal
              key={t.id}
              delay={i * 70}
              className={cn(
                "card relative flex flex-col p-6 transition-transform duration-300 hover:-translate-y-1",
                t.is_featured && "border-red/60 shadow-glow-red",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="display-md text-[21px] text-cream">{t.name}</h3>
                  {t.tagline && <p className="mt-1 text-[14px] text-fog">{t.tagline}</p>}
                </div>
                <Clock className="size-5 shrink-0 text-mute" aria-hidden />
              </div>
              <div className="mt-6 flex items-end gap-2">
                <span className="display text-[34px] text-cream">{fmtMoney(t.price_cents)}</span>
                <span className="mb-2 text-[13px] text-mute">{t.duration_min} minutes</span>
              </div>
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
                Book a session
              </Link>
            </Reveal>
          ))}
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
                alt="Declan on the podium wearing a gold medal at the 2026 Muay Thai Australia National Championships"
                className="aspect-[4/5] w-full object-cover object-top"
                loading="lazy"
              />
            </picture>
            <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(10,10,11,0.85))] p-5 pt-20">
              <p className="flex items-center gap-2 text-[14px] font-semibold text-gold">
                <Medal className="size-4" aria-hidden /> {site.about.podiumCaption}
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
          {site.about.fromInstagram.length > 0 && (
            <div className="mt-8 hairline-t pt-6">
              <p className="label-caps mb-3">From Declan</p>
              <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-fog">
                {site.about.fromInstagram.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>
          )}
          <ul className={cn("mt-8 grid gap-3 sm:grid-cols-2", site.about.highlights.length === 0 && "hidden")}>
            {site.about.highlights.map((h) => (
              <li key={h} className="card-2 flex items-center gap-3 px-4 py-3 text-[14px] text-cream">
                <span className="size-1.5 shrink-0 rounded-full bg-red" /> {h}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================ TRAINING AT THE GYM */
function TrainingBand() {
  return (
    <section className="bg-ink-2 py-20 hairline-t sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading eyebrow={site.training.eyebrow} title={site.training.title} body={site.training.body || undefined} />
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {site.training.photos.map((photo, i) => (
            <Reveal key={photo.src} delay={i * 90} as="div">
              <figure className="overflow-hidden rounded-2xl">
                <picture>
                  <source srcSet={`/images/${photo.src}.webp`} type="image/webp" />
                  <img
                    src={`/images/${photo.src}.jpg`}
                    alt={photo.alt}
                    className="aspect-[4/3] w-full object-cover object-[50%_30%] transition-transform duration-500 hover:scale-[1.02]"
                    loading="lazy"
                  />
                </picture>
              </figure>
            </Reveal>
          ))}
        </div>
        <Reveal delay={120} className="mt-6">
          <SessionVideos />
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================ HOW BOOKING WORKS */
function HowToBook() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading eyebrow={site.howToBook.eyebrow} title={site.howToBook.title} align="center" />
        </Reveal>
        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {site.howToBook.steps.map((s, i) => (
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
          <p className="text-[13px] text-mute">{site.howToBook.note}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================ QUESTIONS */
function Faq() {
  return (
    <section id="questions" className="scroll-mt-20 bg-ink-2 py-20 hairline-t sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <SectionHeading eyebrow={site.faq.eyebrow} title={site.faq.title} />
          <Photo
            src="declan-bag"
            alt="Declan working the heavy bag at The Headhunters Gym"
            className="mt-8 hidden aspect-[4/5] object-[50%_25%] lg:block"
          />
        </Reveal>
        <Reveal delay={100} className="flex flex-col">
          {site.faq.items.map((f) => (
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
    <section className="relative overflow-hidden py-20 hairline-t sm:py-24">
      <div className="pointer-events-none absolute -left-40 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-red/15 blur-3xl" aria-hidden />
      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p className="eyebrow">{site.finalCta.eyebrow}</p>
          <h2 className="display mt-3 text-[clamp(1.6rem,2.8vw,2.1rem)] text-cream">{site.finalCta.title}</h2>
          {site.finalCta.body && <p className="mt-3 text-[16px] text-fog">{site.finalCta.body}</p>}
        </div>
        <Link to="/book" className="btn btn-primary">
          Book a session <ArrowRight className="size-5" />
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
        Book a session
      </Link>
    </div>
  );
}

/* ================================================================ PHOTO */
function Photo({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <picture>
      <source srcSet={`/images/${src}.webp`} type="image/webp" />
      <img src={`/images/${src}.jpg`} alt={alt} loading="lazy" className={cn("w-full rounded-2xl object-cover", className)} />
    </picture>
  );
}
