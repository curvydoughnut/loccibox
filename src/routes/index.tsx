import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
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

function Landing() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

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
    <div className="min-h-screen bg-app-gradient">
      <header className="h-16 px-6 flex items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow">
            <Boxes className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight">SandboxAPI</span>
        </div>
        <Button asChild className="bg-gradient-brand text-primary-foreground hover:opacity-90">
          <a href="#login">Sign In</a>
        </Button>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-12 grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/50 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Live microVMs · sub-100ms cold start
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
            Every agent <br />
            deserves its own <span className="text-gradient-brand">computer</span>
          </h1>
          <p className="text-xl text-muted-foreground font-light max-w-xl">
            Hardware-isolated microVMs for safe code execution. Built for AI agents that write, test, and ship code at scale.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            {[
              { icon: Split, title: "Dual Sandbox Testing", desc: "Write code while testing it" },
              { icon: Shield, title: "Complete Isolation", desc: "Hardware-isolated microVMs" },
              { icon: Lock, title: "Enterprise Security", desc: "Secure, audited, compliant" },
            ].map((f) => (
              <div key={f.title} className="p-4 rounded-xl border border-border bg-card/50">
                <f.icon className="w-5 h-5 text-primary mb-2" />
                <div className="font-medium text-sm">{f.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{f.desc}</div>
              </div>
            ))}
          </div>

          <Button asChild size="lg" className="bg-gradient-brand text-primary-foreground hover:opacity-90 text-base h-12 px-6 shadow-glow">
            <a href="#login">Get Started <ArrowRight className="w-4 h-4 ml-1" /></a>
          </Button>
        </div>

        <Card id="login" className="p-8 bg-card/80 backdrop-blur border-border shadow-glow animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <h2 className="text-2xl font-semibold tracking-tight">Sign in to your workspace</h2>
          <p className="text-sm text-muted-foreground mt-1">Demo mode — any valid credentials work.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            <Button type="submit" className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90 h-11">Sign In</Button>
            <p className="text-xs text-center text-muted-foreground">
              Don't have an account? <Link to="/" className="text-primary hover:underline">Sign up</Link>
            </p>
          </form>
        </Card>
      </section>
    </div>
  );
}
