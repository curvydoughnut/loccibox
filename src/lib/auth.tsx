import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type User = { email: string; apiKey: string; isDemo?: boolean; isEnterprise?: boolean; org?: string };
type AuthCtx = {
  user: User | null;
  login: (email: string, opts?: { isDemo?: boolean; isEnterprise?: boolean; org?: string }) => void;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "sandboxapi_auth";

function makeKey() {
  const r = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  return `sk_live_${r.slice(0, 32)}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const login = (email: string, opts?: { isDemo?: boolean; isEnterprise?: boolean; org?: string }) => {
    const u: User = { email, apiKey: makeKey(), ...opts };
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem(KEY);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}