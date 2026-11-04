// Coach calendar feed: GET /functions/v1/mt-calendar?token=<feed token>
// Returns Declan's pending and confirmed bookings as an .ics calendar his phone can subscribe to.
// Deployed with verify_jwt = false because calendar apps cannot send auth headers; the long random
// token is the credential, checked inside the mt_calendar_feed database function.
import { buildCalendar, type FeedBooking } from "./ics.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "https://jhchiqhbsocxkuzbkjye.supabase.co";
// Public (publishable) key, the same one the website ships with. Used only if the runtime does not provide it.
const PUBLIC_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoY2hpcWhic29jeGt1emJranllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MDM0MTksImV4cCI6MjA5NjQ3OTQxOX0.DxDYFyPDl--z8sUCxglvYGqtQ0VXGV_vSXlViz3bWVg";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || PUBLIC_KEY;
const DASHBOARD_URL = "https://websites-psi-nine.vercel.app/coach";

Deno.serve(async (req) => {
  if (req.method !== "GET" && req.method !== "HEAD") return new Response("Method not allowed", { status: 405 });
  const url = new URL(req.url);
  // Accept ?token=... and also a trailing /<token>.ics path, which some calendar apps prefer.
  const token = url.searchParams.get("token") ?? url.pathname.split("/").pop()?.replace(/\.ics$/, "") ?? "";
  if (!/^[a-f0-9]{32,}$/.test(token)) return new Response("Not found", { status: 404 });

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/mt_calendar_feed`, {
    method: "POST",
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_token: token }),
  });
  if (!res.ok) {
    console.error("mt_calendar_feed failed", res.status, await res.text());
    return new Response("Calendar unavailable", { status: 502 });
  }
  const rows = (await res.json()) as FeedBooking[];
  // An unknown token returns no rows. Serve an empty calendar rather than revealing whether the token exists.
  const body = buildCalendar(rows, { dashboardUrl: DASHBOARD_URL });
  return new Response(req.method === "HEAD" ? null : body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="declan-bookings.ics"',
      "Cache-Control": "no-store",
    },
  });
});
