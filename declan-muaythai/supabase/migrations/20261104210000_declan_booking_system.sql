-- Declan Muay Thai — booking system
-- All objects are prefixed mt_ so they coexist with other apps in the same Supabase project.

-- ---------- coach (admin) role ----------
create table if not exists public.mt_coaches (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.mt_coaches enable row level security;

create or replace function public.mt_is_coach() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.mt_coaches where user_id = auth.uid());
$$;

create policy "coach sees own row" on public.mt_coaches
  for select to authenticated using (user_id = auth.uid());

-- true once any coach account exists (used by the login page)
create or replace function public.mt_coach_exists() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.mt_coaches);
$$;

-- first signed-in user becomes the coach; afterwards returns whether caller is coach
create or replace function public.mt_claim_coach() returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  if not exists (select 1 from public.mt_coaches) then
    insert into public.mt_coaches(user_id) values (auth.uid());
  end if;
  return exists (select 1 from public.mt_coaches where user_id = auth.uid());
end $$;

-- ---------- settings (single row) ----------
create table if not exists public.mt_settings (
  id int primary key default 1 check (id = 1),
  timezone text not null default 'Australia/Melbourne',
  slot_interval_min int not null default 60 check (slot_interval_min between 15 and 240),
  min_notice_hours int not null default 12 check (min_notice_hours between 0 and 168),
  max_advance_days int not null default 42 check (max_advance_days between 1 and 365),
  buffer_min int not null default 0 check (buffer_min between 0 and 120),
  auto_confirm boolean not null default false,
  location text not null default 'Melbourne, VIC',
  updated_at timestamptz not null default now()
);
alter table public.mt_settings enable row level security;
insert into public.mt_settings (id) values (1) on conflict do nothing;
create policy "settings public read" on public.mt_settings for select using (true);
create policy "settings coach write" on public.mt_settings
  for update to authenticated using (public.mt_is_coach()) with check (public.mt_is_coach());

-- ---------- session types ----------
create table if not exists public.mt_session_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text,
  description text,
  duration_min int not null default 60 check (duration_min between 15 and 240),
  price_cents int not null check (price_cents >= 0),
  sessions_included int not null default 1 check (sessions_included >= 1),
  features text[] not null default '{}',
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.mt_session_types enable row level security;
create policy "session types public read" on public.mt_session_types
  for select using (is_active or public.mt_is_coach());
create policy "session types coach write" on public.mt_session_types
  for all to authenticated using (public.mt_is_coach()) with check (public.mt_is_coach());

insert into public.mt_session_types (slug, name, tagline, description, duration_min, price_cents, sessions_included, features, is_featured, sort_order) values
  ('private-1on1', '1:1 Private Session', 'The full hour, all on you.',
   'One hour of undivided coaching. Pad work, technique breakdown and fight IQ built around your level and what you want out of Muay Thai.',
   60, 4000, 1, array['Pad rounds built around you','Technique breakdown on video','Clinch, kicks, elbows, knees','All levels, complete beginners welcome'], true, 1),
  ('partner-2on1', '2-on-1 Partner Session', 'Bring a mate, split the cost.',
   'Train with a friend or training partner. Same coaching, shared hour, and a partner to drill with between rounds.',
   60, 6000, 1, array['Two people, one coach','Partner drills and sparring basics','Great for couples and mates','Split the price two ways'], false, 2),
  ('pack-5', '5-Session Pack', 'Build a habit.',
   'Five private sessions, used whenever suits you. Book your first session now and we lock the rest in together.',
   60, 18000, 5, array['Five private hours','Progress plan across the block','Priority booking','Valid for 3 months'], false, 3),
  ('pack-10', '10-Session Pack', 'Serious about it.',
   'Ten private sessions for people chasing a real change, a first fight, or a sharper game.',
   60, 34000, 10, array['Ten private hours','Fight-camp style structure','Priority booking','Valid for 6 months'], false, 4)
on conflict (slug) do nothing;

-- ---------- weekly availability ----------
create table if not exists public.mt_availability_rules (
  id uuid primary key default gen_random_uuid(),
  weekday smallint not null check (weekday between 0 and 6), -- 0 = Sunday
  start_time time not null,
  end_time time not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint mt_rule_window check (end_time > start_time)
);
alter table public.mt_availability_rules enable row level security;
create policy "availability public read" on public.mt_availability_rules for select using (true);
create policy "availability coach write" on public.mt_availability_rules
  for all to authenticated using (public.mt_is_coach()) with check (public.mt_is_coach());

insert into public.mt_availability_rules (weekday, start_time, end_time)
select w, s::time, e::time from (values
  (1,'06:00','09:00'),(1,'16:00','20:00'),
  (2,'06:00','09:00'),(2,'16:00','20:00'),
  (3,'06:00','09:00'),(3,'16:00','20:00'),
  (4,'06:00','09:00'),(4,'16:00','20:00'),
  (5,'06:00','09:00'),(5,'16:00','20:00'),
  (6,'08:00','12:00')
) as v(w,s,e)
where not exists (select 1 from public.mt_availability_rules);

-- ---------- blocked dates ----------
create table if not exists public.mt_blocked_dates (
  id uuid primary key default gen_random_uuid(),
  day date not null unique,
  reason text,
  created_at timestamptz not null default now()
);
alter table public.mt_blocked_dates enable row level security;
create policy "blocked public read" on public.mt_blocked_dates for select using (true);
create policy "blocked coach write" on public.mt_blocked_dates
  for all to authenticated using (public.mt_is_coach()) with check (public.mt_is_coach());

-- ---------- clients ----------
create table if not exists public.mt_clients (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  phone text,
  experience text,
  goals text,
  coach_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.mt_clients enable row level security;
create policy "clients coach only" on public.mt_clients
  for all to authenticated using (public.mt_is_coach()) with check (public.mt_is_coach());

-- ---------- bookings ----------
create table if not exists public.mt_bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.mt_clients(id) on delete set null,
  session_type_id uuid references public.mt_session_types(id) on delete set null,
  session_name text not null,
  price_cents int not null,
  duration_min int not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending','confirmed','completed','cancelled','no_show')),
  client_name text not null,
  client_email text not null,
  client_phone text,
  experience text,
  goals text,
  notes text,
  coach_notes text,
  source text not null default 'web' check (source in ('web','coach')),
  manage_token uuid not null default gen_random_uuid() unique,
  cancelled_by text,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mt_booking_window check (ends_at > starts_at),
  constraint mt_bookings_no_overlap
    exclude using gist (tstzrange(starts_at, ends_at, '[)') with &&) where (status <> 'cancelled')
);
create index if not exists mt_bookings_starts_at_idx on public.mt_bookings (starts_at);
create index if not exists mt_bookings_client_idx on public.mt_bookings (client_id);
alter table public.mt_bookings enable row level security;
create policy "bookings coach only" on public.mt_bookings
  for all to authenticated using (public.mt_is_coach()) with check (public.mt_is_coach());

create or replace function public.mt_touch_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists mt_bookings_touch on public.mt_bookings;
create trigger mt_bookings_touch before update on public.mt_bookings
  for each row execute function public.mt_touch_updated_at();
drop trigger if exists mt_clients_touch on public.mt_clients;
create trigger mt_clients_touch before update on public.mt_clients
  for each row execute function public.mt_touch_updated_at();

-- ---------- public RPCs ----------

-- open slots for a session type between two local dates (inclusive)
create or replace function public.mt_available_slots(p_session_type_id uuid, p_from date, p_to date)
returns table (day date, starts_at timestamptz, ends_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
declare
  s public.mt_settings%rowtype;
  st public.mt_session_types%rowtype;
  d date; r record; t time;
  slot_start timestamptz; slot_end timestamptz;
  earliest timestamptz; today date; latest date;
begin
  select * into s from public.mt_settings where id = 1;
  select * into st from public.mt_session_types where id = p_session_type_id and is_active;
  if st.id is null then return; end if;
  if p_to < p_from or p_to - p_from > 93 then raise exception 'Date range too large'; end if;

  today := (now() at time zone s.timezone)::date;
  earliest := now() + make_interval(hours => s.min_notice_hours);
  latest := today + s.max_advance_days;

  for d in select generate_series(greatest(p_from, today), least(p_to, latest), interval '1 day')::date loop
    if exists (select 1 from public.mt_blocked_dates b where b.day = d) then continue; end if;
    for r in
      select * from public.mt_availability_rules
      where is_active and weekday = extract(dow from d)::int
      order by start_time
    loop
      t := r.start_time;
      while t + make_interval(mins => st.duration_min) <= r.end_time loop
        slot_start := (d + t) at time zone s.timezone;
        slot_end := slot_start + make_interval(mins => st.duration_min);
        if slot_start >= earliest and not exists (
          select 1 from public.mt_bookings b
          where b.status <> 'cancelled'
            and tstzrange(b.starts_at - make_interval(mins => s.buffer_min),
                          b.ends_at + make_interval(mins => s.buffer_min), '[)')
                && tstzrange(slot_start, slot_end, '[)')
        ) then
          day := d; starts_at := slot_start; ends_at := slot_end;
          return next;
        end if;
        t := t + make_interval(mins => s.slot_interval_min);
      end loop;
    end loop;
  end loop;
end $$;

-- create a booking from the public site
create or replace function public.mt_create_booking(
  p_session_type_id uuid, p_starts_at timestamptz,
  p_name text, p_email text, p_phone text,
  p_experience text, p_goals text, p_notes text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  s public.mt_settings%rowtype;
  st public.mt_session_types%rowtype;
  v_name text; v_email text; v_phone text; v_end timestamptz;
  v_client uuid; v_id uuid; v_token uuid; v_status text; v_day date;
begin
  v_name := left(btrim(coalesce(p_name, '')), 80);
  v_email := lower(left(btrim(coalesce(p_email, '')), 120));
  v_phone := nullif(left(btrim(coalesce(p_phone, '')), 40), '');
  if length(v_name) < 2 then raise exception 'Please enter your name.'; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Please enter a valid email address.'; end if;
  if p_starts_at is null then raise exception 'Please choose a time.'; end if;

  select * into s from public.mt_settings where id = 1;
  select * into st from public.mt_session_types where id = p_session_type_id and is_active;
  if st.id is null then raise exception 'That session type is not available.'; end if;

  v_day := (p_starts_at at time zone s.timezone)::date;
  if not exists (
    select 1 from public.mt_available_slots(p_session_type_id, v_day, v_day) a where a.starts_at = p_starts_at
  ) then
    raise exception 'That time is no longer available. Please pick another slot.';
  end if;

  v_end := p_starts_at + make_interval(mins => st.duration_min);
  v_status := case when s.auto_confirm then 'confirmed' else 'pending' end;

  insert into public.mt_clients (email, name, phone, experience, goals)
  values (v_email, v_name, v_phone, left(p_experience, 40), left(p_goals, 1000))
  on conflict (email) do update
    set name = excluded.name,
        phone = coalesce(excluded.phone, public.mt_clients.phone),
        experience = coalesce(excluded.experience, public.mt_clients.experience),
        goals = coalesce(nullif(excluded.goals, ''), public.mt_clients.goals)
  returning id into v_client;

  insert into public.mt_bookings (
    client_id, session_type_id, session_name, price_cents, duration_min,
    starts_at, ends_at, status, client_name, client_email, client_phone,
    experience, goals, notes, source
  ) values (
    v_client, st.id, st.name, st.price_cents, st.duration_min,
    p_starts_at, v_end, v_status, v_name, v_email, v_phone,
    left(p_experience, 40), left(p_goals, 1000), left(p_notes, 1000), 'web'
  ) returning id, manage_token into v_id, v_token;

  return jsonb_build_object(
    'id', v_id, 'token', v_token, 'status', v_status,
    'starts_at', p_starts_at, 'ends_at', v_end,
    'session_name', st.name, 'price_cents', st.price_cents, 'duration_min', st.duration_min
  );
exception
  when exclusion_violation then
    raise exception 'That time was just taken. Please pick another slot.';
end $$;

-- look up a booking with its manage token (client "manage my booking" page)
create or replace function public.mt_get_booking(p_token uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', b.id, 'status', b.status, 'session_name', b.session_name,
    'price_cents', b.price_cents, 'duration_min', b.duration_min,
    'starts_at', b.starts_at, 'ends_at', b.ends_at,
    'client_name', b.client_name, 'client_email', b.client_email,
    'created_at', b.created_at
  )
  from public.mt_bookings b where b.manage_token = p_token;
$$;

create or replace function public.mt_cancel_booking(p_token uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  update public.mt_bookings
     set status = 'cancelled', cancelled_by = 'client', cancelled_at = now()
   where manage_token = p_token
     and status in ('pending', 'confirmed')
     and starts_at > now();
  if not found then
    raise exception 'This booking can no longer be cancelled online. Please message Declan directly.';
  end if;
  return public.mt_get_booking(p_token);
end $$;

-- grants: public RPCs are callable by anyone, coach helpers by signed-in users
revoke all on function public.mt_available_slots(uuid, date, date) from public;
revoke all on function public.mt_create_booking(uuid, timestamptz, text, text, text, text, text, text) from public;
revoke all on function public.mt_get_booking(uuid) from public;
revoke all on function public.mt_cancel_booking(uuid) from public;
revoke all on function public.mt_coach_exists() from public;
revoke all on function public.mt_claim_coach() from public;
revoke all on function public.mt_is_coach() from public;
grant execute on function public.mt_available_slots(uuid, date, date) to anon, authenticated;
grant execute on function public.mt_create_booking(uuid, timestamptz, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.mt_get_booking(uuid) to anon, authenticated;
grant execute on function public.mt_cancel_booking(uuid) to anon, authenticated;
grant execute on function public.mt_coach_exists() to anon, authenticated;
grant execute on function public.mt_claim_coach() to authenticated;
grant execute on function public.mt_is_coach() to anon, authenticated;
