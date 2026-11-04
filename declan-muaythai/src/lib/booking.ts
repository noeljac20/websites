import { supabase } from "./supabase";

export type SessionType = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  duration_min: number;
  price_cents: number;
  sessions_included: number;
  features: string[];
  is_active: boolean;
  is_featured: boolean;
  for_kids: boolean;
  sort_order: number;
};

export type Settings = {
  id: number;
  timezone: string;
  slot_interval_min: number;
  min_notice_hours: number;
  max_advance_days: number;
  buffer_min: number;
  auto_confirm: boolean;
  location: string;
};

export type Slot = { day: string; starts_at: string; ends_at: string };

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show";

export type Booking = {
  id: string;
  client_id: string | null;
  session_type_id: string | null;
  session_name: string;
  price_cents: number;
  duration_min: number;
  starts_at: string;
  ends_at: string;
  status: BookingStatus;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  experience: string | null;
  goals: string | null;
  notes: string | null;
  coach_notes: string | null;
  source: "web" | "coach";
  manage_token: string;
  cancelled_by: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Client = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  experience: string | null;
  goals: string | null;
  coach_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AvailabilityRule = {
  id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

export type BlockedDate = { id: string; day: string; reason: string | null };

export type PublicBooking = {
  id: string;
  status: BookingStatus;
  session_name: string;
  price_cents: number;
  duration_min: number;
  starts_at: string;
  ends_at: string;
  client_name: string;
  client_email: string;
  created_at: string;
};

export const DEFAULT_SETTINGS: Settings = {
  id: 1,
  timezone: "Australia/Melbourne",
  slot_interval_min: 60,
  min_notice_hours: 12,
  max_advance_days: 42,
  buffer_min: 0,
  auto_confirm: false,
  location: "The Headhunters Gym, 3 Pottery Cct, Pakenham VIC 3810",
};

/** Static fallback so the pricing section still renders if the database is unreachable. Mirrors the two real services. */
export const FALLBACK_SESSION_TYPES: SessionType[] = [
  {
    id: "fallback-private",
    slug: "private-1on1",
    name: "1-on-1 Training",
    tagline: null,
    description: "One hour, 1-on-1.",
    duration_min: 60,
    price_cents: 4000,
    sessions_included: 1,
    features: ["1-on-1", "Beginner and intermediate"],
    is_active: true,
    is_featured: true,
    for_kids: false,
    sort_order: 1,
  },
  {
    id: "fallback-kids",
    slug: "kids-training",
    name: "Kids Training",
    tagline: null,
    description: "45 minutes, 1-on-1, for ages 7 and up.",
    duration_min: 45,
    price_cents: 3000,
    sessions_included: 1,
    // TODO: confirm kids supervision policy with Declan. The live DB row (migration 20261104220000) still carries the older
    // description/features; update it via the coach Services tab or a follow-up migration, not by editing applied migrations.
    features: ["Ages 7+", "1-on-1"],
    is_active: true,
    is_featured: false,
    for_kids: true,
    sort_order: 2,
  },
];

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export async function fetchSettings(): Promise<Settings> {
  const res = await supabase.from("mt_settings").select("*").eq("id", 1).maybeSingle();
  if (res.error || !res.data) return DEFAULT_SETTINGS;
  return res.data as Settings;
}

export async function fetchSessionTypes(includeInactive = false): Promise<SessionType[]> {
  let q = supabase.from("mt_session_types").select("*").order("sort_order").order("created_at");
  if (!includeInactive) q = q.eq("is_active", true);
  return unwrap(await q) as SessionType[];
}

export async function fetchSlots(sessionTypeId: string, from: string, to: string): Promise<Slot[]> {
  const res = await supabase.rpc("mt_available_slots", {
    p_session_type_id: sessionTypeId,
    p_from: from,
    p_to: to,
  });
  return unwrap(res) as Slot[];
}

export type CreateBookingInput = {
  sessionTypeId: string;
  startsAt: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  goals: string;
  notes: string;
};

export type CreatedBooking = {
  id: string;
  token: string;
  status: BookingStatus;
  starts_at: string;
  ends_at: string;
  session_name: string;
  price_cents: number;
  duration_min: number;
};

export async function createBooking(input: CreateBookingInput): Promise<CreatedBooking> {
  const res = await supabase.rpc("mt_create_booking", {
    p_session_type_id: input.sessionTypeId,
    p_starts_at: input.startsAt,
    p_name: input.name,
    p_email: input.email,
    p_phone: input.phone,
    p_experience: input.experience,
    p_goals: input.goals,
    p_notes: input.notes,
  });
  return unwrap(res) as CreatedBooking;
}

export async function getBookingByToken(token: string): Promise<PublicBooking | null> {
  const res = await supabase.rpc("mt_get_booking", { p_token: token });
  if (res.error) throw new Error(res.error.message);
  return (res.data as PublicBooking | null) ?? null;
}

export async function cancelBookingByToken(token: string): Promise<PublicBooking> {
  return unwrap(await supabase.rpc("mt_cancel_booking", { p_token: token })) as PublicBooking;
}

/* ---------------- coach-only (RLS enforced) ---------------- */

export async function coachFetchBookings(opts: { from?: string; to?: string } = {}): Promise<Booking[]> {
  let q = supabase.from("mt_bookings").select("*").order("starts_at", { ascending: true });
  if (opts.from) q = q.gte("starts_at", opts.from);
  if (opts.to) q = q.lt("starts_at", opts.to);
  return unwrap(await q) as Booking[];
}

export async function coachUpdateBooking(id: string, patch: Partial<Booking>) {
  return unwrap(await supabase.from("mt_bookings").update(patch).eq("id", id).select().single()) as Booking;
}

export async function coachCreateBooking(input: {
  sessionType: SessionType;
  startsAt: string;
  name: string;
  email: string;
  phone: string;
  status: BookingStatus;
  notes: string;
}) {
  const ends = new Date(new Date(input.startsAt).getTime() + input.sessionType.duration_min * 60_000).toISOString();
  const email = input.email.trim().toLowerCase();
  // upsert client so the client list stays complete
  const clientRes = await supabase
    .from("mt_clients")
    .upsert({ email, name: input.name.trim(), phone: input.phone.trim() || null }, { onConflict: "email" })
    .select()
    .single();
  const client = unwrap(clientRes) as Client;
  const res = await supabase
    .from("mt_bookings")
    .insert({
      client_id: client.id,
      session_type_id: input.sessionType.id,
      session_name: input.sessionType.name,
      price_cents: input.sessionType.price_cents,
      duration_min: input.sessionType.duration_min,
      starts_at: input.startsAt,
      ends_at: ends,
      status: input.status,
      client_name: input.name.trim(),
      client_email: email,
      client_phone: input.phone.trim() || null,
      notes: input.notes || null,
      source: "coach",
    })
    .select()
    .single();
  if (res.error) {
    if (/overlap|exclusion|mt_bookings_no_overlap/i.test(res.error.message)) {
      throw new Error("That time overlaps another booking.");
    }
    throw new Error(res.error.message);
  }
  return res.data as Booking;
}

export async function coachFetchClients(): Promise<Client[]> {
  return unwrap(await supabase.from("mt_clients").select("*").order("created_at", { ascending: false })) as Client[];
}

export async function coachUpdateClient(id: string, patch: Partial<Client>) {
  return unwrap(await supabase.from("mt_clients").update(patch).eq("id", id).select().single()) as Client;
}

export async function fetchRules(): Promise<AvailabilityRule[]> {
  return unwrap(
    await supabase.from("mt_availability_rules").select("*").order("weekday").order("start_time"),
  ) as AvailabilityRule[];
}

export async function coachUpsertRule(rule: Partial<AvailabilityRule> & { weekday: number; start_time: string; end_time: string }) {
  return unwrap(await supabase.from("mt_availability_rules").upsert(rule).select().single()) as AvailabilityRule;
}

export async function coachDeleteRule(id: string) {
  const res = await supabase.from("mt_availability_rules").delete().eq("id", id);
  if (res.error) throw new Error(res.error.message);
}

export async function fetchBlockedDates(): Promise<BlockedDate[]> {
  return unwrap(await supabase.from("mt_blocked_dates").select("*").order("day")) as BlockedDate[];
}

export async function coachAddBlockedDate(day: string, reason: string) {
  return unwrap(
    await supabase.from("mt_blocked_dates").upsert({ day, reason: reason || null }, { onConflict: "day" }).select().single(),
  ) as BlockedDate;
}

export async function coachRemoveBlockedDate(id: string) {
  const res = await supabase.from("mt_blocked_dates").delete().eq("id", id);
  if (res.error) throw new Error(res.error.message);
}

export async function coachUpsertSessionType(st: Partial<SessionType> & { slug: string; name: string; price_cents: number }) {
  return unwrap(await supabase.from("mt_session_types").upsert(st, { onConflict: "slug" }).select().single()) as SessionType;
}

export async function coachUpdateSettings(patch: Partial<Settings>) {
  return unwrap(await supabase.from("mt_settings").update(patch).eq("id", 1).select().single()) as Settings;
}
