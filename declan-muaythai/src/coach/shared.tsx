import { useCallback, useEffect, useState } from "react";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { Badge, STATUS_LABEL } from "@/components/ui";
import type { Booking } from "@/lib/booking";
import { EXPERIENCE_LABEL, site } from "@/lib/site";
import { fmtDateLong, fmtRange } from "@/lib/format";

/** Tiny async loader hook: { data, error, loading, reload } */
export function useLoad<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(() => {
    setLoading(true);
    fn()
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => reload(), [reload]);
  return { data, error, loading, reload, setData };
}

export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="display text-[clamp(1.5rem,2.6vw,2rem)] text-cream">{title}</h1>
        {sub && <p className="mt-1 text-[15px] text-fog">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status: Booking["status"] }) {
  return <Badge tone={status}>{STATUS_LABEL[status]}</Badge>;
}

export function ContactLinks({ email, phone, name }: { email: string; phone?: string | null; name?: string }) {
  const cleanPhone = phone?.replace(/\s/g, "");
  return (
    <div className="flex flex-wrap gap-2">
      {cleanPhone && (
        <>
          <a href={`tel:${cleanPhone}`} className="btn btn-soft btn-sm">
            <Phone className="size-4" /> Call
          </a>
          <a href={`sms:${cleanPhone}`} className="btn btn-soft btn-sm">
            <MessageSquare className="size-4" /> Text
          </a>
        </>
      )}
      <a href={`mailto:${email}${name ? `?subject=${encodeURIComponent(`Muay Thai with ${site.coach}`)}` : ""}`} className="btn btn-soft btn-sm">
        <Mail className="size-4" /> Email
      </a>
    </div>
  );
}

export function confirmationText(b: Booking, tz: string) {
  const first = b.client_name.split(" ")[0];
  return `Hi ${first}, this is ${site.coach}. Your ${b.session_name} session is confirmed for ${fmtDateLong(b.starts_at, tz)}, ${fmtRange(b.starts_at, b.ends_at, tz)} at ${site.location}. Please arrive five minutes early, wear comfortable clothes and bring water. You can manage your booking here: ${window.location.origin}/booking/${b.manage_token}`;
}

export function experienceLabel(v: string | null) {
  return v ? EXPERIENCE_LABEL[v] ?? v : "Not given";
}
