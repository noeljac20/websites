-- Supabase default privileges grant EXECUTE to anon explicitly; remove it where anon has no business calling.
revoke execute on function public.mt_claim_coach() from anon;
