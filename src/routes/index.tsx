import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Boxes, Split, Shield, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SandboxAPI — Every agent deserves its own computer" },
      { name: "description", content: "Hardware-isolated microVMs for safe code execution. Dual sandbox testing for AI agents." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Split, title: "Dual Sandbox Testing", desc: "Write code while testing it", gradient: "bg-gradient-purple-pink" },
  { icon: Shield, title: "Complete Isolation", desc: "Hardware-isolated microVMs", gradient: "bg-gradient-cyan-blue" },
  { icon: Lock, title: "Enterprise Security", desc: "Secure, audited, compliant", gradient: "bg-gradient-teal-green" },
];

function Landing() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => { if (user) navigate({ to: "/dashboard" }); }, [user, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";
    if (password.length < 6) errs.password = "Min 6 characters";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    login(email);
    toast.success("Welcome to SandboxAPI");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-20 px-6 lg:px-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-primary">
            <Boxes className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-lg">SandboxAPI</span>
        </div>
        <Button asChild className="bg-gradient-primary hover:opacity-90 text-white shadow-primary">
          <a href="#login">Sign In</a>
        </Button>
      </header>

      <section className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-10 py-16 grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-white/80">Live microVMs · sub-100ms cold start</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.02]">
            Every agent <br />
            deserves its own <span className="text-gradient-primary">computer</span>
          </h1>
          <p className="text-xl text-white/70 font-light max-w-xl leading-relaxed">
            Hardware-isolated microVMs for safe code execution. Built for AI agents that write, test, and ship code at scale.
          </p>

          <div className="grid sm:grid-cols-3 gap-3 pt-2">
            {features.map((f) => (
              <div key={f.title} className="glass glass-hover p-4 rounded-xl">
                <div className={`w-10 h-10 rounded-lg ${f.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <div className="font-semibold text-sm">{f.title}</div>
                <div className="text-xs text-white/60 mt-1">{f.desc}</div>
              </div>
            ))}
          </div>

          <Button asChild size="lg" className="bg-gradient-primary text-white hover:opacity-90 text-base h-12 px-7 shadow-primary">
            <a href="#login">Get Started <ArrowRight className="w-4 h-4 ml-1" /></a>
          </Button>
        </div>

        <div id="login" className="hero-white p-10 animate-scale">
          <h2 className="text-2xl font-bold tracking-tight hero-text">Sign in to your workspace</h2>
          <p className="text-sm hero-text-muted mt-1">Demo mode — any valid credentials work.</p>
          <form onSubmit={submit} className="mt-7 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="hero-text font-medium">Email</Label>
              <Input
                id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="bg-white border-slate-200 hero-text placeholder:text-slate-400 focus-visible:ring-blue-500"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="hero-text font-medium">Password</Label>
              <Input
                id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-white border-slate-200 hero-text placeholder:text-slate-400 focus-visible:ring-blue-500"
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>
            <Button type="submit" className="w-full bg-gradient-primary text-white hover:opacity-90 h-11 shadow-primary">Sign In</Button>
            <p className="text-xs text-center hero-text-muted">
              Don't have an account? <Link to="/" className="text-blue-600 hover:underline font-medium">Sign up</Link>
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
