-- Service cards state only the facts from Declan's post: name, price, duration, level and age.
-- What a session covers is left to Declan.
update public.mt_session_types set
  tagline = null,
  description = 'One hour, 1-on-1.',
  features = array['1-on-1', 'Beginner and intermediate']
where slug = 'private-1on1';

update public.mt_session_types set
  tagline = null,
  description = '45 minutes, 1-on-1, for ages 7 and up.',
  features = array['Ages 7+', '1-on-1']
where slug = 'kids-training';
