import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Activity, Server, Clock, BarChart3, Check, X, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SandboxAPI" }] }),
  component: Page,
});

const stats = [
  { label: "Total Runs (Today)", value: "487", trend: "↑ 12% from yesterday", icon: BarChart3, color: "text-info", ring: "ring-info/20" },
  { label: "Active Sandboxes", value: "12", trend: "Running right now", icon: Server, color: "text-success", ring: "ring-success/20" },
  { label: "Avg Execution Time", value: "94ms", trend: "Across all runs", icon: Clock, color: "text-purple", ring: "ring-purple/20" },
  { label: "API Calls (Month)", value: "12,847", trend: "Rate limit: 100k", icon: Activity, color: "text-orange", ring: "ring-orange/20" },
];

const chart = [
  { day: "Mon", runs: 120 }, { day: "Tue", runs: 145 }, { day: "Wed", runs: 98 },
  { day: "Thu", runs: 234 }, { day: "Fri", runs: 287 }, { day: "Sat", runs: 156 }, { day: "Sun", runs: 89 },
];

const recent = [
  { time: "2:34 PM", lang: "Python", status: "ok", dur: "87ms", tenant: "sk_live_a3f9..." },
  { time: "2:32 PM", lang: "Node.js", status: "ok", dur: "112ms", tenant: "sk_live_a3f9..." },
  { time: "2:28 PM", lang: "Bash", status: "fail", dur: "45ms", tenant: "sk_test_71be..." },
  { time: "2:21 PM", lang: "Python", status: "running", dur: "—", tenant: "sk_live_a3f9..." },
  { time: "2:19 PM", lang: "Ruby", status: "ok", dur: "203ms", tenant: "sk_live_c8d2..." },
  { time: "2:14 PM", lang: "Python", status: "ok", dur: "76ms", tenant: "sk_live_a3f9..." },
  { time: "2:10 PM", lang: "Node.js", status: "ok", dur: "98ms", tenant: "sk_test_71be..." },
  { time: "2:05 PM", lang: "Bash", status: "ok", dur: "31ms", tenant: "sk_live_a3f9..." },
  { time: "1:58 PM", lang: "Python", status: "fail", dur: "1240ms", tenant: "sk_live_c8d2..." },
  { time: "1:52 PM", lang: "Ruby", status: "ok", dur: "187ms", tenant: "sk_live_a3f9..." },
];

function Page() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;

  return (
    <AppLayout>
      <div className="p-8 space-y-8 max-w-7xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user.email.split("@")[0]}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <Card
              key={s.label}
              className="p-5 border-border bg-card hover:-translate-y-1 hover:shadow-glow transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                  <div className="text-3xl font-bold mt-2 tracking-tight">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-2">{s.trend}</div>
                </div>
                <div className={cn("w-10 h-10 rounded-lg ring-1 flex items-center justify-center bg-background/50", s.ring)}>
                  <s.icon className={cn("w-5 h-5", s.color)} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Sandbox Runs</h2>
              <p className="text-sm text-muted-foreground">Last 7 days</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.65 0.2 295)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.62 0.19 258)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(0.32 0.02 260)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="oklch(0.7 0.02 260)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.7 0.02 260)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "oklch(0.235 0.03 260)", border: "1px solid oklch(0.32 0.02 260)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "oklch(0.96 0.005 260)" }}
                />
                <Area type="monotone" dataKey="runs" stroke="oklch(0.62 0.19 258)" strokeWidth={2.5} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-border bg-card overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <p className="text-sm text-muted-foreground">Last 10 sandbox executions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Timestamp</th>
                  <th className="px-6 py-3 font-medium">Language</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Duration</th>
                  <th className="px-6 py-3 font-medium">Tenant</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r, i) => (
                  <tr key={i} className={cn("border-t border-border hover:bg-accent/40 transition-colors", i % 2 && "bg-muted/10")}>
                    <td className="px-6 py-3 text-muted-foreground">{r.time} Today</td>
                    <td className="px-6 py-3 font-medium">{r.lang}</td>
                    <td className="px-6 py-3">
                      {r.status === "ok" && <span className="inline-flex items-center gap-1 text-success"><Check className="w-3.5 h-3.5" /> Completed</span>}
                      {r.status === "fail" && <span className="inline-flex items-center gap-1 text-destructive"><X className="w-3.5 h-3.5" /> Failed</span>}
                      {r.status === "running" && <span className="inline-flex items-center gap-1 text-info"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running</span>}
                    </td>
                    <td className="px-6 py-3 font-mono text-xs">{r.dur}</td>
                    <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{r.tenant}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
