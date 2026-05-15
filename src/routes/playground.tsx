import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, RotateCcw, Check, AlertTriangle, Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/playground")({
  head: () => ({ meta: [{ title: "Dual Sandbox Playground — SandboxAPI" }] }),
  component: Page,
});

type Lang = "python" | "node" | "bash" | "ruby";
const monacoLang: Record<Lang, string> = { python: "python", node: "javascript", bash: "shell", ruby: "ruby" };

const codeStarter: Record<Lang, string> = {
  python: `def add(a, b):
    """Add two numbers"""
    return a + b

# Test this function by writing assertions on the right
`,
  node: `function add(a, b) {
  return a + b;
}

// Test this function on the right side
module.exports = { add };
`,
  bash: `#!/bin/bash

add() {
  echo $((1 + 2))
}

add
`,
  ruby: `def add(a, b)
  a + b
end

# Test on the right side
`,
};

const testStarter: Record<Lang, string> = {
  python: `# Write assertions to test your code
assert add(2, 3) == 5
assert add(-1, -2) == -3
assert add(0, 0) == 0

print("✓ All tests passed!")
`,
  node: `// The add function is imported and available
console.assert(add(2, 3) === 5);
console.assert(add(-1, -2) === -3);
console.assert(add(0, 0) === 0);

console.log("✓ All tests passed!");
`,
  bash: `result=$(add)
if [ $result -eq 3 ]; then
  echo "✓ Test passed!"
else
  echo "✗ Test failed!"
fi
`,
  ruby: `raise "Test failed" unless add(2, 3) == 5
raise "Test failed" unless add(-1, -2) == -3

puts "✓ All tests passed!"
`,
};

type SyncState = "synced" | "syncing" | "failed";
type RunState = "idle" | "running" | "passed" | "failed";

function defineDarkTheme(monaco: any) {
  monaco.editor.defineTheme("sandbox-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#0f172a",
      "editor.foreground": "#e2e8f0",
      "editorLineNumber.foreground": "#475569",
      "editor.lineHighlightBackground": "#1e293b",
      "editorCursor.foreground": "#8b5cf6",
    },
  });
}

function Page() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;

  const [lang, setLang] = useState<Lang>("python");
  const [code, setCode] = useState(codeStarter.python);
  const [tests, setTests] = useState(testStarter.python);
  const [sync, setSync] = useState<SyncState>("synced");
  const [run, setRun] = useState<RunState>("idle");
  const [output, setOutput] = useState<{ stdout: string; stderr: string; exit: number; ms: number } | null>(null);
  const [lastMs, setLastMs] = useState<number | null>(null);
  const [stats, setStats] = useState({ passed: 0, failed: 0 });
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onLangChange = (l: Lang) => {
    setLang(l);
    setCode(codeStarter[l]);
    setTests(testStarter[l]);
    setOutput(null);
    setRun("idle");
  };

  // Debounced sync simulation
  useEffect(() => {
    setSync("syncing");
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => setSync("synced"), 500);
    return () => { if (syncTimer.current) clearTimeout(syncTimer.current); };
  }, [code]);

  const runTests = async () => {
    if (sync !== "synced" || run === "running" || !tests.trim()) return;
    setRun("running");
    setOutput(null);
    const start = performance.now();

    // Simulated execution. Replace with real backend call.
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

    const ms = Math.round(performance.now() - start);
    const failedHeuristic = /assert\s+False|raise\s+"|exit\s+1/.test(tests);
    const passed = Math.max(1, (tests.match(/assert|console\.assert|raise|\[/g) || []).length);
    const failed = failedHeuristic ? 1 : 0;
    const success = !failedHeuristic;

    setOutput({
      stdout: success
        ? "✓ All tests passed!\n"
        : "Traceback (most recent call last):\n  AssertionError\n",
      stderr: success ? "" : "AssertionError: test failed",
      exit: success ? 0 : 1,
      ms,
    });
    setRun(success ? "passed" : "failed");
    setLastMs(ms);
    setStats({ passed: success ? passed : Math.max(0, passed - 1), failed });
  };

  const clear = () => {
    setOutput(null);
    setRun("idle");
  };

  // Cmd/Ctrl+Enter
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        runTests();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [tests, sync, run]);

  const SyncBadge = useMemo(() => {
    const conf = {
      synced: { cls: "bg-success/15 text-success border-success/30", icon: Check, label: "In Sync" },
      syncing: { cls: "bg-warning/15 text-warning border-warning/30", icon: Loader2, label: "Syncing..." },
      failed: { cls: "bg-destructive/15 text-destructive border-destructive/30", icon: AlertTriangle, label: "Sync Failed" },
    }[sync];
    const Icon = conf.icon;
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border", conf.cls)}>
        <Icon className={cn("w-3 h-3", sync === "syncing" && "animate-spin")} />
        {conf.label}
      </span>
    );
  }, [sync]);

  const editorOptions = {
    fontSize: 13,
    fontFamily: "Menlo, Monaco, 'Courier New', monospace",
    minimap: { enabled: false },
    tabSize: 2,
    wordWrap: "off" as const,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    padding: { top: 12, bottom: 12 },
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-4 h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dual Sandbox Playground</h1>
            <p className="text-sm text-muted-foreground">Two isolated microVMs — write on the left, test on the right.</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={lang} onValueChange={(v) => onLangChange(v as Lang)}>
              <SelectTrigger className="w-40 bg-card"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="node">Node.js</SelectItem>
                <SelectItem value="bash">Bash</SelectItem>
                <SelectItem value="ruby">Ruby</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
          {/* LEFT: code */}
          <div className="rounded-xl border border-border bg-card flex flex-col overflow-hidden">
            <div className="h-11 px-4 flex items-center justify-between border-b border-border bg-muted/20">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Code
              </div>
              {SyncBadge}
            </div>
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                language={monacoLang[lang]}
                theme="sandbox-dark"
                value={code}
                onChange={(v) => setCode(v ?? "")}
                beforeMount={defineDarkTheme}
                options={editorOptions}
              />
            </div>
          </div>

          {/* RIGHT: tests + output */}
          <div className="rounded-xl border border-border bg-card flex flex-col overflow-hidden">
            <div className="h-11 px-4 flex items-center justify-between border-b border-border bg-muted/20">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-purple" />
                Test Code
                <span className="text-xs text-muted-foreground font-normal ml-2">Write assertions to test your code</span>
              </div>
              <RunBadge state={run} />
            </div>
            <div className="flex-1 min-h-0 grid grid-rows-[1.4fr_1fr]">
              <div className="border-b border-border min-h-0">
                <Editor
                  height="100%"
                  language={monacoLang[lang]}
                  theme="sandbox-dark"
                  value={tests}
                  onChange={(v) => setTests(v ?? "")}
                  beforeMount={defineDarkTheme}
                  options={editorOptions}
                />
              </div>
              <div className="bg-background flex flex-col min-h-0">
                <div className="px-4 py-2 border-b border-border flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">Output</span>
                  {output && (
                    <>
                      <span className="text-success">✓ {stats.passed} passed</span>
                      <span className="text-destructive">✗ {stats.failed} failed</span>
                      <span className="text-muted-foreground inline-flex items-center gap-1"><Clock className="w-3 h-3" />{output.ms}ms</span>
                    </>
                  )}
                </div>
                <pre className="flex-1 min-h-0 overflow-auto p-4 font-mono text-xs leading-relaxed">
                  {run === "running" && <span className="text-info">Running in sandbox...</span>}
                  {output && (
                    <>
                      {output.stdout && <span className="text-foreground">{output.stdout}</span>}
                      {output.stderr && <span className="text-destructive">{output.stderr}</span>}
                      <span className="text-muted-foreground">{"\n"}exit code: {output.exit} · duration: {output.ms}ms</span>
                    </>
                  )}
                  {!output && run === "idle" && <span className="text-muted-foreground">Press Run Tests or Ctrl/Cmd+Enter to execute.</span>}
                </pre>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-border flex items-center gap-2 bg-muted/20">
              <Button
                onClick={runTests}
                disabled={sync !== "synced" || run === "running" || !tests.trim()}
                className="bg-gradient-brand text-primary-foreground hover:opacity-90 h-10"
              >
                {run === "running" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                {run === "running" ? "Running..." : "Run Tests"}
              </Button>
              <Button variant="ghost" onClick={clear} className="h-10">
                <RotateCcw className="w-4 h-4 mr-2" /> Clear
              </Button>
              <div className="flex-1" />
              {lastMs !== null && <span className="text-xs text-muted-foreground">Last run: {lastMs}ms</span>}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function RunBadge({ state }: { state: RunState }) {
  if (state === "idle") return null;
  const conf = {
    running: { cls: "bg-info/15 text-info border-info/30 animate-pulse", icon: Loader2, label: "RUNNING..." },
    passed: { cls: "bg-success/15 text-success border-success/30", icon: Check, label: "PASSED" },
    failed: { cls: "bg-destructive/15 text-destructive border-destructive/30", icon: AlertTriangle, label: "FAILED" },
  }[state];
  const Icon = conf.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border", conf.cls)}>
      <Icon className={cn("w-3 h-3", state === "running" && "animate-spin")} />
      {conf.label}
    </span>
  );
}
