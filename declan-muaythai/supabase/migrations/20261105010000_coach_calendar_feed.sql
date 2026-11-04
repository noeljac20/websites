-- Private calendar feed for the coach.
-- A secret token (readable only by the coach) unlocks a read-only list of upcoming bookings,
-- which the mt-calendar edge function turns into an .ics feed Declan subscribes to on his phone.

create table if not exists public.mt_coach_secrets (
  id int primary key default 1 check (id = 1),
  feed_token text not null default encode(extensions.gen_random_bytes(24), 'hex'),
  updated_at timestamptz not null default now()
);
alter table public.mt_coach_secrets enable row level security;
-- No policies: the table is reachable only through the security definer functions below.
revoke all on public.mt_coach_secrets from anon, authenticated;

create or replace function public.mt_coach_feed_token() returns text
language plpgsql security definer set search_path = public, extensions as $$
declare t text;
begin
  if not public.mt_is_coach() then raise exception 'Coach only'; end if;
  insert into public.mt_coach_secrets (id) values (1) on conflict (id) do nothing;
  select feed_token into t from public.mt_coach_secrets where id = 1;
  return t;
end $$;

create or replace function public.mt_coach_reset_feed_token() returns text
language plpgsql security definer set search_path = public, extensions as $$
declare t text;
begin
  if not public.mt_is_coach() then raise exception 'Coach only'; end if;
  insert into public.mt_coach_secrets (id) values (1)
  on conflict (id) do update set feed_token = encode(extensions.gen_random_bytes(24), 'hex'), updated_at = now()
  returning feed_token into t;
  return t;
end $$;

create or replace function public.mt_calendar_feed(p_token text)
returns table (
  id uuid, starts_at timestamptz, ends_at timestamptz, status text, session_name text,
  client_name text, client_phone text, client_email text, experience text, goals text, notes text,
  location text, updated_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select b.id, b.starts_at, b.ends_at, b.status, b.session_name,
         b.client_name, b.client_phone, b.client_email, b.experience, b.goals, b.notes,
         (select s.location from public.mt_settings s where s.id = 1), b.updated_at
  from public.mt_bookings b
  where length(coalesce(p_token, '')) >= 32
    and exists (select 1 from public.mt_coach_secrets c where c.id = 1 and c.feed_token = p_token)
    and b.status in ('pending', 'confirmed')
    and b.starts_at > now() - interval '60 days'
    and b.starts_at < now() + interval '180 days'
  order by b.starts_at
$$;

revoke all on function public.mt_coach_feed_token() from public, anon;
revoke all on function public.mt_coach_reset_feed_token() from public, anon;
revoke all on function public.mt_calendar_feed(text) from public;
grant execute on function public.mt_coach_feed_token() to authenticated;
grant execute on function public.mt_coach_reset_feed_token() to authenticated;
grant execute on function public.mt_calendar_feed(text) to anon, authenticated;
