import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowUpRight, CalendarDays, Clock3, Dumbbell, LayoutDashboard, LogOut, Settings2, Users } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Spinner } from "@/components/ui";
import { useCoachAuth } from "@/lib/auth";
import { DEFAULT_SETTINGS, fetchSettings, type Settings } from "@/lib/booking";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Overview } from "@/coach/Overview";
import { Schedule } from "@/coach/Schedule";
import { Clients } from "@/coach/Clients";
import { Availability } from "@/coach/Availability";
import { Services } from "@/coach/Services";
import { SettingsPanel } from "@/coach/SettingsPanel";

type Tab = "overview" | "schedule" | "clients" | "availability" | "services" | "settings";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "Today", icon: LayoutDashboard },
  { id: "schedule", label: "Schedule", icon: CalendarDays },
  { id: "clients", label: "Clients", icon: Users },
  { id: "availability", label: "Availability", icon: Clock3 },
  { id: "services", label: "Services", icon: Dumbbell },
  { id: "settings", label: "Settings", icon: Settings2 },
];

export function CoachPage() {
  const auth = useCoachAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>(() => (window.location.hash.replace("#", "") as Tab) || "overview");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    document.title = `Coach dashboard | ${site.name}`;
    fetchSettings().then(setSettings).catch(() => {});
  }, []);

  useEffect(() => {
    if (!auth.loading && (!auth.session || !auth.isCoach)) void navigate({ to: "/coach/login" });
  }, [auth.loading, auth.session, auth.isCoach, navigate]);

  useEffect(() => {
    window.history.replaceState(null, "", `#${tab}`);
  }, [tab]);

  if (auth.loading || !auth.isCoach) {
    return (
      <main className="grid min-h-dvh place-items-center text-fog">
        <Spinner />
      </main>
    );
  }

  return (
    <div className="min-h-dvh bg-ink lg:grid lg:grid-cols-[240px_1fr]">
      {/* sidebar */}
      <aside className="sticky top-0 z-30 border-b border-line bg-ink/90 backdrop-blur-md lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-3 lg:px-5 lg:py-5">
          <Logo />
          <button
            type="button"
            onClick={() => auth.signOut()}
            className="-mr-2 inline-flex min-h-11 items-center gap-1.5 px-2 text-[14px] font-semibold text-fog hover:text-cream lg:hidden"
          >
            <LogOut className="size-4" aria-hidden /> Sign out
          </button>
        </div>
        {/* Tabs wrap onto a second row on phones so none are hidden off the right edge. */}
        <nav className="flex flex-wrap gap-1 px-3 pb-3 lg:flex-col lg:px-3" aria-label="Dashboard">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2.5 text-[15px] font-semibold transition-colors",
                tab === t.id ? "bg-surface-3 text-cream" : "text-fog hover:bg-surface-2 hover:text-cream",
              )}
            >
              <t.icon className={cn("size-4", tab === t.id ? "text-red" : "text-mute")} /> {t.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto hidden flex-col px-5 pb-4 lg:absolute lg:bottom-0 lg:flex">
          <Link to="/" className="inline-flex min-h-11 items-center gap-1.5 py-3 text-[13px] text-mute hover:text-fog">
            View public site <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
          <button type="button" onClick={() => auth.signOut()} className="inline-flex min-h-11 items-center gap-2 py-3 text-[13px] text-mute hover:text-fog">
            <LogOut className="size-3.5" aria-hidden /> Sign out
          </button>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-10">
        {tab === "overview" && <Overview settings={settings} onGo={(t) => setTab(t as Tab)} />}
        {tab === "schedule" && <Schedule settings={settings} />}
        {tab === "clients" && <Clients settings={settings} />}
        {tab === "availability" && <Availability />}
        {tab === "services" && <Services />}
        {tab === "settings" && <SettingsPanel settings={settings} onSaved={setSettings} />}
      </main>
    </div>
  );
}
