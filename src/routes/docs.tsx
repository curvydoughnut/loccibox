import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/lib/auth";
import { Play, BookOpen, Lock, Split, Code2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/docs")({
  head: () => ({ meta: [{ title: "Documentation — SandboxAPI" }] }),
  component: Page,
});

const sections = [
  { id: "quickstart", label: "Quick Start", icon: Play },
  { id: "api", label: "API Reference", icon: BookOpen },
  { id: "auth", label: "Authentication", icon: Lock },
  { id: "dual", label: "Dual Sandbox Testing", icon: Split },
  { id: "examples", label: "Code Examples", icon: Code2 },
];

function Block({ code, lang }: { code: string; lang?: string }) {
  return (
    <div className="relative group rounded-lg border border-border bg-[#0f172a] overflow-hidden">
      {lang && <div className="absolute top-2 left-3 text-[10px] uppercase tracking-wider text-muted-foreground">{lang}</div>}
      <Button
        size="sm" variant="ghost"
        onClick={() => { navigator.clipboard.writeText(code); toast.success("Copied"); }}
        className="absolute top-1 right-1 h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
      ><Copy className="w-3 h-3" /></Button>
      <pre className="overflow-auto p-4 pt-7 text-xs font-mono leading-relaxed text-foreground/90"><code>{code}</code></pre>
    </div>
  );
}

function Page() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  const [active, setActive] = useState("quickstart");

  return (
    <AppLayout>
      <div className="grid grid-cols-[260px_1fr] min-h-[calc(100vh-4rem)]">
        <aside className="border-r border-border p-4 sticky top-16 self-start">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 py-2">Navigation</div>
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => { setActive(s.id); document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                className={cn(
                  "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  active === s.id ? "bg-primary/15 text-foreground border border-primary/30" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" /> {s.label}
              </button>
            );
          })}
        </aside>

        <div className="p-10 max-w-3xl space-y-12">
          <section id="quickstart" className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Quick Start</h1>
            <p className="text-muted-foreground">Get a sandbox running in under a minute.</p>
            <h3 className="font-semibold mt-6">Step 1 · Get your API Key</h3>
            <p className="text-sm text-muted-foreground">Visit the API Keys page and click "Create New API Key". Save the key safely.</p>
            <h3 className="font-semibold">Step 2 · Run code via cURL</h3>
            <Block lang="bash" code={`curl -X POST https://api.sandboxapi.com/api/sandbox/run \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "language": "python",
    "code": "print(\\"Hello, SandboxAPI!\\")"
  }'`} />
            <h3 className="font-semibold">Example Response</h3>
            <Block lang="json" code={`{
  "success": true,
  "data": {
    "sandbox_id": "sbox_abc123",
    "status": "completed",
    "stdout": "Hello, SandboxAPI!",
    "stderr": "",
    "exit_code": 0,
    "duration_ms": 87
  }
}`} />
          </section>

          <section id="api" className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">API Reference</h1>

            <h3 className="font-semibold mt-4">POST /api/sandbox/run</h3>
            <p className="text-sm text-muted-foreground">Execute code in an isolated microVM.</p>
            <Block lang="json" code={`// Request body
{
  "language": "python" | "node" | "bash" | "ruby",
  "code": "string",
  "timeout": 30  // optional, seconds
}`} />

            <h3 className="font-semibold mt-4">GET /api/sandbox/:id/status</h3>
            <p className="text-sm text-muted-foreground">Check the status of a running sandbox.</p>
            <Block lang="bash" code={`curl https://api.sandboxapi.com/api/sandbox/sbox_abc123/status \\
  -H "Authorization: Bearer YOUR_API_KEY"`} />

            <h3 className="font-semibold mt-4">DELETE /api/sandbox/:id</h3>
            <p className="text-sm text-muted-foreground">Stop and destroy a running sandbox.</p>
            <Block lang="bash" code={`curl -X DELETE https://api.sandboxapi.com/api/sandbox/sbox_abc123 \\
  -H "Authorization: Bearer YOUR_API_KEY"`} />
          </section>

          <section id="auth" className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Authentication</h1>
            <p className="text-sm text-muted-foreground">All requests require a Bearer token in the Authorization header.</p>
            <Block lang="bash" code={`Authorization: Bearer sk_live_...`} />
            <h3 className="font-semibold">Rate Limiting</h3>
            <p className="text-sm text-muted-foreground">Default 100 requests per minute. Exceeding it returns 429 with a <code className="font-mono text-xs">retry_after</code> field.</p>
            <h3 className="font-semibold">Error Codes</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li><span className="font-mono">400</span> — Bad request (invalid language, missing fields)</li>
              <li><span className="font-mono">401</span> — Missing or invalid API key</li>
              <li><span className="font-mono">429</span> — Rate limited</li>
              <li><span className="font-mono">500</span> — Internal sandbox error</li>
            </ul>
          </section>

          <section id="dual" className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Dual Sandbox Testing</h1>
            <p className="text-muted-foreground">Two isolated microVMs working in tandem — one for source, one for tests.</p>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-5">
              <li>Write your code in the left editor</li>
              <li>Code syncs to the test sandbox in real-time</li>
              <li>Write assertions on the right</li>
              <li>Press <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-xs">Ctrl/Cmd+Enter</kbd> or click Run Tests</li>
              <li>See results instantly with pass/fail status</li>
            </ol>
            <Block lang="python" code={`# Left
def fibonacci(n):
    if n <= 1: return n
    return fibonacci(n-1) + fibonacci(n-2)

# Right
assert fibonacci(5) == 5
assert fibonacci(10) == 55
print("✓ All tests passed!")`} />
          </section>

          <section id="examples" className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Code Examples</h1>
            <h3 className="font-semibold">Python</h3>
            <Block lang="python" code={`import requests

api_key = "YOUR_API_KEY"
res = requests.post(
    "https://api.sandboxapi.com/api/sandbox/run",
    headers={"Authorization": f"Bearer {api_key}"},
    json={"language": "python", "code": "print('hi')", "timeout": 30}
)
print(res.json()["data"]["stdout"])`} />

            <h3 className="font-semibold">Node.js</h3>
            <Block lang="javascript" code={`import axios from "axios";

const { data } = await axios.post(
  "https://api.sandboxapi.com/api/sandbox/run",
  { language: "node", code: "console.log('hi')", timeout: 30 },
  { headers: { Authorization: \`Bearer \${process.env.API_KEY}\` } }
);
console.log(data.data.stdout);`} />

            <h3 className="font-semibold">Bash</h3>
            <Block lang="bash" code={`curl -X POST https://api.sandboxapi.com/api/sandbox/run \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "language": "bash", "code": "echo Hello" }' | jq '.data'`} />
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
