import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="hairline-t bg-ink-2">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-[15px] text-fog">
            Private Muay Thai coaching with an active fighter. Sixty minutes, one-on-one, built around you.
          </p>
          <Link to="/book" className="btn btn-primary mt-6">
            Book a session
          </Link>
        </div>
        <div>
          <p className="label-caps mb-4">Contact</p>
          <ul className="flex flex-col gap-3 text-[15px] text-fog">
            <li className="flex items-center gap-2.5">
              <MapPin className="size-4 text-mute" /> {site.location}
            </li>
            {site.email && (
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 text-mute" />
                <a href={`mailto:${site.email}`} className="hover:text-cream">
                  {site.email}
                </a>
              </li>
            )}
            {site.phone && (
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 text-mute" />
                <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-cream">
                  {site.phone}
                </a>
              </li>
            )}
            {site.instagram && (
              <li className="flex items-center gap-2.5">
                <Instagram className="size-4 text-mute" />
                <a href={site.instagram} target="_blank" rel="noreferrer" className="hover:text-cream">
                  Instagram
                </a>
              </li>
            )}
          </ul>
        </div>
        <div>
          <p className="label-caps mb-4">Site</p>
          <ul className="flex flex-col gap-3 text-[15px] text-fog">
            <li><a href="/#session" className="hover:text-cream">Training</a></li>
            <li><a href="/#pricing" className="hover:text-cream">Pricing</a></li>
            <li><a href="/#about" className="hover:text-cream">About Declan</a></li>
            <li><a href="/#faq" className="hover:text-cream">FAQ</a></li>
            <li><Link to="/book" className="hover:text-cream">Book</Link></li>
          </ul>
        </div>
      </div>
      <div className="hairline-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-[12px] text-mute sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} {site.name}. All rights reserved.</span>
          <Link to="/coach" className="hover:text-fog">
            Coach login
          </Link>
        </div>
      </div>
    </footer>
  );
}
