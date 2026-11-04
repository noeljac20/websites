import { Link } from "@tanstack/react-router";
import { site } from "@/lib/site";

/** DW monogram on a 64 grid. Same shape as public/favicon.svg. */
const DW_PATH =
  "M9 16h8.5a9 9 0 0 1 9 9v14a9 9 0 0 1-9 9H9zM15 22v20h2.2a3.3 3.3 0 0 0 3.3-3.3V25.3a3.3 3.3 0 0 0-3.3-3.3z M29 16h5.6l2.4 20.5 2.6-14.5h4.8l2.6 14.5 2.4-20.5H55l-5 32h-5.6l-2.4-14-2.4 14H34z";

export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="12" fill="var(--color-red)" />
      <path d={DW_PATH} fill="#fff" fillRule="evenodd" />
    </svg>
  );
}

export function Logo({ light = true }: { light?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5" aria-label={`${site.name} home`}>
      <LogoMark className="size-9 shrink-0 transition-transform group-hover:-rotate-3" />
      <span className="flex flex-col leading-none">
        <span className={`font-display text-[19px] font-700 uppercase tracking-[0.05em] ${light ? "text-cream" : "text-ink"}`}>
          Declan Woods
        </span>
        <span className="mt-1 font-display text-[10.5px] font-600 uppercase tracking-[0.16em] text-fog">Muay Thai / Kickboxing</span>
      </span>
    </Link>
  );
}
