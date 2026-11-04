-- Calendar feed: cover the full booking horizon (max_advance_days can be up to 365, and the coach can add
-- bookings further out), and keep sessions marked completed so past events stay in Declan's calendar.
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
    and b.status in ('pending', 'confirmed', 'completed')
    and b.starts_at > now() - interval '90 days'
    and b.starts_at < now() + interval '400 days'
  order by b.starts_at
$$;

revoke all on function public.mt_calendar_feed(text) from public;
grant execute on function public.mt_calendar_feed(text) to anon, authenticated;
