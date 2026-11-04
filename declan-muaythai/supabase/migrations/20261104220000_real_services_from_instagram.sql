-- Align services with Declan's actual offer (Instagram @declan.woods):
--   1-on-1 Training — $40 (1 hour); Kids Training (Ages 7+) — $30 (45 mins); at The Headhunters Gym.

alter table public.mt_session_types add column if not exists for_kids boolean not null default false;

update public.mt_session_types set
  name = '1-on-1 Training',
  tagline = 'One hour, tailored to you.',
  description = 'A one-on-one session at The Headhunters Gym, tailored to your experience level and individual goals. Technique, pad work, fitness and building a strong foundation.',
  duration_min = 60,
  price_cents = 4000,
  sessions_included = 1,
  features = array['Technique and pad work', 'Fitness and conditioning', 'Tailored to your level and goals', 'Beginner and intermediate welcome'],
  is_featured = true,
  is_active = true,
  sort_order = 1,
  for_kids = false
where slug = 'private-1on1';

insert into public.mt_session_types
  (slug, name, tagline, description, duration_min, price_cents, sessions_included, features, is_featured, is_active, sort_order, for_kids)
values
  ('kids-training', 'Kids Training', 'Ages 7 and up.',
   'A 45-minute one-on-one session for kids aged 7 and over. Fun, safe and focused on the basics: stance, movement, pad work and confidence.',
   45, 3000, 1,
   array['Ages 7+', '45 minutes, one-on-one', 'Basics, pads and confidence', 'Parents welcome to watch'],
   false, true, 2, true)
on conflict (slug) do update set
  name = excluded.name, tagline = excluded.tagline, description = excluded.description,
  duration_min = excluded.duration_min, price_cents = excluded.price_cents,
  features = excluded.features, is_active = true, sort_order = excluded.sort_order, for_kids = true;

-- Remove the placeholder services that were never part of Declan's offer (only if nothing was booked against them).
delete from public.mt_session_types t
where t.slug in ('partner-2on1', 'pack-5', 'pack-10')
  and not exists (select 1 from public.mt_bookings b where b.session_type_id = t.id);

update public.mt_settings set location = 'The Headhunters Gym' where id = 1;
