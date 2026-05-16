import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Boxes, Split, Shield, Lock, ArrowRight, Sparkles, Building2, KeyRound } from "lucide-react";
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
  const [orgDomain, setOrgDomain] = useState("");
  const [ssoEmail, setSsoEmail] = useState("");
  const [ssoErrors, setSsoErrors] = useState<{ orgDomain?: string; ssoEmail?: string }>({});

  useEffect(() => { if (user) navigate({ to: "/dashboard" }); }, [user, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";
    if (password.length < 6) errs.password = "Min 6 characters";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    login(email);
    toast.success("Welcome to Locci Box");
    navigate({ to: "/dashboard" });
  };

  const enterDemo = () => {
    login("demo@sandboxapi.dev", { isDemo: true });
    toast.success("Demo mode activated");
    navigate({ to: "/dashboard" });
  };

  const submitSso = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof ssoErrors = {};
    if (!/^[a-z0-9-]+\.[a-z]{2,}$/i.test(orgDomain)) errs.orgDomain = "Enter your company domain (e.g. acme.com)";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ssoEmail)) errs.ssoEmail = "Enter your work email";
    setSsoErrors(errs);
    if (Object.keys(errs).length) return;
    const org = orgDomain.split(".")[0];
    toast.success(`Redirecting to ${org}'s identity provider…`);
    setTimeout(() => {
      login(ssoEmail, { isEnterprise: true, org });
      navigate({ to: "/dashboard" });
    }, 700);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 sm:h-20 px-4 sm:px-6 lg:px-10 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-primary">
            <Boxes className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-base sm:text-lg">Locci Box</span>
        </div>
        <Button asChild size="sm" className="bg-gradient-primary hover:opacity-90 text-white shadow-primary">
          <a href="#login">Sign In</a>
        </Button>
      </header>

      <section className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-16 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="space-y-6 sm:space-y-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-white/80">Live microVMs · sub-100ms cold start</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
            Every agent <br />
            deserves its own <span className="text-gradient-primary">computer</span>
          </h1>
          <p className="text-base sm:text-xl text-white/70 font-light max-w-xl leading-relaxed">
            Hardware-isolated microVMs for safe code execution. Built for AI agents that write, test, and ship code at scale.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
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

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-gradient-primary text-white hover:opacity-90 text-base h-12 px-7 shadow-primary">
              <a href="#login">Get Started <ArrowRight className="w-4 h-4 ml-1" /></a>
            </Button>
            <Button onClick={enterDemo} size="lg" variant="outline" className="h-12 px-7 glass glass-hover border-white/20 text-white hover:text-white">
              <Sparkles className="w-4 h-4 mr-1" /> Try Demo
            </Button>
          </div>
        </div>

        <div id="login" className="hero-white p-6 sm:p-8 lg:p-10 animate-scale">
          <h2 className="text-2xl font-bold tracking-tight hero-text">Sign in to your workspace</h2>
          <p className="text-sm hero-text-muted mt-1">Use email or your company SSO — or skip ahead with the demo.</p>

          <Tabs defaultValue="email" className="mt-6">
            <TabsList className="grid grid-cols-2 w-full bg-slate-100">
              <TabsTrigger value="email" className="data-[state=active]:bg-white data-[state=active]:hero-text">
                <KeyRound className="w-3.5 h-3.5 mr-1.5" /> Email
              </TabsTrigger>
              <TabsTrigger value="sso" className="data-[state=active]:bg-white data-[state=active]:hero-text">
                <Building2 className="w-3.5 h-3.5 mr-1.5" /> Enterprise SSO
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="mt-5">
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="hero-text font-medium">Email</Label>
                  <Input
                    id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com" maxLength={255}
                    className="bg-white border-slate-200 hero-text placeholder:text-slate-400 focus-visible:ring-blue-500"
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="hero-text font-medium">Password</Label>
                  <Input
                    id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" maxLength={128}
                    className="bg-white border-slate-200 hero-text placeholder:text-slate-400 focus-visible:ring-blue-500"
                  />
                  {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                </div>
                <Button type="submit" className="w-full bg-gradient-primary text-white hover:opacity-90 h-11 shadow-primary">Sign In</Button>
              </form>
            </TabsContent>

            <TabsContent value="sso" className="mt-5">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 mb-4 flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div className="text-xs hero-text-muted leading-relaxed">
                  SAML 2.0 · Okta · Azure AD · Google Workspace · SCIM provisioning · audit logs included.
                </div>
              </div>
              <form onSubmit={submitSso} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org" className="hero-text font-medium">Company Domain</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-200 bg-slate-50 text-xs hero-text-muted font-mono">https://</span>
                    <Input
                      id="org" value={orgDomain} onChange={(e) => setOrgDomain(e.target.value.toLowerCase().trim())}
                      placeholder="acme.com" maxLength={120}
                      className="bg-white border-slate-200 hero-text placeholder:text-slate-400 focus-visible:ring-blue-500 rounded-l-none"
                    />
                  </div>
                  {ssoErrors.orgDomain && <p className="text-xs text-red-500">{ssoErrors.orgDomain}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sso-email" className="hero-text font-medium">Work Email</Label>
                  <Input
                    id="sso-email" type="email" value={ssoEmail} onChange={(e) => setSsoEmail(e.target.value)}
                    placeholder="you@acme.com" maxLength={255}
                    className="bg-white border-slate-200 hero-text placeholder:text-slate-400 focus-visible:ring-blue-500"
                  />
                  {ssoErrors.ssoEmail && <p className="text-xs text-red-500">{ssoErrors.ssoEmail}</p>}
                </div>
                <Button type="submit" className="w-full bg-gradient-primary text-white hover:opacity-90 h-11 shadow-primary">
                  <Building2 className="w-4 h-4 mr-2" /> Continue with SSO
                </Button>
                <p className="text-[11px] text-center hero-text-muted">
                  Need to set up SSO? <a href="#" className="text-blue-600 hover:underline font-medium">Talk to sales</a>
                </p>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-[11px] uppercase tracking-wider hero-text-muted font-semibold">or</span></div>
          </div>

          <Button type="button" onClick={enterDemo} variant="outline" className="w-full h-11 border-slate-200 hero-text hover:bg-slate-50">
            <Sparkles className="w-4 h-4 mr-2" /> Explore in Demo Mode
          </Button>
          <p className="text-[11px] text-center hero-text-muted mt-3">
            Demo opens every feature with sample data — no signup required.
          </p>
        </div>
      </section>
    </div>
  );
}
