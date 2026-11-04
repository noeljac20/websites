import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { Button, Field, Input } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { useCoachAuth } from "@/lib/auth";
import { errorMessage } from "@/lib/utils";
import { site } from "@/lib/site";

export function CoachLoginPage() {
  const auth = useCoachAuth();
  const navigate = useNavigate();
  const [coachExists, setCoachExists] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    document.title = `Coach login — ${site.name}`;
    supabase.rpc("mt_coach_exists").then(({ data }) => setCoachExists(Boolean(data)));
  }, []);

  useEffect(() => {
    if (!auth.loading && auth.session && auth.isCoach) void navigate({ to: "/coach" });
  }, [auth.loading, auth.session, auth.isCoach, navigate]);

  const setupMode = coachExists === false;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      if (setupMode) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) {
          setNotice("Account created. Check your email to confirm it, then sign in here.");
          setCoachExists(null);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      await auth.refresh();
      const { data: isCoach } = await supabase.rpc("mt_claim_coach");
      if (!isCoach) {
        await supabase.auth.signOut();
        throw new Error("That account isn't registered as the coach.");
      }
      void navigate({ to: "/coach" });
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't sign in."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <form onSubmit={submit} className="card flex flex-col gap-5 p-6 sm:p-8">
          <div>
            <p className="eyebrow">Coach area</p>
            <h1 className="display mt-2 text-[28px] text-cream">{setupMode ? "Set up your login" : "Sign in"}</h1>
            {setupMode && (
              <p className="mt-2 text-[14px] text-fog">
                No coach account exists yet. The first account created here becomes the coach.
              </p>
            )}
          </div>
          {notice && (
            <p className="rounded-md bg-green-soft p-3 text-[14px] text-green" role="status">
              {notice}
            </p>
          )}
          <Field id="email" label="Email">
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field id="password" label="Password" hint={setupMode ? "At least 8 characters." : undefined}>
            <Input
              id="password"
              type="password"
              autoComplete={setupMode ? "new-password" : "current-password"}
              required
              minLength={setupMode ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Button type="submit" loading={busy || coachExists === null}>
            {setupMode ? "Create coach account" : "Sign in"}
          </Button>
          <Link to="/" className="text-center text-[13px] text-mute hover:text-fog">
            Back to site
          </Link>
        </form>
      </div>
    </main>
  );
}
