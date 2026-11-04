import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- Button ---------- */
type ButtonVariant = "primary" | "gold" | "ghost" | "soft" | "danger";
export function Button({
  variant = "primary",
  size,
  className,
  loading,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: "sm"; loading?: boolean }) {
  return (
    <button
      className={cn("btn", `btn-${variant}`, size === "sm" && "btn-sm", className)}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

/* ---------- Form field ---------- */
export function Field({
  label,
  hint,
  error,
  id,
  children,
  optional,
}: {
  label: string;
  hint?: string;
  error?: string;
  id: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-baseline justify-between text-[14px] font-semibold text-cream">
        <span>{label}</span>
        {optional && <span className="text-[12px] font-medium text-mute">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-[13px] font-medium text-[#ff7a7f]" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[13px] text-mute">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  ({ className, invalid, ...props }, ref) => (
    <input ref={ref} className={cn("field", className)} aria-invalid={invalid || undefined} {...props} />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(({ className, invalid, ...props }, ref) => (
  <textarea ref={ref} className={cn("field min-h-[110px] resize-y", className)} aria-invalid={invalid || undefined} {...props} />
));
Textarea.displayName = "Textarea";

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cn("field appearance-none pr-10", className)} {...props}>
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-mute"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/** The visible track stays 48x28; the button around it is at least 44x44 so it is easy to tap. */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="-my-2 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full"
    >
      <span
        aria-hidden
        className={cn(
          "relative inline-flex h-7 w-12 items-center rounded-full border transition-colors",
          checked ? "border-green bg-green/80" : "border-line-strong bg-surface-3",
        )}
      >
        <span
          className={cn(
            "inline-block size-5 rounded-full bg-cream shadow transition-transform",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </span>
    </button>
  );
}

/* ---------- Badge ---------- */
const badgeTone: Record<string, string> = {
  pending: "bg-amber-soft text-amber",
  confirmed: "bg-green-soft text-green",
  completed: "bg-surface-3 text-fog",
  cancelled: "bg-red-soft text-[#ff8a8e]",
  no_show: "bg-red-soft text-[#ff8a8e]",
  gold: "bg-gold-soft text-gold",
  neutral: "bg-surface-3 text-fog",
};
export const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};
export function Badge({ tone = "neutral", children, className }: { tone?: string; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-display text-[12px] font-semibold",
        badgeTone[tone] ?? badgeTone.neutral,
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ---------- Dialog ---------- */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-fade" />
        <DialogPrimitive.Content
          className={cn(
            "card fixed left-1/2 top-1/2 z-50 max-h-[92dvh] w-[calc(100%-24px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto p-5 sm:p-7 data-[state=open]:animate-rise",
            wide ? "max-w-2xl" : "max-w-lg",
          )}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <DialogPrimitive.Title className="display-md text-[22px] text-cream">{title}</DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="mt-1 text-[14px] text-fog">{description}</DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close
              className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-fog hover:border-cream hover:text-cream"
              aria-label="Close"
            >
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/* ---------- Misc ---------- */
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-5 animate-spin text-fog", className)} aria-label="Loading" />;
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="card-2 flex flex-col items-center gap-2 px-6 py-10 text-center">
      <p className="display-md text-[19px] text-cream">{title}</p>
      {body && <p className="max-w-sm text-[14px] text-fog">{body}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  body?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="display text-[clamp(1.85rem,3.4vw,2.6rem)] text-cream">{title}</h2>
      {body && <p className="mt-3 text-[16px] leading-relaxed text-fog">{body}</p>}
    </div>
  );
}
