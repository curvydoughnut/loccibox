import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/lib/auth";
import { Play, BookOpen, Lock, Split, Code2, Copy, Upload, FolderPlus, Folder, FileText, Trash2, FileUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/docs")({
  head: () => ({ meta: [{ title: "Documentation — Locci Box" }] }),
  component: Page,
});

const sections = [
  { id: "my-docs", label: "My Documents", icon: FileText, gradient: "bg-gradient-primary" },
  { id: "quickstart", label: "Quick Start", icon: Play, gradient: "bg-gradient-cyan-blue" },
  { id: "api", label: "API Reference", icon: BookOpen, gradient: "bg-gradient-purple-pink" },
  { id: "auth", label: "Authentication", icon: Lock, gradient: "bg-gradient-cyan-teal" },
  { id: "dual", label: "Dual Sandbox", icon: Split, gradient: "bg-gradient-amber-orange" },
  { id: "examples", label: "Examples", icon: Code2, gradient: "bg-gradient-teal-green" },
];

function Block({ code, lang }: { code: string; lang?: string }) {
  return (
    <div className="relative group rounded-xl border hero-border bg-white overflow-hidden">
      {lang && <div className="absolute top-2 left-3 text-[10px] uppercase tracking-wider hero-text-muted font-semibold">{lang}</div>}
      <Button
        size="sm" variant="ghost"
        onClick={() => { navigator.clipboard.writeText(code); toast.success("Copied"); }}
        className="absolute top-1 right-1 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 hero-text hover:bg-slate-100"
      ><Copy className="w-3 h-3" /></Button>
      <pre className="overflow-auto p-4 pt-7 text-xs font-mono leading-relaxed hero-text"><code>{code}</code></pre>
    </div>
  );
}

function Page() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  const [active, setActive] = useState("my-docs");

  type DocItem = { id: string; name: string; kind: "folder" | "file"; size?: number; createdAt: string };
  const [items, setItems] = useState<DocItem[]>([
    { id: "d1", name: "Onboarding", kind: "folder", createdAt: "2 days ago" },
    { id: "d2", name: "API Quickstart.pdf", kind: "file", size: 248_000, createdAt: "1 day ago" },
    { id: "d3", name: "Sandbox Notes.md", kind: "file", size: 12_400, createdAt: "3h ago" },
  ]);
  const fileInput = useRef<HTMLInputElement | null>(null);

  const onUploadClick = () => fileInput.current?.click();
  const onFilesPicked = (files: FileList | null) => {
    if (!files || !files.length) return;
    const added: DocItem[] = Array.from(files).map((f, i) => ({
      id: `f-${Date.now()}-${i}`,
      name: f.name,
      kind: "file",
      size: f.size,
      createdAt: "just now",
    }));
    setItems((s) => [...added, ...s]);
    toast.success(`${added.length} file${added.length > 1 ? "s" : ""} uploaded`);
  };
  const onNewFolder = () => {
    const name = window.prompt("Folder name");
    if (!name?.trim()) return;
    setItems((s) => [{ id: `fd-${Date.now()}`, name: name.trim(), kind: "folder", createdAt: "just now" }, ...s]);
    toast.success("Folder created");
  };
  const removeItem = (id: string) => setItems((s) => s.filter((x) => x.id !== id));
  const formatSize = (n?: number) => {
    if (!n) return "—";
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] min-h-[calc(100vh-9rem)] gap-4 sm:gap-6 p-4 sm:p-6 lg:p-10 max-w-[1400px] mx-auto w-full">
        <aside className="glass rounded-2xl p-3 sm:p-4 self-start lg:sticky lg:top-24 h-fit overflow-x-auto">
          <div className="text-xs font-semibold uppercase tracking-wider text-white/50 px-2 py-2">Navigation</div>
          <div className="flex lg:block gap-1.5 lg:gap-0">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => { setActive(s.id); document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                className={cn(
                  "lg:w-full flex items-center gap-2 lg:gap-3 rounded-xl px-3 py-2 lg:py-2.5 text-xs lg:text-sm font-medium transition-all group whitespace-nowrap shrink-0",
                  active === s.id ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                <span className={cn("w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 shrink-0", s.gradient)}>
                  <Icon className="w-4 h-4 text-white" />
                </span>
                {s.label}
              </button>
            );
          })}
          </div>
        </aside>

        <div className="hero-white p-5 sm:p-8 lg:p-12 space-y-10 sm:space-y-14 max-w-none min-w-0">
          <section id="my-docs" className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight hero-text">My Documents</h1>
                <p className="hero-text-muted text-sm mt-1">Upload, organize, and access your sandbox docs.</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInput}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => { onFilesPicked(e.target.files); e.target.value = ""; }}
                />
                <Button onClick={onUploadClick} className="bg-gradient-primary text-white hover:opacity-90 h-10 shadow-primary">
                  <Upload className="w-4 h-4 mr-2" /> Upload
                </Button>
                <Button onClick={onNewFolder} variant="outline" className="h-10 hero-text border-slate-200 hover:bg-slate-100">
                  <FolderPlus className="w-4 h-4 mr-2" /> New folder
                </Button>
              </div>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={(e) => { e.preventDefault(); onFilesPicked(e.dataTransfer.files); }}
              className="rounded-xl border-2 border-dashed hero-border bg-slate-50/60 px-4 py-6 text-center text-sm hero-text-muted hover:bg-slate-50 transition-colors"
            >
              <FileUp className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              Drag & drop files here, or use the Upload button.
            </div>

            <div className="rounded-xl border hero-border overflow-hidden bg-white">
              <div className="grid grid-cols-[1fr_120px_140px_40px] px-4 py-2 text-[11px] uppercase tracking-wider font-semibold hero-text-muted border-b hero-divider bg-slate-50">
                <div>Name</div>
                <div>Size</div>
                <div>Created</div>
                <div />
              </div>
              {items.length === 0 ? (
                <div className="p-6 text-center text-sm hero-text-muted">No documents yet. Upload one or create a folder.</div>
              ) : (
                items.map((it) => (
                  <div key={it.id} className="grid grid-cols-[1fr_120px_140px_40px] items-center px-4 py-2.5 text-sm hero-text border-b last:border-b-0 hero-divider hover:bg-slate-50">
                    <div className="flex items-center gap-2 min-w-0">
                      {it.kind === "folder"
                        ? <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                        : <FileText className="w-4 h-4 text-blue-500 shrink-0" />}
                      <span className="truncate">{it.name}</span>
                    </div>
                    <div className="hero-text-muted text-xs">{it.kind === "folder" ? "—" : formatSize(it.size)}</div>
                    <div className="hero-text-muted text-xs">{it.createdAt}</div>
                    <button
                      onClick={() => removeItem(it.id)}
                      className="w-7 h-7 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          <section id="quickstart" className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight hero-text">Quick Start</h1>
            <p className="hero-text-muted">Get a sandbox running in under a minute.</p>
            <h3 className="font-semibold mt-6 hero-text">Step 1 · Get your API Key</h3>
            <p className="text-sm hero-text-muted">Visit the API Keys page and click "Create New API Key". Save the key safely.</p>
            <h3 className="font-semibold hero-text">Step 2 · Run code via cURL</h3>
            <Block lang="bash" code={`curl -X POST https://api.sandboxapi.com/api/sandbox/run \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "language": "python",
    "code": "print(\\"Hello, Locci Box!\\")"
  }'`} />
            <h3 className="font-semibold hero-text">Example Response</h3>
            <Block lang="json" code={`{
  "success": true,
  "data": {
    "sandbox_id": "sbox_abc123",
    "status": "completed",
    "stdout": "Hello, Locci Box!",
    "stderr": "",
    "exit_code": 0,
    "duration_ms": 87
  }
}`} />
          </section>

          <section id="api" className="space-y-4">
            <h1 className="text-3xl font-extrabold tracking-tight hero-text">API Reference</h1>

            <h3 className="font-semibold mt-4 hero-text">POST /api/sandbox/run</h3>
            <p className="text-sm hero-text-muted">Execute code in an isolated microVM.</p>
            <Block lang="json" code={`{
  "language": "python" | "node" | "bash" | "ruby",
  "code": "string",
  "timeout": 30
}`} />

            <h3 className="font-semibold mt-4 hero-text">GET /api/sandbox/:id/status</h3>
            <p className="text-sm hero-text-muted">Check the status of a running sandbox.</p>
            <Block lang="bash" code={`curl https://api.sandboxapi.com/api/sandbox/sbox_abc123/status \\
  -H "Authorization: Bearer YOUR_API_KEY"`} />

            <h3 className="font-semibold mt-4 hero-text">DELETE /api/sandbox/:id</h3>
            <p className="text-sm hero-text-muted">Stop and destroy a running sandbox.</p>
            <Block lang="bash" code={`curl -X DELETE https://api.sandboxapi.com/api/sandbox/sbox_abc123 \\
  -H "Authorization: Bearer YOUR_API_KEY"`} />
          </section>

          <section id="auth" className="space-y-4">
            <h1 className="text-3xl font-extrabold tracking-tight hero-text">Authentication</h1>
            <p className="text-sm hero-text-muted">All requests require a Bearer token in the Authorization header.</p>
            <Block lang="http" code={`Authorization: Bearer sk_live_...`} />
            <h3 className="font-semibold hero-text">Rate Limiting</h3>
            <p className="text-sm hero-text-muted">Default 100 requests per minute. Exceeding it returns 429 with a <code className="font-mono text-xs px-1 py-0.5 bg-slate-100 rounded">retry_after</code> field.</p>
            <h3 className="font-semibold hero-text">Error Codes</h3>
            <ul className="text-sm hero-text-muted space-y-1 list-disc pl-5">
              <li><span className="font-mono">400</span> — Bad request (invalid language, missing fields)</li>
              <li><span className="font-mono">401</span> — Missing or invalid API key</li>
              <li><span className="font-mono">429</span> — Rate limited</li>
              <li><span className="font-mono">500</span> — Internal sandbox error</li>
            </ul>
          </section>

          <section id="dual" className="space-y-4">
            <h1 className="text-3xl font-extrabold tracking-tight hero-text">Dual Sandbox Testing</h1>
            <p className="hero-text-muted">Two isolated microVMs working in tandem — one for source, one for tests.</p>
            <ol className="text-sm hero-text-muted space-y-2 list-decimal pl-5">
              <li>Write your code in the left editor</li>
              <li>Code syncs to the test sandbox in real-time</li>
              <li>Write assertions on the right</li>
              <li>Press <kbd className="px-1.5 py-0.5 rounded border hero-border bg-slate-50 text-xs hero-text">Ctrl/Cmd+Enter</kbd> or click Run Tests</li>
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
            <h1 className="text-3xl font-extrabold tracking-tight hero-text">Code Examples</h1>
            <h3 className="font-semibold hero-text">Python</h3>
            <Block lang="python" code={`import requests
res = requests.post(
    "https://api.sandboxapi.com/api/sandbox/run",
    headers={"Authorization": f"Bearer {api_key}"},
    json={"language": "python", "code": "print('hi')", "timeout": 30}
)
print(res.json()["data"]["stdout"])`} />

            <h3 className="font-semibold hero-text">Node.js</h3>
            <Block lang="javascript" code={`import axios from "axios";
const { data } = await axios.post(
  "https://api.sandboxapi.com/api/sandbox/run",
  { language: "node", code: "console.log('hi')", timeout: 30 },
  { headers: { Authorization: \`Bearer \${process.env.API_KEY}\` } }
);
console.log(data.data.stdout);`} />

            <h3 className="font-semibold hero-text">Bash</h3>
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
