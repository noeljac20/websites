import { Link } from "@tanstack/react-router";
import { Instagram, MapPin } from "lucide-react";
import { Logo } from "./Logo";
import { SECTION_LINKS } from "./Nav";
import { site } from "@/lib/site";

const footerLink = "inline-flex min-h-11 items-center hover:text-cream";

export function Footer() {
  return (
    <footer className="hairline-t bg-ink-2">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-[15px] text-fog">
            1-on-1 Muay Thai coaching with Declan Woods at The Headhunters Gym, Pakenham.
          </p>
          <Link to="/book" className="btn btn-primary mt-6">
            Book a session
          </Link>
        </div>
        <div>
          <p className="label-caps mb-4">Contact</p>
          <ul className="flex flex-col gap-3 text-[15px] text-fog">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-1 size-4 shrink-0 text-mute" />
              <a href={site.mapsUrl} target="_blank" rel="noreferrer" className="hover:text-cream">
                {site.gym}
                <br />
                {site.address}
              </a>
            </li>
            {site.instagram && (
              <li className="flex items-center gap-2.5">
                <Instagram className="size-4 text-mute" />
                <a href={site.instagram} target="_blank" rel="noreferrer" className="hover:text-cream">
                  {site.instagramHandle || "Instagram"}
                </a>
              </li>
            )}
          </ul>
        </div>
        <div>
          <p className="label-caps mb-4">Site</p>
          <ul className="flex flex-col gap-1 text-[15px] text-fog">
            {SECTION_LINKS.map((l) => (
              <li key={l.hash}>
                <Link to="/" hash={l.hash} className={footerLink}>
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/book" className={footerLink}>
                Book a session
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="hairline-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-[12px] text-mute sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} {site.name}</span>
          <Link to="/coach" className="inline-flex min-h-11 items-center hover:text-fog">
            Coach login
          </Link>
        </div>
      </div>
    </footer>
  );
}
