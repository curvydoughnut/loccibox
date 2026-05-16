import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Boxes, ArrowRight, BookOpen, Layers, Shield, Server, Mail, Lock, Loader2, Github, Twitter } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Locci Box — Every agent deserves its own computer" },
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
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/dashboard" }); }, [user, navigate]);

  const openLogin = () => {
    setShowLogin(true);
    setTimeout(() => document.getElementById("login")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";
    if (password.length < 6) errs.password = "Min 6 characters";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    try {
      await login(email, { password });
      toast.success("Welcome to Locci Box");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const enterDemo = async () => {
    setSubmitting(true);
    try {
      await login("demo@loccibox.dev", { isDemo: true });
      toast.success("Demo mode activated");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Demo failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full" style={{ background: "#e8f4f9" }}>
      {/* Top Nav */}
      <header
        className="mx-auto max-w-[1400px] flex items-center justify-between px-4 sm:px-6 md:px-10 h-16 sm:h-20 rounded-2xl mt-3 sm:mt-4"
        style={{ background: "#ffffff", boxShadow: "0 2px 8px rgba(15,42,75,0.06)" }}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#4a5ed8,#6b7fd9)" }}>
            <Boxes className="w-5 h-5" style={{ color: "#fff" }} />
          </div>
          <span className="font-bold tracking-tight text-base sm:text-lg truncate" style={{ color: "#1a3a52" }}>Locci Box</span>
        </div>

        <nav className="hidden lg:flex items-center gap-10 text-sm font-medium" style={{ color: "#1a3a52" }}>
          <a href="#" className="hover:opacity-70">Documentation</a>
          <a href="#" className="hover:opacity-70">Pricing</a>
          <a href="#" className="hover:opacity-70">Use Cases</a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={openLogin} className="text-sm font-medium px-2 py-1" style={{ color: "#1a3a52" }}>
            Sign In
          </button>
          <button
            onClick={openLogin}
            className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all hover:-translate-y-0.5 whitespace-nowrap"
            style={{ background: "#3b82f6", color: "#fff", boxShadow: "0 4px 12px rgba(59,130,246,0.30)" }}
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Hero */}
      <section
        className="mx-auto max-w-[1400px] mt-6 sm:mt-8 rounded-2xl sm:rounded-[28px] px-6 sm:px-10 lg:px-14 py-10 sm:py-14 lg:py-20 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center"
        style={{ background: "linear-gradient(135deg,#4a5ed8,#6b7fd9)" }}
      >
        <div className="space-y-7 animate-fade-up">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-[0.14em]"
            style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#fff" }} />
            V2.0 ARCHITECTURE LIVE
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight" style={{ color: "#fff" }}>
            Every agent deserves its own computer
          </h1>
          <p className="text-sm sm:text-base lg:text-lg max-w-xl leading-relaxed" style={{ color: "rgba(255,255,255,0.88)" }}>
            Hardware-isolated microVMs for safe code execution. Deploy untrusted workloads with zero-trust infrastructure in milliseconds.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={openLogin}
              className="inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-lg text-sm font-semibold transition-all hover:-translate-y-0.5"
              style={{ background: "#fff", color: "#4a5ed8", border: "2px solid #fff" }}
            >
              Sign Up Free <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={enterDemo}
              className="inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-lg text-sm font-semibold transition-all"
              style={{ background: "rgba(255,255,255,0.18)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)" }}
            >
              <BookOpen className="w-4 h-4" /> Demo
            </button>
          </div>
          <p className="text-xs lg:hidden" style={{ color: "rgba(255,255,255,0.8)" }}>
            Already have an account?{" "}
            <button onClick={openLogin} className="underline font-semibold" style={{ color: "#fff" }}>
              Sign in
            </button>
          </p>
        </div>

        {/* Login card — always visible on desktop; togglable on mobile/tablet */}
        <div
          id="login"
          className={`${showLogin ? "block" : "hidden"} lg:block rounded-2xl p-6 sm:p-8 animate-scale`}
          style={{ background: "rgba(45,74,105,0.28)", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}
        >
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: "#fff" }}>Access Sandbox</h2>
          <p className="text-sm mt-1.5" style={{ color: "rgba(255,255,255,0.72)" }}>Enter your credentials to manage microVMs.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#fff" }}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.6)" }} />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255}
                  placeholder="admin@enterprise.com"
                  className="w-full pl-10 pr-3 py-3 rounded-lg text-sm outline-none transition-colors"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.22)", color: "#fff" }}
                />
              </div>
              {errors.email && <p className="text-xs mt-1" style={{ color: "#fecaca" }}>{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold" style={{ color: "#fff" }}>Password</label>
                <a href="#" className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.6)" }} />
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)} maxLength={128}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-3 rounded-lg text-sm outline-none transition-colors"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.22)", color: "#fff" }}
                />
              </div>
              {errors.password && <p className="text-xs mt-1" style={{ color: "#fecaca" }}>{errors.password}</p>}
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "rgba(255,255,255,0.85)" }}>
              <input
                type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded accent-white"
              />
              Remember me
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg text-sm font-semibold transition-all hover:-translate-y-0.5"
              style={{ background: "#fff", color: "#4a5ed8" }}
            >
              {submitting ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</span> : "Sign In to Console"}
            </button>
          </form>

          <p className="text-[11px] text-center mt-4" style={{ color: "rgba(255,255,255,0.6)" }}>
            Secured by Enterprise SSO &amp; Hardware Enclaves
          </p>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-[1400px] mt-8 grid md:grid-cols-3 gap-6 px-2">
        {[
          { Icon: Layers,  title: "Dual Sandbox Testing",  desc: "Run untrusted code in parallel environments. Compare outputs instantly with zero risk to your primary infrastructure or host OS." },
          { Icon: Shield,  title: "Complete Isolation",    desc: "Hardware-enforced boundaries ensure absolute separation. Network, memory, and CPU are rigidly partitioned per microVM instance." },
          { Icon: Server,  title: "Enterprise Security",   desc: "SOC2 Type II certified infrastructure. Granular RBAC, audit logging, and automated compliance reporting built into the core." },
        ].map(({ Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl p-8 min-h-[260px] flex flex-col transition-transform hover:-translate-y-1"
            style={{ background: "linear-gradient(135deg,#5568d3,#5a8fbf)", boxShadow: "0 8px 24px rgba(15,42,75,0.12)" }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
              style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              <Icon className="w-5 h-5" style={{ color: "#fff" }} />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: "#fff" }}>{title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>{desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer
        className="mx-auto max-w-[1400px] mt-10 mb-6 rounded-2xl px-10 py-8"
        style={{ background: "linear-gradient(135deg,#4a5ed8,#6b7fd9)" }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.18)" }}>
              <Boxes className="w-4 h-4" style={{ color: "#fff" }} />
            </div>
            <span className="text-sm font-semibold" style={{ color: "#fff" }}>Locci Box Inc.</span>
          </div>

          <nav className="flex items-center gap-8 text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
            <a href="#" className="hover:text-white">Documentation</a>
            <a href="#" className="hover:text-white">System Status</a>
            <a href="#" className="hover:text-white">Privacy Policy</a>
          </nav>

          <div className="flex items-center gap-3">
            <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.18)" }}>
              <Github className="w-4 h-4" style={{ color: "#fff" }} />
            </a>
            <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.18)" }}>
              <Twitter className="w-4 h-4" style={{ color: "#fff" }} />
            </a>
          </div>
        </div>

        <div className="mt-6 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs" style={{ borderTop: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.75)" }}>
          <span>© 2026 Locci Box. All rights reserved.</span>
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} />
            Systems Operational
          </span>
        </div>
      </footer>
    </div>
  );
}
