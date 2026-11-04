# Declan Muay Thai

Private Muay Thai coaching site with online bookings and a coach dashboard.

- **Public site** (`/`): hero, what a session looks like, pricing (live from the database), about, results, how to book, FAQ.
- **Booking** (`/book`): pick a session → pick a date and time from live availability → details → confirmation with calendar links and a manage link.
- **Manage booking** (`/booking/:token`): clients can view and cancel their own booking from the link in their confirmation.
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
4. In **Settings**, set the gym location (sent with confirmations), timezone, slot interval, notice period and whether bookings auto-confirm.
5. In **Availability**, adjust the weekly windows (defaults: Mon–Fri 6–9am and 4–8pm, Sat 8am–12pm).
6. In **Services**, check prices. `$40 / 1 hour` is live; the pack prices are placeholders to confirm.

## Content to confirm before launch

Editable copy lives in `src/lib/site.ts`. Items marked `TODO` need Declan's input: contact email and phone, Instagram, gym name/address, the exact wording of the 2026 championship title and the "coaching since" year.

## Deploy

It is a static single-page app. Deploy `dist/` to Vercel, Netlify or Cloudflare Pages:

- Vercel: import the repo, set **Root Directory** to `declan-muaythai`; `vercel.json` already rewrites all routes to `index.html`.
- Netlify: base directory `declan-muaythai`, build `bun run build` (or `npm run build`), publish `dist`; `public/_redirects` handles routing.

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as environment variables on the host (same values as `.env`).

## Not included yet

- Email / SMS notifications to Declan or the client (needs an email provider such as Resend). The dashboard has a "copy confirmation text" button in the meantime.
- Online payment. Sessions are paid on the day; Stripe can be added later.
