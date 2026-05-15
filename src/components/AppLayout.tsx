import { ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Code2, KeyRound, BookOpen, LogOut, Boxes, Bell } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/playground", label: "Playground", icon: Code2 },
  { to: "/keys", label: "API Keys", icon: KeyRound },
  { to: "/docs", label: "Docs", icon: BookOpen },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex w-full bg-app-gradient">
      <aside className="w-64 border-r border-sidebar-border bg-sidebar/80 backdrop-blur flex flex-col">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow">
            <Boxes className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight">SandboxAPI</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((n) => {
            const active = path === n.to || path.startsWith(n.to + "/");
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/15 text-foreground border border-primary/30"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="px-2 py-2 text-xs text-muted-foreground truncate">{user?.email}</div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 sticky top-0 z-10 border-b border-border bg-background/70 backdrop-blur flex items-center justify-between px-6">
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-md hover:bg-accent flex items-center justify-center">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-destructive" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-semibold text-primary-foreground">
              {user?.email?.[0]?.toUpperCase() ?? "U"}
            </div>
          </div>
        </header>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}