-- Data fix: brings the live service rows and the gym location in line with FALLBACK_SESSION_TYPES in
-- src/lib/booking.ts so visitors see the same copy whether or not the database loads.
--
-- TODO: confirm kids supervision policy with Declan before launch (the copy below makes no supervision claim).
-- TODO: confirm suburb / street address with Declan; 'The Headhunters Gym, Melbourne' is all that is known.

update public.mt_session_types set
  tagline = 'A one-hour session tailored to you.'
where slug = 'private-1on1';

update public.mt_session_types set
  tagline = 'A 45-minute session for ages 7 and up.',
  description = 'A 45-minute one-on-one session for kids aged 7 and up, tailored to their level and goals. Technique, pad work and fitness built into a strong foundation.',
  features = array['Ages 7+', '45 minutes, one-on-one', 'Technique, pad work and fitness', 'Tailored to their level']
where slug = 'kids-training';

update public.mt_settings set location = 'The Headhunters Gym, Melbourne' where id = 1;
