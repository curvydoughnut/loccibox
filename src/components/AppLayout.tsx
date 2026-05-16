import { ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Code2, KeyRound, BookOpen, LogOut, Boxes, Bell, Github, Twitter, FileCode2, Sparkles, Building2, Split } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, gradient: "bg-gradient-cyan-blue" },
  { to: "/code", label: "Code Editor", icon: FileCode2, gradient: "bg-gradient-cyan-teal" },
  { to: "/playground", label: "Playground", icon: Split, gradient: "bg-gradient-purple-pink" },
  { to: "/keys", label: "API Keys", icon: KeyRound, gradient: "bg-gradient-teal-green" },
  { to: "/docs", label: "Docs", icon: BookOpen, gradient: "bg-gradient-amber-orange" },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const handleLogout = () => { logout(); navigate({ to: "/" }); };

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Demo / Enterprise mode banner */}
      {(user?.isDemo || user?.isEnterprise) && (
        <div className={cn(
          "px-4 sm:px-6 lg:px-10 py-2 flex items-center justify-center gap-2 text-xs font-medium",
          user?.isDemo
            ? "bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-amber-500/20 text-white border-b border-white/10"
            : "bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-cyan-500/20 text-white border-b border-white/10"
        )}>
          {user?.isDemo ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span><span className="font-bold">Demo Mode</span> — every feature unlocked, sample data, no signup needed.</span>
            </>
          ) : (
            <>
              <Building2 className="w-3.5 h-3.5 text-cyan" />
              <span>Signed in via <span className="font-bold uppercase">{user?.org}</span> SSO · audit logs enabled</span>
            </>
          )}
        </div>
      )}

      {/* Header */}
      <header className="h-16 sm:h-20 sticky top-0 z-50 px-3 sm:px-6 lg:px-10 flex items-center justify-between gap-2 glass-strong border-x-0 border-t-0">
        <Link to="/dashboard" className="flex items-center gap-2 sm:gap-3 group min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-primary transition-transform group-hover:scale-105 shrink-0">
            <Boxes className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-base sm:text-lg truncate">Locci Box</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {nav.map((n) => {
            const active = path === n.to || path.startsWith(n.to + "/");
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-white/10 text-white border border-white/15"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full glass glass-hover flex items-center justify-center">
            <Bell className="w-4 h-4 text-cyan" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gradient-orange-red" />
          </button>
          <div className="hidden md:block text-right max-w-[180px]">
            <div className="text-xs text-white/60 truncate">{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-purple-pink flex items-center justify-center text-sm font-bold text-white shadow-primary hover:scale-105 transition-transform shrink-0"
            title="Logout"
          >
            {user?.email?.[0]?.toUpperCase() ?? "U"}
          </button>
        </div>
      </header>

      {/* Mobile nav strip */}
      <nav className="lg:hidden sticky top-16 sm:top-20 z-40 glass border-x-0 border-t-0 px-3 py-2 flex items-center gap-1.5 overflow-x-auto">
        {nav.map((n) => {
          const active = path === n.to || path.startsWith(n.to + "/");
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all shrink-0",
                active ? "bg-white/10 text-white border border-white/15" : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <span className={cn("w-5 h-5 rounded-md flex items-center justify-center", n.gradient)}>
                <Icon className="w-3 h-3 text-white" />
              </span>
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1 flex w-full">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col glass border-y-0 border-l-0 sticky top-20 self-start h-[calc(100vh-5rem)]">
          <nav className="flex-1 p-4 space-y-1">
            {nav.map((n) => {
              const active = path === n.to || path.startsWith(n.to + "/");
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all relative",
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {active && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-gradient-cyan-blue" />}
                  <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110", n.gradient)}>
                    <Icon className="w-4 h-4 text-white" />
                  </span>
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-white/10">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-white/70 hover:text-white hover:bg-white/5" onClick={handleLogout}>
              <LogOut className="w-4 h-4" /> Sign out
            </Button>
          </div>
        </aside>

        <main className="flex-1 min-w-0">{children}</main>
      </div>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 glass border-x-0 border-b-0 text-xs">
        <div className="text-white/50">© Locci Box 2026</div>
        <div className="flex items-center gap-2 text-white/70">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          All systems operational
        </div>
        <div className="flex items-center gap-3">
          <a href="#" className="w-8 h-8 rounded-lg glass glass-hover flex items-center justify-center"><Github className="w-3.5 h-3.5 text-cyan" /></a>
          <a href="#" className="w-8 h-8 rounded-lg glass glass-hover flex items-center justify-center"><Twitter className="w-3.5 h-3.5 text-cyan" /></a>
          <Link to="/docs" className="text-white/60 hover:text-white">Docs</Link>
        </div>
      </footer>
    </div>
  );
}
