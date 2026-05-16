import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

type User = {
  id: string;
  email: string;
  apiKey: string;
  isDemo?: boolean;
  isEnterprise?: boolean;
  org?: string;
};
type LoginOpts = { password?: string; isDemo?: boolean; isEnterprise?: boolean; org?: string };
type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (email: string, opts?: LoginOpts) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);
const META_KEY = "loccibox_meta";

function makeKey() {
  const r = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  return `sk_live_${r.slice(0, 32)}`;
}

function buildUser(session: Session, extra: Partial<User> = {}): User {
  const meta = (() => {
    try { return JSON.parse(localStorage.getItem(META_KEY) || "{}"); } catch { return {}; }
  })();
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    apiKey: meta.apiKey ?? makeKey(),
    isDemo: meta.isDemo ?? extra.isDemo,
    isEnterprise: meta.isEnterprise ?? extra.isEnterprise,
    org: meta.org ?? extra.org,
  };
}

function persistMeta(u: User) {
  localStorage.setItem(META_KEY, JSON.stringify({
    apiKey: u.apiKey, isDemo: u.isDemo, isEnterprise: u.isEnterprise, org: u.org,
  }));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const u = buildUser(session);
        persistMeta(u);
        setUser(u);
      } else {
        setUser(null);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const u = buildUser(data.session);
        persistMeta(u);
        setUser(u);
      }
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const login = async (email: string, opts: LoginOpts = {}) => {
    // Demo accounts use a deterministic credential
    const password = opts.password ?? `demo-${email}-loccibox`;
    // Try sign-in first
    let { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const signup = await supabase.auth.signUp({ email, password });
      if (signup.error) throw signup.error;
    }
    const meta = { isDemo: !!opts.isDemo, isEnterprise: !!opts.isEnterprise, org: opts.org, apiKey: makeKey() };
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  };

  const logout = async () => {
    localStorage.removeItem(META_KEY);
    await supabase.auth.signOut();
    setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}
