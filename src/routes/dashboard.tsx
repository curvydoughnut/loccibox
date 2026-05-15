import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/lib/auth";
import { Activity, Server, Clock, BarChart3, Check, X, Loader2, TrendingUp } from "lucide-react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SandboxAPI" }] }),
  component: Page,
});

const stats = [
  { label: "Total Runs (Today)", value: "487", trend: "+12% from yesterday", icon: BarChart3, gradient: "bg-gradient-cyan-blue", up: true },
  { label: "Active Sandboxes", value: "12", trend: "Running right now", icon: Server, gradient: "bg-gradient-teal-green", up: true },
  { label: "Avg Execution Time", value: "94ms", trend: "Across all runs", icon: Clock, gradient: "bg-gradient-purple-pink", up: true },
  { label: "API Calls (Month)", value: "12,847", trend: "Rate limit: 100k", icon: Activity, gradient: "bg-gradient-amber-orange", up: true },
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
      <div className="p-6 lg:p-10 space-y-8 max-w-7xl">
        <div className="animate-fade-up">
          <h1 className="text-4xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-white/60 mt-2">Welcome back, {user.email.split("@")[0]} · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="glass glass-hover rounded-2xl p-5 animate-fade-up"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shadow-lg", s.gradient)}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <div className="inline-flex items-center gap-1 text-xs text-success">
                  <TrendingUp className="w-3 h-3" />
                </div>
              </div>
              <div className="mt-4 text-xs uppercase tracking-wider text-white/50">{s.label}</div>
              <div className="text-3xl font-extrabold mt-1 tracking-tight">{s.value}</div>
              <div className="text-xs text-white/60 mt-1.5">{s.trend}</div>
            </div>
          ))}
        </div>

        <div className="hero-white p-7 animate-fade-up" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold hero-text">Sandbox Runs</h2>
              <p className="text-sm hero-text-muted mt-0.5">Last 7 days</p>
            </div>
            <div className="flex items-center gap-2 text-xs hero-text-muted">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Executions
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
                  labelStyle={{ color: "#1e293b", fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="runs" stroke="url(#strokeGrad)" strokeWidth={3} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl overflow-hidden animate-fade-up" style={{ animationDelay: "400ms" }}>
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-bold">Recent Activity</h2>
            <p className="text-sm text-white/60">Last 10 sandbox executions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr className="text-left text-xs uppercase tracking-wider text-white/50">
                  <th className="px-6 py-3 font-medium">Timestamp</th>
                  <th className="px-6 py-3 font-medium">Language</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Duration</th>
                  <th className="px-6 py-3 font-medium">Tenant</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r, i) => (
                  <tr key={i} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3 text-white/70">{r.time} Today</td>
                    <td className="px-6 py-3 font-medium">{r.lang}</td>
                    <td className="px-6 py-3">
                      {r.status === "ok" && <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-success/15 text-success text-xs"><Check className="w-3 h-3" /> Completed</span>}
                      {r.status === "fail" && <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-destructive/15 text-destructive text-xs"><X className="w-3 h-3" /> Failed</span>}
                      {r.status === "running" && <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-info/15 text-info text-xs"><Loader2 className="w-3 h-3 animate-spin" /> Running</span>}
                    </td>
                    <td className="px-6 py-3 font-mono text-xs">{r.dur}</td>
                    <td className="px-6 py-3 font-mono text-xs text-white/60">{r.tenant}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
