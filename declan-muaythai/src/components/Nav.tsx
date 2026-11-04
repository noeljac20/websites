import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

/** Section links go through the router so they work from /book and /booking without a full reload. */
export const SECTION_LINKS = [
  { hash: "sessions", label: "Sessions" },
  { hash: "pricing", label: "Pricing" },
  { hash: "about", label: "About" },
  { hash: "questions", label: "Questions" },
];

export function Nav({ solid = false }: { solid?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const filled = solid || scrolled || open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        filled ? "bg-ink/85 backdrop-blur-md hairline-b" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {SECTION_LINKS.map((l) => (
            <Link key={l.hash} to="/" hash={l.hash} className="label-caps inline-flex min-h-11 items-center text-[13px] text-fog transition-colors hover:text-cream">
              {l.label}
            </Link>
          ))}
          <Link to="/book" className="btn btn-primary btn-sm">
            Book a session
          </Link>
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <Link to="/book" className="btn btn-primary btn-sm">
            Book
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-11 place-items-center rounded-md border border-line text-cream"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {/* Always in the DOM (hidden when closed) so the menu button's aria-controls points at a real element. */}
      <div id="mobile-nav" hidden={!open} className="hairline-t bg-ink/95 px-4 pb-8 pt-4 backdrop-blur-md md:hidden">
        {open && (
          <>
            <ul className="flex flex-col">
              {SECTION_LINKS.map((l, i) => (
                <li key={l.hash} className="animate-rise" style={{ animationDelay: `${i * 40}ms` }}>
                  <Link to="/" hash={l.hash} className="display-md block py-4 text-[24px] text-cream hairline-b" onClick={() => setOpen(false)}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/book" className="btn btn-primary mt-6 w-full" onClick={() => setOpen(false)}>
              Book a session
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
