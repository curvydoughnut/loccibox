import { ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Code2, KeyRound, BookOpen, LogOut, Boxes, Bell, Github, Twitter } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, gradient: "bg-gradient-cyan-blue" },
  { to: "/playground", label: "Playground", icon: Code2, gradient: "bg-gradient-purple-pink" },
  { to: "/keys", label: "API Keys", icon: KeyRound, gradient: "bg-gradient-cyan-teal" },
  { to: "/docs", label: "Docs", icon: BookOpen, gradient: "bg-gradient-amber-orange" },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const handleLogout = () => { logout(); navigate({ to: "/" }); };

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Header */}
      <header className="h-20 sticky top-0 z-50 px-6 lg:px-10 flex items-center justify-between glass-strong border-x-0 border-t-0">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-primary transition-transform group-hover:scale-105">
            <Boxes className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-lg">SandboxAPI</span>
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

        <div className="flex items-center gap-3">
          <button className="relative w-10 h-10 rounded-full glass glass-hover flex items-center justify-center">
            <Bell className="w-4 h-4 text-cyan" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gradient-orange-red" />
          </button>
          <div className="hidden sm:block text-right">
            <div className="text-xs text-white/60">{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-full bg-gradient-purple-pink flex items-center justify-center text-sm font-bold text-white shadow-primary hover:scale-105 transition-transform"
            title="Logout"
          >
            {user?.email?.[0]?.toUpperCase() ?? "U"}
          </button>
        </div>
      </header>

      <div className="flex-1 flex w-full">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col glass border-y-0 border-l-0 sticky top-20 self-start h-[calc(100vh-5rem)]">
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
      <footer className="h-16 px-6 lg:px-10 flex items-center justify-between glass border-x-0 border-b-0 text-xs">
        <div className="text-white/50">© SandboxAPI 2026</div>
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
