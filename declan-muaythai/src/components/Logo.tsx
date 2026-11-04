import { Link } from "@tanstack/react-router";
import { site } from "@/lib/site";

export function Logo({ light = true }: { light?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5" aria-label={`${site.name} home`}>
      <span className="grid size-9 place-items-center rounded-[9px] bg-cream font-display text-[20px] font-800 leading-none text-ink transition-transform group-hover:-rotate-3">
        D
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-display text-[19px] font-700 uppercase tracking-[0.04em] ${light ? "text-cream" : "text-ink"}`}>
          Declan
        </span>
        <span className="font-display text-[11px] font-600 uppercase tracking-[0.3em] text-red">Muay Thai</span>
      </span>
    </Link>
  );
}
