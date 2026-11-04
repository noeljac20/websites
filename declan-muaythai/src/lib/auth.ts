import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type CoachAuth = {
  loading: boolean;
  session: Session | null;
  isCoach: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

/** Tracks the Supabase session and whether that user is the registered coach. */
export function useCoachAuth(): CoachAuth {
  const [session, setSession] = useState<Session | null>(null);
  const [isCoach, setIsCoach] = useState(false);
  const [loading, setLoading] = useState(true);

  async function evaluate(s: Session | null) {
    setSession(s);
    if (!s) {
      setIsCoach(false);
      setLoading(false);
      return;
    }
    const { data } = await supabase.rpc("mt_claim_coach");
    setIsCoach(Boolean(data));
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) void evaluate(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      if (active) void evaluate(s);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return {
    loading,
    session,
    isCoach,
    signOut: async () => {
      await supabase.auth.signOut();
    },
    refresh: async () => {
      const { data } = await supabase.auth.getSession();
      await evaluate(data.session);
    },
  };
}
