# Declan Muay Thai

Private Muay Thai coaching site with online bookings and a coach dashboard.

- **Public site** (`/`): hero, a short explanation of Muay Thai and kickboxing, pricing (live from the database), about Declan, a two-photo band about training at The Headhunters Gym (win photo and team photo with his coach and training partners), two short training clips (pad work and a kids session; muted autoplay with a sound toggle, playing only while in view), how booking works, common questions.
- **Booking** (`/book`): pick a session, then a date and time from live availability, then details, then confirmation with calendar links and a manage link.
- **Manage booking** (`/booking/:token`): clients can view and cancel their own booking from the manage link shown on their confirmation page.
- **Coach dashboard** (`/coach`): today's overview, schedule (confirm / complete / no-show / cancel, private session notes, add walk-ins), clients with history and notes, weekly availability and days off, services and prices, booking settings.

## Stack

Vite + React 19 + TypeScript, Tailwind CSS v4, TanStack Router, Supabase (Postgres + Auth, row-level security).
Everything in the database is prefixed `mt_` so it can live alongside other projects in the same Supabase instance.

## Run locally

```bash
bun install          # or npm install
bun run dev          # http://localhost:5173
bun run build        # production build in dist/
```

`.env` holds the Supabase URL and publishable (anon) key. The anon key is safe to ship to the browser; row-level security and the `SECURITY DEFINER` functions in `supabase/migrations/` protect the data.

## Database

The schema is in `supabase/migrations/20261104210000_declan_booking_system.sql` and has already been applied to the project.
Public visitors can only call:

- `mt_available_slots(session_type, from, to)` – open slots
- `mt_create_booking(...)` – validated booking creation (checks availability, notice period, double-booking)
- `mt_get_booking(token)` / `mt_cancel_booking(token)` – manage a booking by its private token

Bookings and client records are only readable by the coach account.

## First-time coach setup

1. Open `/coach/login`. Because no coach exists yet, the page offers **Create coach account**.
2. Sign up with Declan's email and a password. The first account created becomes the coach (nobody else can claim it afterwards).
3. If Supabase email confirmation is on, confirm the email, then sign in.
4. In **Settings**, set the gym location (shown on the booking, confirmation and manage pages), timezone, slot interval, notice period and whether bookings auto-confirm. The live value is currently `The Headhunters Gym`; set it to `The Headhunters Gym, Melbourne` so it matches the public site (the suburb or street address still needs confirming with Declan).
5. In **Availability**, adjust the weekly windows (defaults: Mon to Fri 6 to 9am and 4 to 8pm, Sat 8am to 12pm. These are placeholders; set Declan's real hours before launch).
6. In **Services**, check the two services match Declan's offer: **1-on-1 Training** (`private-1on1`, 60 min, $40) and **Kids Training** (`kids-training`, ages 7+, 45 min, $30, flagged `for_kids`). There are no packs or partner sessions; don't add any without Declan's say-so.
7. The service copy and gym location in the database match `FALLBACK_SESSION_TYPES` in `src/lib/booking.ts` (migration `20261104230000_service_copy_and_location.sql`). Edit them in the **Services** and **Settings** tabs if they change.

## Content to confirm before launch

- The kids clip in `public/videos/session-kids.mp4` shows a child. Confirm with Declan that the parent or guardian is happy for it to be on the site before launch.

Editable copy lives in `src/lib/site.ts`. Facts taken from Declan's Instagram post (@declan.woods, https://instagram.com/declan.woods) are already in: The Headhunters Gym, $40 / 1 hour 1-on-1, $30 / 45 min kids (ages 7+), beginner and intermediate welcome, limited spots. The copy is written to be plain and professional: sentence case, no exclamation marks, and no quotations or testimonials anywhere on the site (keep it that way when editing). Items marked `TODO` still need Declan's input:

- contact email and phone
- the gym's suburb / street address (only "The Headhunters Gym, Melbourne" is known)
- the exact wording of the 2026 championship title and division
- how he prefers to be paid (the site only says nothing is paid online and payment is arranged directly with Declan)

## Deploy

It is a static single-page app. Deploy `dist/` to Vercel, Netlify or Cloudflare Pages:

- Vercel: import the repo, set **Root Directory** to `declan-muaythai`; `vercel.json` already rewrites all routes to `index.html`.
- Netlify: base directory `declan-muaythai`, build `bun run build` (or `npm run build`), publish `dist`; `public/_redirects` handles routing.

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as environment variables on the host (same values as `.env`).

## Not included yet

- Email / SMS notifications to Declan or the client (needs an email provider such as Resend). The dashboard has a Copy confirmation message button in the meantime, and the public copy says the manage link is shown on the confirmation page rather than emailed.
- Online payment. Payment is arranged directly with Declan; Stripe can be added later.
